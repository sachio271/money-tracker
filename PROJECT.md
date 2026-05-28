# Money Tracker — Project Briefing

A personal money management web app (PWA) for me and a few friends, with strict per-user data isolation.

## Goals

Answer the question **"where does my money go?"** every month. Track income, expenses, and transfers across multiple accounts (cash, bank, e-wallets), broken down by category, with budgets and charts.

## Users

Me + a small number of friends. Each user sees only their own data — enforced at the database layer with Postgres Row Level Security.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Hosting:** Vercel (free tier)
- **Database:** Supabase Postgres (free tier, includes auth + RLS)
- **ORM:** Drizzle
- **Auth:** Supabase Auth (magic link + Google OAuth)
- **UI:** Tailwind CSS + shadcn/ui primitives
- **Charts:** Recharts or Tremor
- **Forms/validation:** Zod + React Hook Form
- **PWA:** Native Next.js manifest + service worker (next-pwa or hand-rolled)

No native iOS app — distributed as a PWA via "Add to Home Screen" on Safari. Develop on any OS, no Mac required.

## Non-Negotiable Engineering Rules

1. **Money is integers, never floats.** Store amounts in the smallest currency unit. For IDR (no minor unit), that's whole rupiah. For USD, cents. Format only at the display layer.
2. **All timestamps stored in UTC** with `timestamp with time zone`. Convert to user's local TZ (WIB / UTC+7 by default) at render time. Never compare dates as strings.
3. **Row Level Security is mandatory** on every user-scoped table. Application code should never be the only thing keeping users' data apart.
4. **Transfers are not expenses.** Use a dedicated `transfer` transaction type with both `accountId` and `toAccountId`. Reports filter them out.
5. **`occurredAt` vs `createdAt`.** Transactions are filed under when they happened, not when they were entered.

## Database Schema

(See full Drizzle definitions in `src/lib/db/schema.ts`.)

### Tables

- **accounts** — user's wallets (cash, bank, e-wallet, credit card). Has `openingBalance`, `currency`, `icon`, `color`.
- **categories** — income/expense buckets. Supports subcategories via `parentId` self-reference.
- **transactions** — the core table. `type` ∈ {income, expense, transfer}. `amount` always positive; sign is implied by `type`.
- **budgets** — per-category spending limits, monthly by default.
- **recurring_rules** — templates that auto-generate transactions on a schedule. Materialized by a daily Vercel Cron job.

### Key Indexes

- `transactions(user_id, occurred_at)` — for monthly reports
- `transactions(category_id)` — for category drill-downs
- `accounts(user_id)`, `categories(user_id)`, `budgets(user_id)` — for list views

### Row Level Security

Every user-owned table has policies like:

```sql
create policy "users see own X" on X
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

No exceptions. Enable RLS on every table before inserting any data.

## Recurring Transactions Strategy

**Materialize ahead, don't compute on read.**

- A daily cron job (Vercel Cron → `/api/cron/recurring`) finds rules where `lastMaterializedAt` is older than the next due date.
- For each due rule, insert a real transaction with `recurringRuleId` set.
- Update `lastMaterializedAt`.

This keeps the read path simple — recurring transactions are just normal transactions. Editing/deleting a future occurrence is just editing/deleting a row.

## Build Order

Don't build everything at once. Ship steps 1–3, use the app yourself for a week, then iterate.

1. Supabase project setup, auth working, base schema migrated with RLS policies
2. Manual transaction CRUD + categories + accounts (the boring foundation)
3. Monthly summary view + transaction list with filters — **this is the MVP**
4. Budgets (per-category limits with progress bars)
5. Charts (category breakdown pie, monthly trend line, budget vs actual bars)
6. Recurring transactions
7. PWA polish (manifest, icons, service worker, install prompt, offline shell)
8. CSV export
9. Nice-to-haves: search, tags, attachments, sharing a budget with a partner

## Screens (MVP)

- `/login` — Supabase Auth UI
- `/` (dashboard) — current month totals, recent transactions, account balances
- `/transactions` — list, filter by month/category/account, infinite scroll
- `/transactions/new` — the most-touched screen; optimize for one-handed thumb use
- `/accounts` — list + per-account history
- `/categories` — manage list, icons, colors, archive
- `/reports` — monthly breakdown by category (pie + table)

## iOS PWA Quirks to Know

- Install via Safari → Share → "Add to Home Screen"
- Push notifications require iOS 16.4+ and only work after install
- No background sync — recurring rule materialization must happen server-side
- Status bar styling needs `apple-mobile-web-app-status-bar-style` meta tag
- Provide a 180×180 `apple-touch-icon.png` and a 512×512 maskable icon

## Setup Commands

```bash
npx create-next-app@latest money-tracker --typescript --tailwind --app --src-dir
cd money-tracker
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers
npm install -D drizzle-kit @types/node
```

Then:
1. Create a Supabase project at supabase.com
2. Copy the connection string + anon key into `.env.local`
3. Define schema in `src/lib/db/schema.ts`
4. Run `npx drizzle-kit push` to sync
5. Apply RLS policies via Supabase SQL editor
6. Set up Supabase Auth providers (email magic link + Google)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=                   # Supabase connection pooler URL for Drizzle
CRON_SECRET=                    # for protecting /api/cron/recurring
```

## Money Formatting Helper (sketch)

```typescript
// src/lib/money.ts
const FORMATTERS: Record<string, Intl.NumberFormat> = {
  IDR: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }),
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
};

const MINOR_UNITS: Record<string, number> = { IDR: 0, USD: 2, JPY: 0, EUR: 2 };

export function formatMoney(amount: number, currency = 'IDR'): string {
  const minorUnits = MINOR_UNITS[currency] ?? 2;
  const value = amount / Math.pow(10, minorUnits);
  return (FORMATTERS[currency] ?? new Intl.NumberFormat()).format(value);
}

export function parseMoney(input: string, currency = 'IDR'): number {
  const digits = input.replace(/[^\d]/g, '');
  const minorUnits = MINOR_UNITS[currency] ?? 2;
  // Assume input is already in major units; multiply up
  return Math.round(parseFloat(digits || '0') * Math.pow(10, minorUnits));
}
```

## What's Out of Scope (for now)

- Multi-currency conversion
- Receipt photo OCR
- Bank/e-wallet API integrations (Plaid-style)
- Native iOS/Android apps
- Shared/household accounts (each user is isolated)

These are all deferrable. Don't let them slow down the MVP.

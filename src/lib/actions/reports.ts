"use server";

import { db } from "@/lib/db";
import { transactions, categories } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, gte, lte } from "drizzle-orm";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getMonthlyReport(year: number, month: number) {
  const userId = await getUserId();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const rows = await db
    .select({
      amount: transactions.amount,
      type: transactions.type,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.occurredAt, from),
        lte(transactions.occurredAt, to),
      ),
    );

  const expenseMap: Record<string, { name: string; total: number }> = {};
  const incomeMap: Record<string, { name: string; total: number }> = {};

  for (const row of rows) {
    if (row.type === "transfer") continue;
    const key = row.categoryId ?? "uncategorized";
    const name = row.categoryName ?? "Uncategorized";
    const map = row.type === "expense" ? expenseMap : incomeMap;
    if (!map[key]) map[key] = { name, total: 0 };
    map[key].total += row.amount;
  }

  const toArray = (map: Record<string, { name: string; total: number }>) => {
    const arr = Object.values(map).sort((a, b) => b.total - a.total);
    const grand = arr.reduce((s, r) => s + r.total, 0);
    return arr.map((r) => ({
      ...r,
      percentage: grand > 0 ? Math.round((r.total / grand) * 100) : 0,
    }));
  };

  return {
    expenses: toArray(expenseMap),
    income: toArray(incomeMap),
  };
}

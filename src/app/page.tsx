import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAccounts } from "@/lib/actions/accounts";
import { getTransactions } from "@/lib/actions/transactions";
import { getCurrentCycleLabel } from "@/lib/cycle";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ChevronRight, Settings } from "lucide-react";

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { year, month } = await getCurrentCycleLabel(user.id);
  const [accountsList, txns] = await Promise.all([
    getAccounts(),
    getTransactions(year, month),
  ]);

  const income = txns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = txns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const recent = txns.slice(0, 5);
  const monthName = new Date(year, month - 1, 1).toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{monthName}</p>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Link
          href="/settings"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 text-gray-600"
        >
          <Settings size={18} />
        </Link>
      </div>

      {/* Net balance hero */}
      <div className="bg-gray-900 rounded-3xl p-6 text-white">
        <p className="text-gray-400 text-sm mb-1">This Month</p>
        <p
          className={`text-4xl font-bold tracking-tight ${net >= 0 ? "text-white" : "text-rose-400"}`}
        >
          {formatIDR(net)}
        </p>
        <div className="flex gap-6 mt-5">
          <div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs mb-0.5">
              <ArrowUpRight size={12} /> Income
            </div>
            <p className="text-white font-semibold">{formatIDR(income)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-rose-400 text-xs mb-0.5">
              <ArrowDownRight size={12} /> Expenses
            </div>
            <p className="text-white font-semibold">{formatIDR(expense)}</p>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Accounts</h2>
          <Link
            href="/accounts"
            className="text-sm text-gray-400 flex items-center gap-0.5 hover:text-gray-600"
          >
            Manage <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-2">
          {accountsList.length === 0 && (
            <Link
              href="/accounts"
              className="block bg-white rounded-2xl p-4 text-sm text-gray-400 text-center border-2 border-dashed border-gray-200"
            >
              + Add your first account
            </Link>
          )}
          {accountsList.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 font-bold text-sm">
                  {a.name[0]}
                </div>
                <p className="font-medium text-gray-900">{a.name}</p>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {a.currency}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Recent</h2>
          <Link
            href="/transactions"
            className="text-sm text-gray-400 flex items-center gap-0.5 hover:text-gray-600"
          >
            See all <ChevronRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-gray-400 shadow-sm">
            No transactions this month
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      t.type === "income"
                        ? "bg-emerald-100"
                        : t.type === "expense"
                          ? "bg-rose-100"
                          : "bg-sky-100"
                    }`}
                  >
                    {t.type === "income" ? (
                      <ArrowUpRight size={15} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={15} className="text-rose-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t.note ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(t.occurredAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold text-sm ${
                    t.type === "income"
                      ? "text-emerald-600"
                      : t.type === "expense"
                        ? "text-rose-500"
                        : "text-sky-500"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatIDR(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

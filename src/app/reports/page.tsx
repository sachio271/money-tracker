import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMonthlyReport } from "@/lib/actions/reports";
import ExpenseChart from "./expense-chart";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year ?? now.getFullYear());
  const month = Number(params.month ?? now.getMonth() + 1);

  const { expenses, income } = await getMonthlyReport(year, month);

  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {MONTHS[month - 1]} {year}
          </p>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        </div>
      </div>

      <ExpenseChart data={expenses} title="Expenses by Category" />
      <ExpenseChart data={income} title="Income by Category" />
    </main>
  );
}

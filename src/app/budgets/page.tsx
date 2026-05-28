import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBudgets } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";
import BudgetList from "./budget-list";

export default async function BudgetsPage({
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

  const [budgetList, categoriesList] = await Promise.all([
    getBudgets(year, month),
    getCategories(),
  ]);

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
    <main className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-5">
        <p className="text-sm text-gray-400">
          {MONTHS[month - 1]} {year}
        </p>
        <h1 className="text-xl font-bold text-gray-900">Budgets</h1>
      </div>
      <BudgetList budgets={budgetList} categories={categoriesList} />
    </main>
  );
}

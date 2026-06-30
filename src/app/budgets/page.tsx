import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBudgets } from "@/lib/actions/budgets";
import { getCategories } from "@/lib/actions/categories";
import { getCurrentCycleLabel } from "@/lib/cycle";
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
  const current = await getCurrentCycleLabel(user.id);
  const year = Number(params.year ?? current.year);
  const month = Number(params.month ?? current.month);

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

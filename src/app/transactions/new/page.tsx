import { getAccounts } from "@/lib/actions/accounts";
import { getCategories } from "@/lib/actions/categories";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TransactionForm from "./transaction-form";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [accountsList, categoriesList] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Transaction</h1>
      <TransactionForm accounts={accountsList} categories={categoriesList} />
    </main>
  );
}

import { getAccounts } from "@/lib/actions/accounts";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AccountsList from "./accounts-list";

export default async function AccountsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const accountsList = await getAccounts();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
      </div>
      <AccountsList accounts={accountsList} />
    </main>
  );
}

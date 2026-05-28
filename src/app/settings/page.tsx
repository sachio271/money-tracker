import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet, Tag, ChevronRight } from "lucide-react";
import LogoutButton from "@/components/logout-button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
          Manage
        </p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
          <Link
            href="/accounts"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <Wallet size={17} className="text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Accounts</p>
                <p className="text-xs text-gray-400">Manage your bank & cash accounts</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
          <Link
            href="/categories"
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                <Tag size={17} className="text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Categories</p>
                <p className="text-xs text-gray-400">Organize your income & expenses</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </Link>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">
          Account
        </p>
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Signed in as</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

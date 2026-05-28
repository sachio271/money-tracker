"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
    >
      <LogOut size={18} />
    </button>
  );
}

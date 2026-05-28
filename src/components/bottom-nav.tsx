"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, Plus, BarChart2, PiggyBank } from "lucide-react";

const NAV = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Txns" },
  null,
  { href: "/budgets", icon: PiggyBank, label: "Budgets" },
  { href: "/reports", icon: BarChart2, label: "Reports" },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/auth"))
    return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV.map((item, i) =>
          item === null ? (
            <Link
              key="fab"
              href="/transactions/new"
              className="flex items-center justify-center w-14 h-14 bg-gray-900 rounded-full -mt-6 shadow-xl hover:bg-gray-700 transition-colors"
            >
              <Plus size={26} className="text-white" strokeWidth={2.5} />
            </Link>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                isActive(item.href) ? "text-gray-900" : "text-gray-400"
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={isActive(item.href) ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] ${isActive(item.href) ? "font-semibold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}

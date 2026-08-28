"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, TrendingUp, Settings } from "lucide-react";

const TABS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: PieChart },
  { href: "/market", label: "Mercado", icon: TrendingUp },
  { href: "/settings", label: "Fixos & Renda", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0a0d12]/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                active ? "text-green-400" : "text-gray-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

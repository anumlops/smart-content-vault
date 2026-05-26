"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Clock, Tags, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/content/new", label: "", icon: Plus, fab: true },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/search?category=", label: "Categories", icon: Tags },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/search") return pathname === "/search";
    if (href === "/timeline") return pathname === "/timeline";
    if (href === "/content/new") return pathname === "/content/new";
    return false;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="flex items-center justify-around h-16 bg-background/90 backdrop-blur-xl border-t border-border px-2 pb-safe">
        {navItems.map((item) => {
          if (item.fab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center h-12 w-12 -mt-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                aria-label="Save Content"
              >
                <Plus className="h-6 w-6" />
              </Link>
            );
          }
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-full px-3 min-w-[60px] transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

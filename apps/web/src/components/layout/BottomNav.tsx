"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/content/new", label: "", icon: Plus, fab: true },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/search", label: "Browse", icon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ) },
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
      <div className="flex items-center justify-around h-14 bg-background/95 backdrop-blur-lg border-t border-border supports-[backdrop-filter]:bg-background/80 pb-safe">
        {navItems.map((item) => {
          if (item.fab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center h-11 w-11 -mt-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all touch-manipulation"
                aria-label="Save Content"
              >
                <Plus className="h-5 w-5" />
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
                "flex flex-col items-center justify-center gap-0.5 h-full px-4 min-w-[56px] transition-colors touch-manipulation",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold leading-tight tracking-wide uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

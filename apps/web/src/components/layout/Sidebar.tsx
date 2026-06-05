"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  Clock,
  BookmarkPlus,
  Plus,
} from "lucide-react";
import { CATEGORIES, CATEGORY_META } from "@shared/index";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/content/new", label: "Save New", icon: BookmarkPlus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 border-r bg-background/50 backdrop-blur-sm lg:flex lg:flex-col">
      <div className="flex flex-col flex-1 gap-1 p-3 overflow-y-auto">
        <Link href="/content/new">
          <Button className="w-full gap-2 mb-3 h-9 text-sm">
            <Plus className="h-4 w-4" />
            Save Content
          </Button>
        </Link>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-9 text-sm font-medium"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 mb-2 px-3">
          <div className="h-px bg-border" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </span>
          </div>
          {CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const isActive = pathname === `/search?category=${encodeURIComponent(category)}`;
            return (
              <Link key={category} href={`/search?category=${encodeURIComponent(category)}`}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-8 text-xs font-normal"
                >
                  <span className="text-sm shrink-0">{meta?.emoji ?? "\uD83D\uDCCC"}</span>
                  <span className="truncate min-w-0">{category}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

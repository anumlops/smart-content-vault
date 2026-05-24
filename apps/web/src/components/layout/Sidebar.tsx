"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Search,
  Clock,
  BookmarkPlus,
  Tags,
  BarChart3,
  Plus,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/content/new", label: "Save New", icon: BookmarkPlus },
];

const categoryItems = [
  { href: "/search?category=AI", label: "AI", color: "text-blue-400" },
  { href: "/search?category=Deep+Learning", label: "Deep Learning", color: "text-purple-400" },
  { href: "/search?category=Cybersecurity", label: "Cybersecurity", color: "text-red-400" },
  { href: "/search?category=Cryptocurrency", label: "Crypto", color: "text-yellow-400" },
  { href: "/search?category=Business", label: "Business", color: "text-green-400" },
  { href: "/search?category=Startups", label: "Startups", color: "text-orange-400" },
  { href: "/search?category=Technology", label: "Technology", color: "text-cyan-400" },
  { href: "/search?category=Motivation", label: "Motivation", color: "text-pink-400" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-64 border-r bg-background/50 backdrop-blur-xl lg:block">
      <div className="flex flex-col gap-1 p-4">
        <Link href="/content/new">
          <Button className="w-full gap-2 mb-4">
            <Plus className="h-4 w-4" />
            Save Content
          </Button>
        </Link>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <Tags className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Categories
            </span>
          </div>
          {categoryItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <div className={cn("h-2 w-2 rounded-full", item.color.replace("text-", "bg-"))} />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

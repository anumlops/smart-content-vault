"use client";

import Link from "next/link";
import { CATEGORY_META } from "@shared/index";
import { cn } from "@/lib/utils";

interface CategoryCardsProps {
  distribution: Record<string, number>;
}

export function CategoryCards({ distribution }: CategoryCardsProps) {
  const entries = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (entries.length === 0) return null;

  const maxCount = Math.max(...entries.map(([, c]) => c));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Categories</h3>
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([name, count]) => {
          const meta = CATEGORY_META[name];
          return (
            <Link key={name} href={`/search?category=${encodeURIComponent(name)}`}>
              <div className="glass-card-hover rounded-xl p-3.5 space-y-2 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-lg">{meta?.emoji ?? "\uD83D\uDCC1"}</span>
                  <span className="text-xs text-muted-foreground">{count} items</span>
                </div>
                <p className="text-sm font-medium text-foreground">{name}</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", meta?.bg ?? "bg-primary/30")}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

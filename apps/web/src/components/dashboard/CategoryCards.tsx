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
    <div className="space-y-3 w-full">
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Categories</h3>
      <div className="grid grid-cols-2 gap-1.5 md:gap-2 w-full">
        {entries.map(([name, count]) => {
          const meta = CATEGORY_META[name];
          return (
            <Link key={name} href={`/search?category=${encodeURIComponent(name)}`} className="block w-full min-w-0">
              <div className="content-card-hover p-2.5 md:p-3 space-y-1.5 md:space-y-2 active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-base shrink-0">{meta?.emoji ?? "\uD83D\uDCC1"}</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{count}</span>
                </div>
                <p className="text-xs font-medium text-foreground truncate">{name}</p>
                <div className="h-1 md:h-1.5 rounded-full bg-muted overflow-hidden w-full">
                  <div
                    className={cn("h-full rounded-full transition-all", meta?.bg ?? "bg-primary/30")}
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

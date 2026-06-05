"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { CATEGORY_META } from "@shared/index";
import { cn } from "@/lib/utils";
import type { SavedContent } from "@shared/index";

const dotColors = [
  "border-indigo-500 bg-indigo-500/20",
  "border-amber-500 bg-amber-500/20",
  "border-emerald-500 bg-emerald-500/20",
  "border-pink-500 bg-pink-500/20",
  "border-cyan-500 bg-cyan-500/20",
  "border-purple-500 bg-purple-500/20",
];

interface TimelineWidgetProps {
  items: SavedContent[];
}

export function TimelineWidget({ items }: TimelineWidgetProps) {
  const recent = items.slice(0, 6);

  if (recent.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Timeline</h3>
        <Link href="/timeline" className="text-xs text-primary font-medium hover:underline">
          View all
        </Link>
      </div>
      <div className="relative pl-1">
        {recent.map((item, i) => {
          const catMeta = item.category ? CATEGORY_META[item.category] : null;
          return (
            <Link key={item.id} href={`/content/${item.id}`} className="block">
              <div className="group relative flex gap-3 pb-3.5 last:pb-0 cursor-pointer">
                {i < recent.length - 1 && (
                  <div className="absolute left-[7px] top-[18px] w-px h-[calc(100%-8px)] bg-border" />
                )}
                <div className={cn(
                  "relative mt-1.5 w-[15px] h-[15px] rounded-full border-2 shrink-0",
                  dotColors[i % dotColors.length]
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title ?? "Untitled"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                    <span className="text-muted-foreground/40">&middot;</span>
                    <span className="text-xs capitalize text-muted-foreground">{item.contentType}</span>
                    {item.category && (
                      <>
                        <span className="text-muted-foreground/40">&middot;</span>
                        <span className={cn("text-xs", catMeta?.color)}>{item.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

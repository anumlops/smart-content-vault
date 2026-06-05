"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentCard } from "@/components/content/ContentCard";
import { useContentList } from "@/hooks/useContent";
import { Clock } from "lucide-react";
import type { SavedContent } from "@shared/index";

function groupByDate(items: SavedContent[]) {
  const groups: Record<string, SavedContent[]> = {};
  for (const item of items) {
    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }
  return groups;
}

export default function TimelinePage() {
  const { items, isLoading } = useContentList({ limit: 100 });
  const grouped = groupByDate(items);

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full">
        <div className="page-header">
          <h1 className="page-title">Timeline</h1>
          <p className="page-subtitle">Browse your saved content chronologically</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-40 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="h-24 md:h-28 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No timeline entries</h3>
            <p className="text-sm text-muted-foreground">
              Your saved content will appear here chronologically.
            </p>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <h2 className="text-sm font-semibold">{date}</h2>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {entries.length}
                  </span>
                </div>
                <div className="space-y-2 ml-6 border-l-2 border-border pl-3">
                  {entries.map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

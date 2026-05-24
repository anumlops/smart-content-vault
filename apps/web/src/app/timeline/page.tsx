"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentCard } from "@/components/content/ContentCard";
import { useContentList } from "@/hooks/useContent";
import { Clock } from "lucide-react";

function groupByDate(items: any[]) {
  const groups: Record<string, any[]> = {};
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground">
            Browse your saved content chronologically
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No timeline entries</h3>
            <p className="text-sm text-muted-foreground">
              Your saved content will appear here chronologically.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{date}</h2>
                  <span className="text-xs text-muted-foreground">
                    {entries.length} item{entries.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-2 ml-9 border-l-2 border-border pl-4">
                  {entries.map((item: any) => (
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

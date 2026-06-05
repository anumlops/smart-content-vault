"use client";

import { ContentCard, ContentCardSkeleton } from "./ContentCard";
import type { SavedContent } from "@shared/index";

interface ContentListProps {
  items: SavedContent[];
  loading?: boolean;
  emptyMessage?: string;
}

export function ContentList({ items, loading, emptyMessage }: ContentListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-base font-semibold mb-1">No content yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {emptyMessage ?? "Start by saving your first link to build your personal archive."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}

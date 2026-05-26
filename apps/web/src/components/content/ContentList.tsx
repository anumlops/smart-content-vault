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
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-semibold mb-1">No content yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {emptyMessage ?? "Start by saving your first link to build your personal archive."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  );
}

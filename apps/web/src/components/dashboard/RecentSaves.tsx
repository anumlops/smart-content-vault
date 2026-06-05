"use client";

import Link from "next/link";
import { Play, Camera, MessageCircle, FileText, Globe } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { SavedContent } from "@shared/index";
import { CATEGORY_META, CONTENT_TYPE_STYLES } from "@shared/index";

const typeIcons: Record<string, React.ReactNode> = {
  youtube: <Play className="h-3.5 w-3.5" />,
  instagram: <Camera className="h-3.5 w-3.5" />,
  twitter: <MessageCircle className="h-3.5 w-3.5" />,
  article: <FileText className="h-3.5 w-3.5" />,
  blog: <FileText className="h-3.5 w-3.5" />,
  website: <Globe className="h-3.5 w-3.5" />,
};

interface RecentSavesProps {
  items: SavedContent[];
}

export function RecentSaves({ items }: RecentSavesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Recently Saved</h3>
        {items.length > 5 && (
          <Link href="/timeline" className="text-xs text-primary font-medium hover:underline">
            View all
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">No saves yet. Start by adding your first link!</div>
      ) : (
        <div className="w-full divide-y divide-border/50">
          {items.slice(0, 5).map((item) => {
            const catMeta = item.category ? CATEGORY_META[item.category] : null;
            const typeStyle = CONTENT_TYPE_STYLES[item.contentType];
            return (
              <Link key={item.id} href={`/content/${item.id}`} className="block w-full active:bg-accent/50 transition-colors -mx-3 px-3">
                <div className="flex items-center gap-3 py-2.5">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    typeStyle?.bg ?? "bg-muted",
                    typeStyle?.color ?? "text-muted-foreground"
                  )}>
                    {typeIcons[item.contentType] ?? <Globe className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <span className="capitalize">{item.contentType}</span>
                      <span className="text-muted-foreground/40">&middot;</span>
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      {item.category && (
                        <>
                          <span className="text-muted-foreground/40">&middot;</span>
                          <span className={cn(catMeta?.color)}>{item.category}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

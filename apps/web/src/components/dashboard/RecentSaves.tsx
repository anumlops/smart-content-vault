"use client";

import Link from "next/link";
import { Clock, Play, Camera, MessageCircle, FileText, Globe } from "lucide-react";
import { cn, formatRelativeTime, getDomain } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { SavedContent } from "@content-archive/shared";
import { CATEGORY_META } from "@content-archive/shared";

const typeIcons: Record<string, React.ReactNode> = {
  youtube: <Play className="h-3.5 w-3.5" />,
  instagram: <Camera className="h-3.5 w-3.5" />,
  twitter: <MessageCircle className="h-3.5 w-3.5" />,
  article: <FileText className="h-3.5 w-3.5" />,
  blog: <FileText className="h-3.5 w-3.5" />,
  website: <Globe className="h-3.5 w-3.5" />,
};

const typeColors: Record<string, string> = {
  youtube: "bg-red-500/10 text-red-500",
  instagram: "bg-pink-500/10 text-pink-500",
  twitter: "bg-blue-500/10 text-blue-400",
  article: "bg-emerald-500/10 text-emerald-500",
  blog: "bg-orange-500/10 text-orange-500",
  website: "bg-purple-500/10 text-purple-500",
};

interface RecentSavesProps {
  items: SavedContent[];
}

export function RecentSaves({ items }: RecentSavesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recently Saved</h3>
        {items.length > 5 && (
          <Link href="/timeline" className="text-xs text-primary hover:underline">
            View all
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No saves yet. Start by adding your first link!
        </div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => {
            const catMeta = item.category ? CATEGORY_META[item.category] : null;
            return (
              <Link key={item.id} href={`/content/${item.id}`}>
                <div className="group flex items-center gap-3 p-3 rounded-xl glass-card-hover cursor-pointer">
                  <div className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                    typeColors[item.contentType] ?? "bg-muted text-muted-foreground"
                  )}>
                    {typeIcons[item.contentType] ?? <Globe className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {item.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.contentType && <span className="capitalize">{item.contentType}</span>}
                      <span className="mx-1">&middot;</span>
                      {formatRelativeTime(item.createdAt)}
                      <span className="mx-1">&middot;</span>
                      {getDomain(item.url)}
                    </p>
                  </div>
                  {item.category && (
                    <Badge variant="secondary" className={cn(
                      "text-[10px] px-2 py-0 h-5 font-medium shrink-0",
                      catMeta?.bg,
                      catMeta?.color
                    )}>
                      {item.category}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

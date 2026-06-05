"use client";

import Link from "next/link";
import { Play, Camera, MessageCircle, FileText, Globe, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CONTENT_TYPE_STYLES } from "@shared/index";
import type { SearchResult } from "@shared/index";

const typeIcons: Record<string, React.ReactNode> = {
  youtube: <Play className="h-3.5 w-3.5" />,
  instagram: <Camera className="h-3.5 w-3.5" />,
  twitter: <MessageCircle className="h-3.5 w-3.5" />,
  article: <FileText className="h-3.5 w-3.5" />,
  blog: <FileText className="h-3.5 w-3.5" />,
  website: <Globe className="h-3.5 w-3.5" />,
};

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  total?: number;
  loading?: boolean;
}

export function SearchResults({ results, query, total, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-2 mt-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Globe className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          No matches for &ldquo;{query}&rdquo;. Try different keywords or browse your categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-5 w-full">
      <p className="text-sm text-muted-foreground">
        Found {total ?? results.length} result{total !== 1 && "s"} for &ldquo;{query}&rdquo;
      </p>

      <div className="w-full divide-y divide-border/50">
        {results.map((result) => {
          const c = result.content;
          const typeStyle = CONTENT_TYPE_STYLES[c.contentType];
          return (
            <Link key={c.id} href={`/content/${c.id}`} className="block w-full active:bg-accent/50 transition-colors -mx-3 px-3 first:-mt-2">
              <div className="flex gap-3 py-3">
                <div className={cn(
                  "w-[68px] h-[52px] shrink-0 rounded-lg flex items-center justify-center overflow-hidden",
                  typeStyle?.bg ?? "bg-muted"
                )}>
                  {c.thumbnailUrl ? (
                    <img
                      src={c.thumbnailUrl}
                      alt=""
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-muted-foreground/40">
                      {typeIcons[c.contentType] ?? <Globe className="h-5 w-5" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {c.title ?? "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
                    {c.description ?? "No description available"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {c.category && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        {c.category}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 capitalize">
                      {typeIcons[c.contentType]}
                      {c.contentType}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center shrink-0 ml-1 min-w-[32px]">
                  <span className="text-base font-bold text-primary tabular-nums">{Math.round(result.score * 100)}</span>
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Match</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

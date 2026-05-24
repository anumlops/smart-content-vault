"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Play, Camera, MessageCircle, FileText, Globe, Sparkles, Clock } from "lucide-react";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@content-archive/shared";

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
      <div className="space-y-3 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4 opacity-50">&#128269;</div>
        <h3 className="text-lg font-semibold mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          No matches for &ldquo;{query}&rdquo;. Try different keywords or browse your categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {total ?? results.length} result{total !== 1 && "s"} for &ldquo;{query}&rdquo;
        </p>
        {results.some(r => r.matchType !== "keyword") && (
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Sparkles className="h-3 w-3" />
            AI-powered
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {results.map((result) => {
          const c = result.content;
          return (
            <Link key={c.id} href={`/content/${c.id}`}>
              <div className="group flex gap-3 p-4 rounded-xl glass-card-hover">
                <div className="w-[72px] h-[54px] shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/40 overflow-hidden border border-border/30">
                  {c.thumbnailUrl ? (
                    <img src={c.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                  ) : (
                    typeIcons[c.contentType] ?? <Globe className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {c.title ?? "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {c.description ?? c.summary ?? "No description available"}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {c.category && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20">
                        {c.category}
                      </Badge>
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
                <div className="flex flex-col items-center justify-center shrink-0 ml-2">
                  <span className="text-lg font-bold text-primary">{Math.round(result.score * 100)}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Match</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

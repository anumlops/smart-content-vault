"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Camera,
  MessageCircle,
  FileText,
  Globe,
  Clock,
} from "lucide-react";
import { cn, formatRelativeTime, getDomain, decodeHtmlEntities } from "@/lib/utils";
import { getPlaceholderPath } from "@/lib/thumbnail";
import { CATEGORY_META } from "@shared/index";
import type { SavedContent } from "@shared/index";

const typeIcons: Record<string, React.ReactNode> = {
  youtube: <Play className="h-3 w-3" />,
  instagram: <Camera className="h-3 w-3" />,
  twitter: <MessageCircle className="h-3 w-3" />,
  article: <FileText className="h-3 w-3" />,
  blog: <FileText className="h-3 w-3" />,
  website: <Globe className="h-3 w-3" />,
};

const typeColors: Record<string, string> = {
  youtube: "bg-red-500/10 text-red-500 border-red-500/20",
  instagram: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  twitter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  article: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  blog: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  website: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

interface ContentCardProps {
  content: SavedContent;
  score?: number;
}

export function ContentCard({ content, score }: ContentCardProps) {
  const catMeta = content.category ? CATEGORY_META[content.category] : null;
  const placeholderPath = getPlaceholderPath(content.url);
  const hasThumb = content.thumbnailUrl;

  return (
    <Link href={`/content/${content.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30 glass glass-hover">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="relative aspect-video sm:w-48 sm:aspect-auto sm:min-h-[132px] overflow-hidden bg-muted">
              {hasThumb ? (
                <img
                  src={content.thumbnailUrl!}
                  alt={content.title ?? ""}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = placeholderPath;
                  }}
                />
              ) : (
                <img
                  src={placeholderPath}
                  alt=""
                  className="object-cover w-full h-full opacity-60"
                />
              )}
              <div className={cn(
                "absolute top-2 left-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium",
                typeColors[content.contentType] ?? "bg-muted/80 text-muted-foreground"
              )}>
                {typeIcons[content.contentType] ?? <Globe className="h-3 w-3" />}
                {content.contentType}
              </div>
            </div>
            <div className="flex-1 p-4 space-y-2 min-w-0">
              <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors break-words">
                {decodeHtmlEntities(content.title) || getDomain(content.url)}
              </h3>

              {content.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {decodeHtmlEntities(content.description)}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(content.createdAt)}
                </span>
                <span className="truncate max-w-[150px]">{getDomain(content.url)}</span>
                {catMeta && (
                  <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 font-medium", catMeta.bg, catMeta.color)}>
                    {content.category}
                  </Badge>
                )}
              </div>

              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {content.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  {content.tags.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">
                      +{content.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <Skeleton className="aspect-video sm:w-48 sm:aspect-auto sm:min-h-[132px]" />
          <div className="flex-1 p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

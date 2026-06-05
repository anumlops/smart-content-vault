"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
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
import { CATEGORY_META, CONTENT_TYPE_STYLES } from "@shared/index";
import type { SavedContent } from "@shared/index";

const typeIcons: Record<string, React.ReactNode> = {
  youtube: <Play className="h-3 w-3" />,
  instagram: <Camera className="h-3 w-3" />,
  twitter: <MessageCircle className="h-3 w-3" />,
  article: <FileText className="h-3 w-3" />,
  blog: <FileText className="h-3 w-3" />,
  website: <Globe className="h-3 w-3" />,
};

interface ContentCardProps {
  content: SavedContent;
  score?: number;
}

export function ContentCard({ content, score }: ContentCardProps) {
  const catMeta = content.category ? CATEGORY_META[content.category] : null;
  const placeholderPath = getPlaceholderPath(content.url);
  const hasThumb = content.thumbnailUrl;
  const typeStyle = CONTENT_TYPE_STYLES[content.contentType];

  return (
    <Link href={`/content/${content.id}`} className="block w-full min-w-0">
      <div className="content-card-hover active:scale-[0.99] transition-transform">
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-video sm:w-44 sm:aspect-auto sm:min-h-[120px] overflow-hidden bg-muted">
            {hasThumb ? (
              <img
                src={content.thumbnailUrl!}
                alt={content.title ?? ""}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
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
              "absolute top-2 left-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium border-transparent",
              typeStyle?.bg ?? "bg-muted/80",
              typeStyle?.color ?? "text-muted-foreground",
            )}>
              {typeIcons[content.contentType] ?? <Globe className="h-3 w-3" />}
              {content.contentType}
            </div>
          </div>
          <div className="flex-1 p-3 md:p-4 space-y-1.5 min-w-0 overflow-hidden">
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 break-words">
              {decodeHtmlEntities(content.title) || getDomain(content.url)}
            </h3>

            {content.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {decodeHtmlEntities(content.description)}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(content.createdAt)}
              </span>
              <span className="text-muted-foreground/40">&middot;</span>
              <span className="truncate min-w-0 max-w-[100px] sm:max-w-[150px]">{getDomain(content.url)}</span>
              {catMeta && (
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0", catMeta.bg, catMeta.color)}>
                  {content.category}
                </span>
              )}
            </div>

            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5 overflow-hidden">
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
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="content-card w-full">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="aspect-video sm:w-44 sm:aspect-auto sm:min-h-[120px]" />
        <div className="flex-1 p-3 md:p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

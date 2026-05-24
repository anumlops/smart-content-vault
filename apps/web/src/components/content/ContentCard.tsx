"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  Camera,
  MessageCircle,
  FileText,
  Globe,
  Clock,
  ExternalLink,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, formatRelativeTime, truncate, getDomain } from "@/lib/utils";
import type { SavedContent, ProcessingStatus } from "@content-archive/shared";

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

const statusConfig: Record<ProcessingStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: "Queued", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  processing: { label: "AI Processing", className: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  completed: { label: "Ready", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: null },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-500 border-red-500/20", icon: <AlertCircle className="h-3 w-3" /> },
};

interface ContentCardProps {
  content: SavedContent;
  score?: number;
}

export function ContentCard({ content, score }: ContentCardProps) {
  const status = statusConfig[content.processingStatus] ?? statusConfig.pending;

  return (
    <Link href={`/content/${content.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30 glass glass-hover">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {content.thumbnailUrl && (
              <div className="relative aspect-video sm:w-48 sm:aspect-auto sm:min-h-[120px] overflow-hidden bg-muted">
                <img
                  src={content.thumbnailUrl}
                  alt={content.title ?? ""}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className={cn(
                  "absolute top-2 left-2 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium",
                  typeColors[content.contentType] ?? "bg-muted/80 text-muted-foreground"
                )}>
                  {typeIcons[content.contentType] ?? <Globe className="h-3 w-3" />}
                  {content.contentType}
                </div>
              </div>
            )}
            <div className="flex-1 p-4 space-y-2 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {content.title ?? "Untitled"}
                </h3>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>

              {content.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {content.description}
                </p>
              )}

              {content.summary && (
                <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
                  {truncate(content.summary, 120)}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {content.processingStatus !== "completed" && (
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 gap-1", status.className)}>
                    {status.icon}
                    {status.label}
                  </Badge>
                )}
                {content.category && (
                  <Badge variant="secondary" className="text-xs">
                    {content.category}
                  </Badge>
                )}
                {content.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
                {score != null && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    Match: {Math.round(score * 100)}%
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(content.createdAt)}
                </span>
                <span>{getDomain(content.url)}</span>
              </div>
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
          <Skeleton className="aspect-video sm:w-48 sm:aspect-auto sm:min-h-[120px]" />
          <div className="flex-1 p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

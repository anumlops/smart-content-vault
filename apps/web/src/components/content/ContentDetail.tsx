"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Clock,
  Calendar,
  Trash2,
  Link as LinkIcon,
  Play,
  Globe,
  Camera,
  MessageCircle,
  FileText,
} from "lucide-react";
import { formatDate, getDomain, decodeHtmlEntities } from "@/lib/utils";
import type { SavedContent } from "@shared/index";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ReactNode> = {
  youtube: <Play className="h-4 w-4" />,
  instagram: <Camera className="h-4 w-4" />,
  twitter: <MessageCircle className="h-4 w-4" />,
  article: <FileText className="h-4 w-4" />,
  blog: <FileText className="h-4 w-4" />,
  website: <Globe className="h-4 w-4" />,
};

interface ContentDetailProps {
  content: SavedContent;
  onDelete?: () => void;
}

export function ContentDetail({ content, onDelete }: ContentDetailProps) {
  return (
    <div className="space-y-6">
      {/* Thumbnail */}
      <div className={cn(
        "relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-border/50 flex items-center justify-center",
        content.thumbnailUrl && "border-0"
      )}>
        {content.thumbnailUrl ? (
          <img
            src={content.thumbnailUrl}
            alt={content.title ?? ""}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-4xl text-muted-foreground/30">
            {typeIcons[content.contentType] ?? <Globe className="h-16 w-16" />}
          </div>
        )}
      </div>

      {/* Title & Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <h1 className="text-2xl font-bold break-words">{decodeHtmlEntities(content.title) || getDomain(content.url)}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {typeIcons[content.contentType]}
            <span className="capitalize">{content.contentType}</span>
            <span className="text-muted-foreground/40">&middot;</span>
            {getDomain(content.url)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" asChild>
            <a href={content.url} target="_blank" rel="noopener noreferrer" title="Open original">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          {onDelete && (
            <Button variant="destructive" size="icon" onClick={onDelete} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {content.description && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-5">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {decodeHtmlEntities(content.description)}
          </p>
        </div>
      )}

      <Separator />

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="text-sm font-medium">{formatDate(content.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-medium capitalize">{content.contentType}</p>
          </div>
        </div>
      </div>

      {/* Original URL */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
        <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline truncate"
        >
          {content.url}
        </a>
      </div>

      {/* Note */}
      {content.note && (
        <>
          <Separator />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Note</p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{decodeHtmlEntities(content.note)}</p>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getPlaceholderPath } from "@/lib/thumbnail";
import { CATEGORY_META } from "@shared/index";
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
  const catMeta = content.category ? CATEGORY_META[content.category] : null;
  const placeholderPath = getPlaceholderPath(content.url);
  const hasThumb = content.thumbnailUrl;

  return (
    <div className="space-y-6">
      <div className={cn(
        "relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border border-border/50 flex items-center justify-center",
        hasThumb && "border-0"
      )}>
        {hasThumb ? (
          <img
            src={content.thumbnailUrl!}
            alt={content.title ?? ""}
            className="object-cover w-full h-full"
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
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold break-words">
            {decodeHtmlEntities(content.title) || getDomain(content.url)}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
            {typeIcons[content.contentType]}
            <span className="capitalize">{content.contentType}</span>
            <span className="text-muted-foreground/40">&middot;</span>
            {getDomain(content.url)}
          </p>
          {catMeta && (
            <Badge variant="secondary" className={cn("text-xs px-2 py-0.5 font-medium", catMeta.bg, catMeta.color)}>
              {content.category}
            </Badge>
          )}
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

      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {content.tags.map((tag) => (
            <span key={tag} className="text-[11px] px-2 py-1 rounded-md bg-primary/5 text-primary border border-primary/10">
              {tag}
            </span>
          ))}
        </div>
      )}

      {content.description && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-5">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            {decodeHtmlEntities(content.description)}
          </p>
        </div>
      )}

      <Separator />

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
        {content.category && (
          <div className="flex items-center gap-2.5 text-sm">
            <div className={cn("h-4 w-4 shrink-0 rounded flex items-center justify-center text-[10px]", catMeta?.bg, catMeta?.color)}>
              {catMeta?.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium">{content.category}</p>
            </div>
          </div>
        )}
      </div>

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

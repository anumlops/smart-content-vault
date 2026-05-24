"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Clock,
  Calendar,
  Tag,
  Brain,
  Heart,
  GraduationCap,
  Trash2,
  Link as LinkIcon,
  Play,
  Globe,
  Camera,
  MessageCircle,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDate, getDomain, decodeHtmlEntities } from "@/lib/utils";
import type { SavedContent, ProcessingStatus } from "@content-archive/shared";
import { cn } from "@/lib/utils";

const statusConfig: Record<ProcessingStatus, { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: "Queued", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: <Clock className="h-3 w-3" /> },
  processing: { label: "AI Processing", className: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  completed: { label: "Ready", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: null },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-500 border-red-500/20", icon: <AlertCircle className="h-3 w-3" /> },
};

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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{decodeHtmlEntities(content.title) || "Untitled"}</h1>
            {content.processingStatus !== "completed" && (() => {
              const cfg = statusConfig[content.processingStatus];
              return (
                <Badge variant="outline" className={cn("text-[10px] px-2 py-0 gap-1 h-5", cfg?.className)}>
                  {cfg?.icon}
                  {cfg?.label}
                </Badge>
              );
            })()}
          </div>
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

      {/* Summary Box */}
      {content.summary && (
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Brain className="h-3.5 w-3.5 text-primary" />
            AI-Generated Summary
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {decodeHtmlEntities(content.summary)}
          </p>
        </div>
      )}

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/15 text-primary/90"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <Separator />

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Saved</p>
            <p className="text-sm font-medium">{formatDate(content.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-medium capitalize">{content.contentType}</p>
          </div>
        </div>
        {content.emotionalTone && (
          <div className="flex items-center gap-2.5 text-sm">
            <Heart className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Emotional Tone</p>
              <p className="text-sm font-medium capitalize">{content.emotionalTone}</p>
            </div>
          </div>
        )}
        {content.educationalRelevance != null && (
          <div className="flex items-center gap-2.5 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Educational</p>
              <p className="text-sm font-medium">{content.educationalRelevance}/10</p>
            </div>
          </div>
        )}
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
            <p className="text-sm text-foreground/80">{decodeHtmlEntities(content.note)}</p>
          </div>
        </>
      )}
    </div>
  );
}

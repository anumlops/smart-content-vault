"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, Loader2, Globe, Play, Camera, MessageCircle, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const typePatterns: { pattern: RegExp; type: string; icon: React.ReactNode }[] = [
  { pattern: /(youtube\.com|youtu\.be)/i, type: "YouTube", icon: <Play className="h-4 w-4" /> },
  { pattern: /instagram\.com/i, type: "Instagram", icon: <Camera className="h-4 w-4" /> },
  { pattern: /(twitter\.com|x\.com)/i, type: "Twitter / X", icon: <MessageCircle className="h-4 w-4" /> },
  { pattern: /medium\.com/i, type: "Article", icon: <FileText className="h-4 w-4" /> },
  { pattern: /\.(org|com|io|dev|app)\//i, type: "Website", icon: <Globe className="h-4 w-4" /> },
];

const typeColors: Record<string, string> = {
  YouTube: "bg-red-500/10 text-red-500",
  Instagram: "bg-pink-500/10 text-pink-500",
  "Twitter / X": "bg-blue-500/10 text-blue-400",
  Article: "bg-emerald-500/10 text-emerald-500",
  Website: "bg-violet-500/10 text-violet-500",
};

function detectContentType(url: string): { type: string; icon: React.ReactNode } | null {
  for (const { pattern, type, icon } of typePatterns) {
    if (pattern.test(url)) return { type, icon };
  }
  if (url.length > 0) return { type: "Website", icon: <Globe className="h-4 w-4" /> };
  return null;
}

function isValidUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ContentForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [detected, setDetected] = useState<{ type: string; icon: React.ReactNode } | null>(null);

  useEffect(() => {
    if (url.trim().length === 0) {
      setIsValid(null);
      setDetected(null);
      return;
    }
    const valid = isValidUrl(url.trim());
    setIsValid(valid);
    if (valid) {
      setDetected(detectContentType(url.trim()));
    } else {
      setDetected(null);
    }
  }, [url]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !isValid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), note: note.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save content");
      }

      const data = await res.json();
      toast({
        title: "Content saved!",
        description: "Link has been archived successfully.",
      });
      router.push(`/content/${data.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">Save New Content</CardTitle>
        <CardDescription>
          Paste any link \u2014 YouTube, Instagram, Twitter/X, articles, or any website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="content-url" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              URL
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input
                id="content-url"
                placeholder="https://youtube.com/watch?v=\u2026"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={cn(
                  "w-full pl-9 h-11 md:h-12 text-sm pr-10",
                  isValid === true && "border-emerald-500/50 focus:border-emerald-500",
                  isValid === false && "border-destructive/50 focus:border-destructive"
                )}
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
              />
              {url && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValid === true && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {isValid === false && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
              )}
            </div>
            {isValid === false && (
              <p className="text-xs text-destructive flex items-center gap-1" role="alert">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid URL (https://\u2026)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="content-notes" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Notes <span className="font-normal normal-case text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              id="content-notes"
              placeholder="Add your notes or thoughts about this content\u2026"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={loading}
            />
          </div>

          {detected && isValid && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0",
                typeColors[detected.type] ?? "bg-muted text-muted-foreground"
              )}>
                {detected.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{detected.type} detected</p>
                <p className="text-xs text-muted-foreground truncate">{url}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading || !url.trim() || !isValid} className="h-10 px-5 gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving\u2026
                </>
              ) : (
                "Save Content"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return target.toLocaleDateString();
}

export function formatDate(date: Date | string): string {
  const target = typeof date === "string" ? new Date(date) : date;
  return target.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getContentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    youtube: "Play",
    instagram: "Camera",
    twitter: "MessageCircle",
    article: "FileText",
    blog: "FileText",
    website: "Globe",
  };
  return icons[type] ?? "Link";
}

export function getContentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    youtube: "text-red-500",
    instagram: "text-pink-500",
    twitter: "text-blue-400",
    article: "text-green-500",
    blog: "text-orange-500",
    website: "text-purple-500",
  };
  return colors[type] ?? "text-muted-foreground";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "...";
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

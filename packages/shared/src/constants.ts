export const CATEGORIES = [
  "Programming",
  "AI",
  "Machine Learning",
  "MLOps",
  "DevOps",
  "Cloud",
  "Data Science",
  "Finance",
  "Business",
  "Productivity",
  "Career",
  "Health",
  "Fitness",
  "Relationships",
  "Education",
  "Entertainment",
  "Gaming",
  "Travel",
  "News",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string }> = {
  Programming: { emoji: "\u2328\uFE0F", color: "text-blue-400", bg: "bg-blue-500/10" },
  AI: { emoji: "\uD83E\uDD16", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  "Machine Learning": { emoji: "\uD83E\uDDE0", color: "text-purple-400", bg: "bg-purple-500/10" },
  MLOps: { emoji: "\u2699\uFE0F", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  DevOps: { emoji: "\uD83D\uDD27", color: "text-orange-400", bg: "bg-orange-500/10" },
  Cloud: { emoji: "\u2601\uFE0F", color: "text-sky-400", bg: "bg-sky-500/10" },
  "Data Science": { emoji: "\uD83D\uDCCA", color: "text-teal-400", bg: "bg-teal-500/10" },
  Finance: { emoji: "\uD83D\uDCB0", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  Business: { emoji: "\uD83C\uDFED", color: "text-green-400", bg: "bg-green-500/10" },
  Productivity: { emoji: "\uD83D\uDCCB", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  Career: { emoji: "\uD83D\uDCBC", color: "text-rose-400", bg: "bg-rose-500/10" },
  Health: { emoji: "\u2764\uFE0F", color: "text-red-400", bg: "bg-red-500/10" },
  Fitness: { emoji: "\uD83D\uDCAA", color: "text-lime-400", bg: "bg-lime-500/10" },
  Relationships: { emoji: "\uD83D\uDC91", color: "text-pink-400", bg: "bg-pink-500/10" },
  Education: { emoji: "\uD83C\uDF93", color: "text-sky-400", bg: "bg-sky-500/10" },
  Entertainment: { emoji: "\uD83C\uDFAC", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  Gaming: { emoji: "\uD83C\uDFAE", color: "text-violet-400", bg: "bg-violet-500/10" },
  Travel: { emoji: "\u2708\uFE0F", color: "text-amber-400", bg: "bg-amber-500/10" },
  News: { emoji: "\uD83D\uDCF0", color: "text-gray-400", bg: "bg-gray-500/10" },
  Other: { emoji: "\uD83D\uDCCC", color: "text-muted-foreground", bg: "bg-muted/50" },
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  twitter: "Twitter / X",
  article: "Article",
  blog: "Blog",
  website: "Website",
};

export const CONTENT_TYPE_ICONS: Record<string, string> = {
  youtube: "Play",
  instagram: "Camera",
  twitter: "MessageCircle",
  article: "FileText",
  blog: "FileText",
  website: "Globe",
};

export const SEARCH_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const API_ENDPOINTS = {
  CONTENT: "/api/content",
  SEARCH: "/api/search",
  INSIGHTS: "/api/insights",
} as const;

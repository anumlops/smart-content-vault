export const CATEGORIES = [
  "AI",
  "Deep Learning",
  "Computer Vision",
  "Cybersecurity",
  "Cryptocurrency",
  "Business",
  "Startups",
  "Emotional",
  "Family",
  "Motivation",
  "Automobile",
  "Technology",
  "Productivity",
  "Philosophy",
  "Finance",
  "Education",
  "Health",
  "Science",
  "Entertainment",
  "News",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string }> = {
  AI: { emoji: "\uD83E\uDD16", color: "text-blue-400", bg: "bg-blue-500/10" },
  "Deep Learning": { emoji: "\uD83E\uDDE0", color: "text-purple-400", bg: "bg-purple-500/10" },
  "Computer Vision": { emoji: "\uD83D\uDCF7", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  Cybersecurity: { emoji: "\uD83D\uDD12", color: "text-red-400", bg: "bg-red-500/10" },
  Cryptocurrency: { emoji: "\u20BF", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  Business: { emoji: "\uD83D\uDCCA", color: "text-green-400", bg: "bg-green-500/10" },
  Startups: { emoji: "\uD83D\uDE80", color: "text-orange-400", bg: "bg-orange-500/10" },
  Emotional: { emoji: "\uD83D\uDC9C", color: "text-pink-400", bg: "bg-pink-500/10" },
  Family: { emoji: "\uD83D\uDC6A", color: "text-rose-400", bg: "bg-rose-500/10" },
  Motivation: { emoji: "\uD83D\uDCAA", color: "text-orange-400", bg: "bg-orange-500/10" },
  Automobile: { emoji: "\uD83D\uDE97", color: "text-sky-400", bg: "bg-sky-500/10" },
  Technology: { emoji: "\uD83D\uDDA5\uFE0F", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  Productivity: { emoji: "\u2699\uFE0F", color: "text-teal-400", bg: "bg-teal-500/10" },
  Philosophy: { emoji: "\uD83E\uDDE9", color: "text-violet-400", bg: "bg-violet-500/10" },
  Finance: { emoji: "\uD83D\uDCB0", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  Education: { emoji: "\uD83C\uDF93", color: "text-sky-400", bg: "bg-sky-500/10" },
  Health: { emoji: "\u2764\uFE0F", color: "text-red-400", bg: "bg-red-500/10" },
  Science: { emoji: "\uD83D\uDD2C", color: "text-lime-400", bg: "bg-lime-500/10" },
  Entertainment: { emoji: "\uD83C\uDFAC", color: "text-fuchsia-400", bg: "bg-fuchsia-500/10" },
  News: { emoji: "\uD83D\uDCF0", color: "text-amber-400", bg: "bg-amber-500/10" },
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

export const EMOTIONAL_TONES = [
  "neutral",
  "positive",
  "negative",
  "inspirational",
  "humorous",
  "sad",
  "exciting",
  "thoughtful",
  "motivational",
  "educational",
] as const;

export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

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
  AI_PROCESS: "/api/ai/process",
} as const;

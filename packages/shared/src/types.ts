export enum ContentType {
  YOUTUBE = "youtube",
  INSTAGRAM = "instagram",
  TWITTER = "twitter",
  ARTICLE = "article",
  WEBSITE = "website",
  BLOG = "blog",
}

export enum ProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface SavedContent {
  id: string;
  userId: string;
  url: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  contentType: ContentType;
  note: string | null;
  summary: string | null;
  emotionalTone: string | null;
  educationalRelevance: number | null;
  category: string | null;
  tags: string[];
  processingStatus: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  content: SavedContent;
  score: number;
  matchType: "semantic" | "keyword" | "hybrid";
}

export interface SearchRequest {
  query: string;
  type?: "semantic" | "keyword" | "hybrid";
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface CreateContentRequest {
  url: string;
  note?: string;
  contentType?: ContentType;
}

export interface DashboardStats {
  totalSaves: number;
  categoryDistribution: Record<string, number>;
  recentSaves: SavedContent[];
  topTags: { tag: string; count: number }[];
  insights: string[];
  weeklyActivity: { date: string; count: number }[];
}

export interface TimelineEntry {
  date: string;
  relativeDate: string;
  items: SavedContent[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export interface AIPipelineResult {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  contentType: ContentType;
  summary: string;
  category: string;
  tags: string[];
  emotionalTone: string;
  educationalRelevance: number;
  embedding: number[];
}

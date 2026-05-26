import { decodeHtmlEntities } from "./utils";
import { categorize } from "./categorizer";
import { generateTags } from "./tag-generator";
import { getBestThumbnail } from "./thumbnail";

interface ExtractedMetadata {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  favicon: string | null;
  contentType: string;
  category: string;
  tags: string[];
}

function extractMeta(html: string, property: string): string | null {
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escapeRegex(property)}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegex(property)}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${escapeRegex(property)}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegex(property)}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

function getYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  const result: ExtractedMetadata = {
    title: "",
    description: "",
    thumbnailUrl: null,
    favicon: null,
    contentType: "website",
    category: "Other",
    tags: [],
  };

  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    result.contentType = "youtube";
    const videoId = getYoutubeId(url);
    if (videoId) {
      result.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          result.title = decodeHtmlEntities(oembedData.title || "");
          result.description = decodeHtmlEntities(oembedData.author_name || "");
        }
      } catch {
        // oEmbed failed — fall through to HTML extraction
      }
    }
  } else if (u.includes("instagram.com")) {
    result.contentType = "instagram";
  } else if (u.includes("twitter.com") || u.includes("x.com")) {
    result.contentType = "twitter";
  } else if (u.includes("medium.com") || u.includes("blog.")) {
    result.contentType = "blog";
  }

  if (!result.title) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const html = await response.text();
        const ogTitle = extractMeta(html, "og:title");
        const twitterTitle = extractMeta(html, "twitter:title");
        const ogDesc = extractMeta(html, "og:description");
        const twitterDesc = extractMeta(html, "twitter:description");
        const ogImage = extractMeta(html, "og:image");
        const twitterImage = extractMeta(html, "twitter:image");

        result.title = decodeHtmlEntities(ogTitle || twitterTitle || extractTitle(html) || "");
        result.description = decodeHtmlEntities(result.description || ogDesc || twitterDesc || extractMeta(html, "description") || "");
        result.thumbnailUrl = getBestThumbnail(result.thumbnailUrl, ogImage || twitterImage || null, url, result.contentType);
        result.favicon = `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`;
      }
    } catch {
      // fetch failed — use fallback title
    }
  }

  if (!result.title) {
    result.title = getDomain(url);
  }

  // Apply category and tags from title
  result.category = categorize(result.title, url);
  result.tags = generateTags(result.title, url);

  return result;
}

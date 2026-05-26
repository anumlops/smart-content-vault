import { decodeHtmlEntities } from "./utils";
import { NvidiaProvider, KeywordProvider } from "./providers";
import type { AIProvider, AIProviderResult } from "./providers";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const nvidiaProvider = new NvidiaProvider();
const keywordProvider = new KeywordProvider();

interface ExtractedMetadata {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  favicon: string | null;
  contentType: string;
  text: string;
}

const READABLE_MIN_LENGTH = 100;

interface ReadabilityResult {
  title: string;
  byline: string;
  text: string;
}

function extractYtInitialPlayerResponse(html: string): Record<string, any> | null {
  const marker = "ytInitialPlayerResponse";
  const startIdx = html.indexOf(marker);
  console.log(`[ytExtract] htmlLength=${html.length} markerFound=${startIdx !== -1} startIdx=${startIdx}`);
  if (startIdx === -1) return null;

  const braceStart = html.indexOf("{", startIdx);
  console.log(`[ytExtract] braceStart=${braceStart} contextAfterMarker="${html.slice(startIdx, startIdx + 80).replace(/\n/g, "\\n")}"`);
  if (braceStart === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  let endIdx = -1;

  for (let i = braceStart; i < html.length && i < braceStart + 200000; i++) {
    const ch = html[i];
    if (escape) { escape = false; continue; }
    if (inString) {
      if (ch === "\\") { escape = true; }
      else if (ch === '"') { inString = false; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{") { depth++; }
    else if (ch === "}") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }

  console.log(`[ytExtract] endIdx=${endIdx} depth=${depth} charsScanned=${endIdx !== -1 ? endIdx - braceStart : "N/A"}`);
  if (endIdx === -1) return null;
  const jsonSlice = html.slice(braceStart, endIdx + 1);
  try {
    const parsed = JSON.parse(jsonSlice);
    console.log(`[ytExtract] JSON.parse success hasVideoDetails=${!!parsed?.videoDetails}`);
    return parsed;
  } catch (err) {
    console.log(`[ytExtract] JSON.parse failed lastChars="${jsonSlice.slice(-50).replace(/\n/g, "\\n")}" firstChars="${jsonSlice.slice(0, 100).replace(/\n/g, "\\n")}"`);
    return null;
  }
}

function extractWithReadability(html: string, url: string): ReadabilityResult | null {
  try {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (article?.textContent) {
      const text = cleanText(article.textContent);
      if (text.length >= READABLE_MIN_LENGTH) {
        return { title: article.title || "", byline: article.byline || "", text };
      }
    }
  } catch {
    // Readability parse failure — fall back to regex
  }
  return null;
}

export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  const result: ExtractedMetadata = {
    title: "",
    description: "",
    thumbnailUrl: null,
    favicon: null,
    contentType: "website",
    text: "",
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
          if (oembedData.author_name) {
            result.description = decodeHtmlEntities(oembedData.author_name);
          }
          console.log(`[Extract] oembedTitle="${result.title}"`);
        }
      } catch {
        console.log(`[Extract] oembed failed — continuing`);
      }
    }
  } else if (u.includes("instagram.com")) {
    result.contentType = "instagram";
  } else if (u.includes("twitter.com") || u.includes("x.com")) {
    result.contentType = "twitter";
  } else if (u.includes("medium.com") || u.includes("blog.")) {
    result.contentType = "blog";
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
      },
      signal: AbortSignal.timeout(30000),
    });
    const contentType = response.headers.get("content-type") || "unknown";
    console.log(`[Extract] status=${response.status} contentType="${contentType}"`);

    if (!response.ok) {
      console.log(`[Extract] HTTP ${response.status} — returning early`);
      return result;
    }

    const html = await response.text();
    console.log(`[Extract] htmlLength=${html.length}`);
    const domain = new URL(url).hostname.replace("www.", "");
    result.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const ogTitle = extractMeta(html, "og:title");
    const ogDesc = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");
    const twitterTitle = extractMeta(html, "twitter:title");
    const twitterDesc = extractMeta(html, "twitter:description");
    const twitterImage = extractMeta(html, "twitter:image");

    result.title = decodeHtmlEntities(result.title || ogTitle || twitterTitle || extractTitle(html) || "");
    result.description = decodeHtmlEntities(result.description || ogDesc || twitterDesc || extractMeta(html, "description") || "");
    result.thumbnailUrl = result.thumbnailUrl || ogImage || twitterImage || null;

    if (result.contentType === "youtube") {
      console.log(`[Extract] ytCall htmlLength=${html.length} includesMarker=${html.includes("ytInitialPlayerResponse")}`);
      const ytData = extractYtInitialPlayerResponse(html);
      console.log(`[Extract] ytCall returnedNull=${!ytData} hasVideoDetails=${!!ytData?.videoDetails}`);
      if (ytData?.videoDetails) {
        const vd = ytData.videoDetails;
        console.log(`[Extract] ytCall videoDetails.title="${vd.title}" shortDescriptionLength=${vd.shortDescription?.length || 0}`);
        result.title = decodeHtmlEntities(vd.title || result.title);
        result.description = decodeHtmlEntities(vd.shortDescription || result.description);
        if (vd.shortDescription) {
          result.text = cleanText(vd.shortDescription).slice(0, 5000);
        }
      } else {
        console.log(`[Extract] ytInitialPlayerResponse not found in HTML`);
      }
    }

    if (!result.contentType || result.contentType === "website") {
      if (extractMeta(html, "og:type") === "article" || html.includes("article")) {
        result.contentType = "article";
      }
    }

    const readabilityResult = extractWithReadability(html, url);
    let usedFallback = false;
    if (!result.text) {
      if (readabilityResult) {
        result.title = decodeHtmlEntities(readabilityResult.title) || result.title;
        result.text = readabilityResult.text.slice(0, 5000);
      } else {
        usedFallback = true;
        const textContent = cleanText(extractTextContent(html));
        result.text = textContent.slice(0, 5000);
      }
    }
    console.log(
      `[Extract] readabilitySuccess=${!!readabilityResult}` +
      ` readabilityTitle="${readabilityResult?.title || ""}"` +
      ` readabilityTextLength=${readabilityResult?.text.length || 0}` +
      ` usedFallback=${usedFallback}` +
      ` finalTextLength=${result.text.length}` +
      ` finalTitle="${result.title}"`
    );
    if (result.text.length === 0) {
      console.log(`[Extract] No article extracted. First 500 HTML chars: ${html.slice(0, 500)}`);
    }
  } catch (err) {
    console.log(`[Extract] networkError="${(err as Error)?.message || err}" url="${url}"`);
  }

  return result;
}

function extractMeta(html: string, property: string): string | null {
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

const SOCIAL_BOILERPLATE = [
  /follow\s+(us|me|@\w+)/i,
  /subscribe\s+(to\s+)?(our\s+)?(channel|newsletter|blog)/i,
  /share\s+(this\s+)?(article|post|video|story)/i,
  /click\s+(here\s+)?(to\s+)?(subscribe|share|read|learn|sign\s+up)/i,
  /sign\s+up\s+(for\s+)?(our\s+)?(newsletter|updates|mailing\s+list)/i,
  /all\s+rights?\s+reserved/i,
  /copyright\s+©?\s*\d{4}/i,
  /\d{4}\s+©?\s+all\s+rights?\s+reserved/i,
  /privacy\s+(policy|settings?)/i,
  /terms\s+(of\s+)?(service|use|conditions?)/i,
  /cookie\s+(policy|settings|notice)/i,
  /read\s+(the\s+)?(full\s+)?(article|story|post)/i,
  /continue\s+reading/i,
  /view\s+(on\s+)?(twitter|github|linkedin|facebook|instagram|youtube)/i,
  /posted\s+(on|in)\s+(twitter|facebook|instagram|linkedin)/i,
  /originally\s+published\s+(on|at)/i,
  /this\s+(content|article|post)\s+was\s+(originally\s+)?(published|written)/i,
  /^\s*advertisement\s*$/i,
  /^\s*sponsored\s*$/i,
  /^\s*promoted\s*$/i,
  /^\s*photo(s)?\s*(by|credit|source)?\s*:?/i,
  /^\s*image(s)?\s*(by|credit|source)?\s*:?/i,
  /^\s*related\s+(articles?|posts?|stories?|videos?|content)/i,
  /^\s*you\s+might\s+(also\s+)?like/i,
  /^\s*more\s+(from|on)\s/i,
  /^\s*tags?\s*:/i,
  /^\s*share\s+this/i,
  /^\s*leave\s+a\s+(reply|comment)/i,
  /^\s*comments?\s*(are\s+)?(closed|disabled)/i,
  /^\s*loading\s+comments?\.\.\./i,
];

const BOILERPLATE_MIN_LENGTH = 15;
const DUPLICATE_SIMILARITY_THRESHOLD = 0.85;

function extractTextContent(html: string): string {
  const blocks: { text: string; priority: number }[] = [];
  const seen = new Set<string>();

  function addBlock(text: string, priority: number) {
    const cleaned = text.replace(/<[^>]+>/g, "").trim();
    if (!cleaned || cleaned.length < 15 || seen.has(cleaned)) return;
    seen.add(cleaned);
    blocks.push({ text: cleaned, priority });
  }

  extractJsonLdTexts(html).forEach((t) => addBlock(t, 0));

  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    extractParagraphs(articleMatch[1]).forEach((t) => addBlock(t, 1));
    extractHeadings(articleMatch[1]).forEach((t) => addBlock(t, 1));
  }

  const mainMatch = html.match(/<(?:main|div)[^>]*?(?:role=["']main["']|id=["']main["'])[^>]*>([\s\S]*?)<\/(?:main|div)>/i)
    || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    extractParagraphs(mainMatch[1]).forEach((t) => addBlock(t, 2));
  }

  const contentDiv = html.match(/<div[^>]*?(?:class|id)=["'][^"']*?(?:post-content|entry-content|article-body|story-body|content-body|article__content|post__body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (contentDiv) {
    extractParagraphs(contentDiv[1]).forEach((t) => addBlock(t, 3));
  }

  extractParagraphs(html).forEach((t) => addBlock(t, 4));
  extractHeadings(html).forEach((t) => addBlock(t, 5));

  blocks.sort((a, b) => a.priority - b.priority);

  return blocks.map((b) => b.text).join("\n");
}

function extractJsonLdTexts(html: string): string[] {
  const results: string[] = [];
  const ldPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = ldPattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item.articleBody) results.push(item.articleBody);
        if (item.description) results.push(item.description);
        if (item.headline) results.push(item.headline);
        if (item.text) results.push(item.text);
      }
    } catch {
      // invalid JSON — skip
    }
  }
  return results;
}

function extractParagraphs(html: string): string[] {
  const results: string[] = [];
  const pattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 20) results.push(text);
  }
  return results;
}

function extractHeadings(html: string): string[] {
  const results: string[] = [];
  const pattern = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 10) results.push(text);
  }
  return results;
}

function cleanText(raw: string): string {
  let text = raw;

  text = decodeHtmlEntities(text);

  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = text.split("\n");
  const cleaned: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.length < BOILERPLATE_MIN_LENGTH && /^[\W_]+$/.test(trimmed)) continue;
    let isBoilerplate = false;
    for (const pattern of SOCIAL_BOILERPLATE) {
      if (pattern.test(trimmed)) {
        isBoilerplate = true;
        break;
      }
    }
    if (!isBoilerplate) cleaned.push(trimmed);
  }

  const deduped = removeDuplicates(cleaned);

  return deduped.join("\n");
}

function removeDuplicates(lines: string[]): string[] {
  const result: string[] = [];
  const normalized: string[] = [];

  for (const line of lines) {
    const norm = line.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    let isDuplicate = false;
    for (const existing of normalized) {
      const sim = stringSimilarity(norm, existing);
      if (sim >= DUPLICATE_SIMILARITY_THRESHOLD) {
        isDuplicate = true;
        break;
      }
    }
    if (!isDuplicate) {
      result.push(line);
      normalized.push(norm);
    }
  }

  return result;
}

function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 10 || b.length < 10) return a === b ? 1 : 0;
  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a.slice(0, 100), b.slice(0, 100));
  return 1 - distance / maxLen;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1;
    }
  }
  return dp[m][n];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

export interface ProcessResult {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  contentType: string;
  summary: string;
  takeaways: string[];
  category: string;
  tags: string[];
  emotionalTone: string;
  educationalRelevance: number;
}

function runProviders(title: string, description: string, text: string): Promise<AIProviderResult> {
  const providers: AIProvider[] = [nvidiaProvider, keywordProvider];
  return runWithFallback(providers, title, description, text);
}

async function runWithFallback(
  providers: AIProvider[],
  title: string,
  description: string,
  text: string,
  index = 0
): Promise<AIProviderResult> {
  if (index >= providers.length) {
    throw new Error("All AI providers failed");
  }

  const provider = providers[index];
  console.log(`Trying provider: ${provider.name}`);

  try {
    const result = await provider.process(title, description, text);
    console.log(`Provider ${provider.name} succeeded`);
    return result;
  } catch (err) {
    console.warn(`Provider ${provider.name} failed:`, err);
    return runWithFallback(providers, title, description, text, index + 1);
  }
}

export async function processContentInline(url: string): Promise<ProcessResult> {
  const metadata = await extractMetadata(url);
  const aiResult = await runProviders(metadata.title, metadata.description, metadata.text);
  const eduScore = computeEduScore(metadata.title, metadata.description, metadata.text);

  return {
    title: metadata.title || "Untitled",
    description: metadata.description || "",
    thumbnailUrl: metadata.thumbnailUrl,
    contentType: metadata.contentType,
    summary: aiResult.summary,
    takeaways: aiResult.takeaways,
    category: aiResult.category,
    tags: aiResult.tags,
    emotionalTone: aiResult.tone,
    educationalRelevance: eduScore,
  };
}

const EDUCATIONAL_KEYWORDS = ["tutorial", "learn", "course", "explain", "guide", "lesson", "lecture", "education", "how to", "understanding"];

function computeEduScore(title: string, description: string, text: string): number {
  const combined = `${title} ${description} ${text}`.toLowerCase();
  let score = 5;
  const eduCount = EDUCATIONAL_KEYWORDS.filter((kw) => combined.includes(kw)).length;
  if (eduCount >= 2) score = Math.min(10, 5 + eduCount);
  return score;
}

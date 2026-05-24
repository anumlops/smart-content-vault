import { decodeHtmlEntities } from "./utils";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  AI: ["artificial intelligence", "machine learning", "deep learning", "neural network", "llm", "gpt", "chatgpt", "ai agent", "transformer", "diffusion", "rag", "fine-tuning", "prompt", "token", "embedding"],
  "Deep Learning": ["transformer", "cnn", "rnn", "lstm", "attention", "backpropagation", "gradient descent", "activation function", "convolutional", "recurrent", "generative"],
  "Computer Vision": ["computer vision", "image recognition", "object detection", "yolo", "segmentation", "stable diffusion", "dalle", "visual", "image generation", "face recognition"],
  Cybersecurity: ["cybersecurity", "hacking", "penetration", "vulnerability", "exploit", "encryption", "malware", "ransomware", "firewall", "zero-day", "privacy"],
  Cryptocurrency: ["bitcoin", "ethereum", "crypto", "blockchain", "defi", "nft", "web3", "token", "smart contract", "solana", "mining"],
  Business: ["business", "revenue", "market", "strategy", "growth", "enterprise", "b2b", "b2c", "ceo", "funding", "investment", "venture capital", "profit"],
  Startups: ["startup", "founder", "venture capital", "seed funding", "series a", "pitch", "accelerator", "yc", "y combinator", "mvp", "product-market fit"],
  Emotional: ["emotional", "heartbreaking", "touching", "tear", "cry", "love", "family", "father", "mother", "relationship", "feel", "emotion"],
  Family: ["family", "parent", "child", "father", "mother", "brother", "sister", "marriage", "baby", "home", "together"],
  Motivation: ["motivation", "inspire", "never give up", "success", "grind", "hustle", "dream", "believe", "achievement", "discipline", "determination"],
  Automobile: ["car", "automobile", "vehicle", "engine", "tesla", "electric vehicle", "ev", "racing", "bike", "motorcycle"],
  Technology: ["technology", "tech", "software", "hardware", "digital", "innovation", "future", "robot", "automation", "quantum", "cloud", "saas", "platform", "app"],
  Productivity: ["productivity", "efficiency", "time management", "habit", "routine", "focus", "organization", "workflow", "system", "gtd"],
  Philosophy: ["philosophy", "stoic", "existential", "consciousness", "meaning", "purpose", "ethics", "moral", "wisdom", "meditation", "mindfulness"],
  Finance: ["finance", "investing", "stock", "market", "trading", "portfolio", "asset", "wealth", "retirement", "saving", "dividend", "financial freedom"],
  Education: ["education", "learn", "course", "tutorial", "lesson", "study", "skill", "knowledge", "training", "workshop", "lecture", "university", "school"],
  Health: ["health", "fitness", "workout", "exercise", "nutrition", "diet", "mental health", "wellness", "yoga", "meditation", "sleep", "medical"],
  Science: ["science", "physics", "biology", "chemistry", "astronomy", "space", "nasa", "research", "experiment", "discovery", "evolution", "dna", "genetic"],
  Entertainment: ["entertainment", "movie", "music", "game", "gaming", "funny", "comedy", "show", "stream", "netflix", "hollywood", "celebrity"],
  News: ["news", "breaking", "report", "update", "current events", "politics", "world", "global", "economy"],
};

const EDUCATIONAL_KEYWORDS = ["tutorial", "learn", "course", "explain", "guide", "lesson", "lecture", "education", "how to", "understanding"];

interface ExtractedMetadata {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  favicon: string | null;
  contentType: string;
  text: string;
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
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentArchive/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return result;

    const html = await response.text();
    const domain = new URL(url).hostname.replace("www.", "");
    result.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const ogTitle = extractMeta(html, "og:title");
    const ogDesc = extractMeta(html, "og:description");
    const ogImage = extractMeta(html, "og:image");
    const twitterTitle = extractMeta(html, "twitter:title");
    const twitterDesc = extractMeta(html, "twitter:description");
    const twitterImage = extractMeta(html, "twitter:image");

    result.title = decodeHtmlEntities(ogTitle || twitterTitle || extractTitle(html) || "");
    result.description = decodeHtmlEntities(ogDesc || twitterDesc || extractMeta(html, "description") || "");
    result.thumbnailUrl = result.thumbnailUrl || ogImage || twitterImage || null;

    if (!result.contentType || result.contentType === "website") {
      if (extractMeta(html, "og:type") === "article" || html.includes("article")) {
        result.contentType = "article";
      }
    }

    const textContent = cleanText(extractTextContent(html));
    result.text = textContent.slice(0, 5000);
  } catch {
    // network errors are non-fatal for metadata extraction
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

  // 1. JSON-LD article body
  extractJsonLdTexts(html).forEach((t) => addBlock(t, 0));

  // 2. <article>
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch) {
    extractParagraphs(articleMatch[1]).forEach((t) => addBlock(t, 1));
    extractHeadings(articleMatch[1]).forEach((t) => addBlock(t, 1));
  }

  // 3. <main> or [role="main"]
  const mainMatch = html.match(/<(?:main|div)[^>]*?(?:role=["']main["']|id=["']main["'])[^>]*>([\s\S]*?)<\/(?:main|div)>/i)
    || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    extractParagraphs(mainMatch[1]).forEach((t) => addBlock(t, 2));
  }

  // 4. .post-content, .entry-content, .article-body, .story-body
  const contentDiv = html.match(/<div[^>]*?(?:class|id)=["'][^"']*?(?:post-content|entry-content|article-body|story-body|content-body|article__content|post__body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (contentDiv) {
    extractParagraphs(contentDiv[1]).forEach((t) => addBlock(t, 3));
  }

  // 5. Generic paragraphs (fallback)
  extractParagraphs(html).forEach((t) => addBlock(t, 4));

  // 6. Headings (fallback)
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

  // 1. Decode HTML entities first (before any truncation)
  text = decodeHtmlEntities(text);

  // 2. Normalize whitespace — collapse multiple spaces, trim lines
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 3. Remove social-media boilerplate (line by line)
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

  // 4. Remove duplicate lines (fuzzy match)
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

interface ClassificationResult {
  category: string;
  tags: string[];
  emotionalTone: string;
  educationalRelevance: number;
  summary: string;
}

export function classifyContent(title: string, description: string, text: string = ""): ClassificationResult {
  const combined = `${title} ${description} ${text}`.toLowerCase();

  const scores: Record<string, number> = {};
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
      if (regex.test(combined)) score++;
    }
    if (score > 0) scores[category] = score;
  }

  const category = Object.keys(scores).length > 0
    ? Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    : "Technology";

  const matchedKeywords = new Set<string>();
  for (const kwList of Object.values(CATEGORY_KEYWORDS)) {
    for (const kw of kwList) {
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, "i");
      if (regex.test(combined)) matchedKeywords.add(kw);
    }
  }
  const tags = Array.from(matchedKeywords).slice(0, 5);

  let tone = "neutral";
  if (/inspir|motivat|never give up|believe/.test(combined)) tone = "inspirational";
  if (/funny|humor|comedy|hilarious/.test(combined)) tone = "humorous";
  if (/sad|heartbreaking|cry|tear/.test(combined)) tone = "sad";
  if (/exciting|amazing|incredible|breakthrough/.test(combined)) tone = "exciting";
  if (/thought|philosophy|reflect|deep/.test(combined)) tone = "thoughtful";
  if (/learn|tutorial|course|explain/.test(combined)) tone = "educational";
  if (/motivat|inspire|dream|success|grind/.test(combined)) tone = "motivational";

  let eduScore = 5;
  const eduCount = EDUCATIONAL_KEYWORDS.filter((kw) => combined.includes(kw)).length;
  if (eduCount >= 2) eduScore = Math.min(10, 5 + eduCount);

  const summary = generateSummary(title, description, text);

  return { category, tags, emotionalTone: tone, educationalRelevance: eduScore, summary };
}

function generateSummary(title: string, description: string, text: string): string {
  if (description && description.length > 20) return description;
  if (text) {
    const lines = text.split("\n").filter((l) => l.trim().length > 40);
    if (lines.length > 0) {
      const s = lines.slice(0, 2).join(" ");
      return s.length > 300 ? s.slice(0, 300) + "..." : s;
    }
  }
  return title || "No summary available";
}

export interface ProcessResult {
  title: string;
  description: string;
  thumbnailUrl: string | null;
  contentType: string;
  summary: string;
  category: string;
  tags: string[];
  emotionalTone: string;
  educationalRelevance: number;
}

export async function processContentInline(url: string): Promise<ProcessResult> {
  const metadata = await extractMetadata(url);
  const classification = classifyContent(metadata.title, metadata.description, metadata.text);

  return {
    title: metadata.title || "Untitled",
    description: metadata.description || "",
    thumbnailUrl: metadata.thumbnailUrl,
    contentType: metadata.contentType,
    summary: classification.summary,
    category: classification.category,
    tags: classification.tags,
    emotionalTone: classification.emotionalTone,
    educationalRelevance: classification.educationalRelevance,
  };
}

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

    const textContent = extractTextContent(html);
    result.text = decodeHtmlEntities(textContent.slice(0, 5000));
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

function extractTextContent(html: string): string {
  const paragraphs: string[] = [];
  const pPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pPattern.exec(html)) !== null) {
    const text = pMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 20) paragraphs.push(text);
  }

  const headingPattern = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let hMatch;
  while ((hMatch = headingPattern.exec(html)) !== null) {
    const text = hMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 10) paragraphs.push(text);
  }

  return paragraphs.join("\n");
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

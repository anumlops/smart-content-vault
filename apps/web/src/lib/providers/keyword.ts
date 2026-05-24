import type { AIProvider, AIProviderResult } from "./provider";

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

export class KeywordProvider implements AIProvider {
  name = "keyword";

  process(_title: string, _description: string, _text: string): Promise<AIProviderResult> {
    const combined = `${_title} ${_description} ${_text}`.toLowerCase();

    const category = this.classifyCategory(combined);
    const tags = this.extractTags(combined);
    const tone = this.detectTone(combined);
    const summary = this.generateSummary(_title, _description, _text);
    const takeaways = this.extractTakeaways(_text, _title, _description);

    return Promise.resolve({ summary, category, tags, takeaways, tone });
  }

  private classifyCategory(combined: string): string {
    const scores: Record<string, number> = {};
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${this.escapeRegex(kw)}\\b`, "i");
        if (regex.test(combined)) score++;
      }
      if (score > 0) scores[category] = score;
    }
    return Object.keys(scores).length > 0
      ? Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
      : "Technology";
  }

  private extractTags(combined: string): string[] {
    const matchedKeywords = new Set<string>();
    for (const kwList of Object.values(CATEGORY_KEYWORDS)) {
      for (const kw of kwList) {
        const regex = new RegExp(`\\b${this.escapeRegex(kw)}\\b`, "i");
        if (regex.test(combined)) matchedKeywords.add(kw);
      }
    }
    return Array.from(matchedKeywords).slice(0, 5);
  }

  private detectTone(combined: string): string {
    if (/inspir|motivat|never give up|believe/.test(combined)) return "inspirational";
    if (/funny|humor|comedy|hilarious/.test(combined)) return "humorous";
    if (/sad|heartbreaking|cry|tear/.test(combined)) return "sad";
    if (/exciting|amazing|incredible|breakthrough/.test(combined)) return "exciting";
    if (/thought|philosophy|reflect|deep/.test(combined)) return "thoughtful";
    if (/learn|tutorial|course|explain/.test(combined)) return "educational";
    if (/motivat|inspire|dream|success|grind/.test(combined)) return "motivational";
    return "neutral";
  }

  private generateSummary(title: string, description: string, text: string): string {
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

  private extractTakeaways(text: string, title: string, description: string): string[] {
    const takeaways: string[] = [];

    if (title) takeaways.push(title);
    if (description && description !== title) takeaways.push(description);

    if (text) {
      const lines = text.split("\n").filter((l) => l.trim().length > 60);
      const seen = new Set<string>();
      for (const line of lines.slice(0, 5)) {
        const clean = line.trim();
        if (!seen.has(clean) && clean.length > 40) {
          takeaways.push(clean.length > 150 ? clean.slice(0, 150) + "..." : clean);
          seen.add(clean);
        }
      }
    }

    return takeaways.slice(0, 5);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

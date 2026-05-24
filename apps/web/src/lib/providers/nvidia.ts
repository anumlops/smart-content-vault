import type { AIProvider, AIProviderResult } from "./provider";

const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";

export class NvidiaProvider implements AIProvider {
  name = "nvidia";

  async process(title: string, description: string, text: string): Promise<AIProviderResult> {
    const apiKey = process.env.NVIDIA_API_KEY;
    const model = process.env.NVIDIA_MODEL || "meta/llama-4-maverick-17b-128e-instruct";

    if (!apiKey) {
      console.log("[NvidiaProvider] NVIDIA_API_KEY is not configured");
      throw new Error("NVIDIA_API_KEY is not configured");
    }

    const content = [
      title ? `Title: ${title}` : "",
      description ? `Description: ${description}` : "",
      text ? `Content:\n${text.slice(0, 3000)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (!content.trim()) {
      console.log("[NvidiaProvider] No content to analyze");
      throw new Error("No content to analyze");
    }

    const systemPrompt = `You are a content analysis assistant. Analyze the provided content and return ONLY valid JSON with this exact structure:
{
  "summary": "A 1-2 sentence summary of the content",
  "category": "Single category from: AI, Deep Learning, Computer Vision, Cybersecurity, Cryptocurrency, Business, Startups, Emotional, Family, Motivation, Automobile, Technology, Productivity, Philosophy, Finance, Education, Health, Science, Entertainment, News",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "takeaways": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],
  "tone": "One of: neutral, positive, negative, inspirational, humorous, sad, exciting, thoughtful, educational, motivational"
}`;

    const body = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    };

    const url = `${NVIDIA_API_BASE}/chat/completions`;
    const startTime = Date.now();
    console.log(`[NvidiaProvider] Request started — model: ${model}, content length: ${content.length}`);

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error(`[NvidiaProvider] Request failed after ${elapsed}ms:`, err);
      throw err;
    }

    const elapsed = Date.now() - startTime;
    console.log(`[NvidiaProvider] Response received — status: ${res.status}, elapsed: ${elapsed}ms`);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "unknown");
      console.error(`[NvidiaProvider] Error response body: ${errorText}`);
      throw new Error(`NVIDIA API error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("NVIDIA returned empty response");
    }

    const parsed = parseJsonResponse(raw);
    validateResult(parsed);

    console.log(`[NvidiaProvider] Analysis complete — category: ${parsed.category}, tags: ${parsed.tags.length}, takeaways: ${parsed.takeaways.length}, tone: ${parsed.tone}`);
    return parsed;
  }
}

function parseJsonResponse(raw: string): AIProviderResult {
  let json = raw.trim();

  const jsonMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    json = jsonMatch[1].trim();
  }

  const braceStart = json.indexOf("{");
  const braceEnd = json.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    json = json.slice(braceStart, braceEnd + 1);
  }

  const parsed = JSON.parse(json);

  return {
    summary: String(parsed.summary || ""),
    category: String(parsed.category || "Technology"),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
    takeaways: Array.isArray(parsed.takeaways) ? parsed.takeaways.map(String) : [],
    tone: String(parsed.tone || "neutral"),
  };
}

function validateResult(result: AIProviderResult): void {
  if (!result.summary) {
    throw new Error("NVIDIA response missing summary");
  }
  if (!result.category) {
    throw new Error("NVIDIA response missing category");
  }
  if (!Array.isArray(result.tags) || result.tags.length === 0) {
    throw new Error("NVIDIA response missing or invalid tags");
  }
  if (!Array.isArray(result.takeaways) || result.takeaways.length === 0) {
    throw new Error("NVIDIA response missing or invalid takeaways");
  }
  if (!result.tone) {
    throw new Error("NVIDIA response missing tone");
  }
}

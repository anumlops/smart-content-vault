# AI Processing Pipeline

## 1. Source Files

| Step | Primary File | Fallback File |
|------|-------------|---------------|
| Entry point | `apps/web/src/app/api/content/route.ts` (line 86-162) | same file |
| Metadata extraction | `services/ai/src/pipeline/extractor.py` | `apps/web/src/lib/processing.ts` (line 35-95) |
| Classification | `services/ai/src/pipeline/classifier.py` | `apps/web/src/lib/processing.ts` (line 161-203) |
| Summarization | `services/ai/src/pipeline/summarizer.py` | `apps/web/src/lib/processing.ts` (line 205-215) |

## 2. Processing Flow

```
POST /api/content
  → creates SavedContent with processingStatus="pending"
  → calls processContent(id, url) (async, non-blocking)
    → sets status="processing"
    → TRIES Python AI service at AI_SERVICE_URL/api/ai/process (15s timeout)
      → if 200 OK: uses its response
      → if fails/timeout: falls back to processContentInline(url)
    → updates DB with results + status="completed"
```

## 3. Is a real LLM called?

**Not by default.** The inline JS fallback (`processing.ts`) is all keyword/regex — zero ML, zero API calls.

The **Python AI service** (`services/ai/`) does call OpenAI (`gpt-4o-mini`) if `OPENAI_API_KEY` is set:
- `classifier.py:104-138` sends a JSON-mode prompt to GPT-4o-mini for category, tags, tone, edu score
- `summarizer.py:33-48` sends a summarization prompt to GPT-4o-mini

Without OpenAI key, the Python service uses the same keyword logic as the JS fallback.

## 4. API Providers

| Provider | Used when | File |
|----------|-----------|------|
| OpenAI GPT-4o-mini | `OPENAI_API_KEY` set + Python service running | `classifier.py:121`, `summarizer.py:41` |
| Google Fonts proxy | favicon resolution | `processing.ts:69` |
| None (standalone) | No AI service, no API key | `processing.ts` solely |

## 5. Categories

Generated via **keyword scoring** — 20 predefined categories each with a keyword list (`CATEGORY_KEYWORDS` in `processing.ts:1-22`):

```
For each category: score += 1 for every keyword matched as whole-word in title+description+text
Winner = category with highest score
Fallback = "Technology" if no matches
```

Example: URL with "machine learning" + "neural network" in text → AI category (2 matches) → winner.

## 6. Tags

Generated from the same keywords (`processing.ts:178-185`):

```
Collect ALL matched keywords across ALL categories
Deduplicate via Set
Take first 5
```

## 7. Summaries

Extractive, no LLM (`processing.ts:205-215`):

```
if description exists and length > 20 chars → use description as summary
elif text exists → take first 2 paragraphs (each >40 chars), truncate at 300 chars
else → use title or "No summary available"
```

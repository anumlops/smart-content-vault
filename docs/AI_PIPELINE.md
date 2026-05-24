# AI Processing Pipeline

## 1. Source Files

| Step | Primary File | Fallback File |
|------|-------------|---------------|
| Entry point | `apps/web/src/app/api/content/route.ts` (line 86-162) | same file |
| Article extraction (primary) | `apps/web/src/lib/processing.ts` — Mozilla Readability via JSDOM | `apps/web/src/lib/processing.ts` — regex fallback (line 186-222) |
| Article extraction (Python) | `services/ai/src/pipeline/extractor.py` (BeautifulSoup) | — |
| Classification | `services/ai/src/pipeline/classifier.py` | `apps/web/src/lib/processing.ts` (line 393-397) |
| Summarization | `services/ai/src/pipeline/summarizer.py` | `apps/web/src/lib/processing.ts` (line 395) |

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

**Only if NVIDIA_API_KEY or OPENAI_API_KEY is set.** The inline JS pipeline (`processing.ts`) now uses two tiers:

| Tier | Provider | When activated |
|------|----------|---------------|
| 1st | **NVIDIA Llama-4 Maverick** | `NVIDIA_API_KEY` set — calls `integrate.api.nvidia.com/v1/chat/completions` |
| 2nd (fallback) | **Keyword provider** | NVIDIA fails or returns invalid JSON — regex/keyword-based extractive |

The **Python AI service** (`services/ai/`) calls OpenAI (`gpt-4o-mini`) if `OPENAI_API_KEY` is set:
- `classifier.py:104-138` sends a JSON-mode prompt to GPT-4o-mini
- `summarizer.py:33-48` sends a summarization prompt to GPT-4o-mini

Without any API key, both services use keyword/regex logic.

## 4. Extraction Methods

| Method | Scope | File |
|--------|-------|------|
| **Mozilla Readability** (primary) | Strips nav, footer, ads, sidebars, cookie banners via DOM parsing | `processing.ts:29-42` |
| **Regex fallback** | JSON-LD → `<article>` → `<main>` → content divs → all `<p>`/headings | `processing.ts:186-222` |
| **BeautifulSoup** (Python AI service) | OG tags, `<p>`/headings | `extractor.py` |

Fetch uses browser-like headers to bypass 403 blocks:
- `User-Agent`: Chrome 124 on Windows
- `Accept`, `Accept-Language`, `Referer: https://www.google.com/`

## 5. Extraction Diagnostics

Every URL extraction logs:
- HTTP status, Content-Type, HTML length
- Readability success/failure, title, text length
- Fallback or primary method used
- Final extracted text length
- First 500 HTML chars on complete extraction failure
- Network errors with URL and message

## 6. Categories (Keyword Fallback)

20 predefined categories, each with a keyword list. Scoring:
```
For each category: score += 1 for every keyword matched as whole-word in title+description+text
Winner = category with highest score
Fallback = "Technology" if no matches
```

## 7. Tags (Keyword Fallback)

```
Collect ALL matched keywords across ALL categories
Deduplicate via Set
Take first 5
```

## 8. Summaries

- **NVIDIA/LLM path**: Returns JSON with `summary`, `category`, `tags`, `takeaways`, `tone`
- **Keyword fallback**: Uses description → first 2 paragraphs → title

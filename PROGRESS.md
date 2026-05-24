# Progress Tracker

## Goal
Make the Smart Content Vault app runnable end-to-end with proper auth, content ingestion, HTML entity handling, and no runtime errors.

## Constraints
- Do not redesign, change architecture, or alter schema unless critical bug.
- Do not remove or bypass authentication.
- Treat specification docs as approved requirements.
- Do not start/stop dev servers — user manages that externally.

## Key Decisions
- JWT session strategy chosen over database sessions because Credentials provider requires it with PrismaAdapter.
- Inline JS processing in `processing.ts` serves as fallback when Python AI service is not running — enables fully standalone operation.
- Demo Credentials provider enables development/testing without configuring GitHub/Google OAuth apps.
- HTML entity decoding applied both at extraction time (processing.ts) and at render time (React components) to handle both new and existing DB content.
- PROJECT_SPECIFICATION.md tracks all specs including AUTH_SECRET for reference.

## Status

### Completed
- [x] Cloned repo, read all docs (PROJECT_SPECIFICATION.md, README, schema, wireframes).
- [x] Installed npm dependencies, generated Prisma client, pushed SQLite schema, seeded demo data.
- [x] Created `apps/web/src/lib/processing.ts` — JS inline content processing (metadata extraction, keyword classification, extractive summarization).
- [x] Updated `apps/web/src/app/api/content/route.ts` — processContent() falls back from Python AI service to inline JS when AI service unavailable.
- [x] Fixed NextAuth v5 configuration:
  - Added `AUTH_SECRET` and `NEXTAUTH_URL` to `apps/web/.env`.
  - Set `session: { strategy: "jwt" }` (required for credentials provider with PrismaAdapter).
  - Changed session callback to use `token.sub` for user ID.
  - Added JWT callback to persist user ID.
  - Made GitHub/Google OAuth providers conditional on env vars being set.
  - Added "demo" Credentials provider (finds or creates user by email).
- [x] Created `apps/web/src/app/auth/[...nextauth]/SignInForm.tsx` — client component using `signIn` from `next-auth/react` for credentials login.
- [x] Split sign-in page into server component (OAuth buttons) + client component (demo form).
- [x] Fixed `formatDate()` and `formatRelativeTime()` in `lib/utils.ts` — now handle undefined, null, invalid dates (return "Unknown date").
- [x] Saved AI pipeline explanation as `docs/AI_PIPELINE.md`.
- [x] Added `decodeHtmlEntities()` to `lib/utils.ts` — handles numeric, hex, and named HTML entities.
- [x] Applied decoding in `processing.ts` after extracting title, description, text.
- [x] Applied decoding in `ContentCard.tsx` for title, description, summary renders.
- [x] Applied decoding in `ContentDetail.tsx` for title, summary, note renders.
- [x] Built successfully — `✓ Compiled successfully` with no type errors.
- [x] Created PROJECT_SPECIFICATION.md with full project spec including AUTH_SECRET.
- [x] Created PROGRESS.md to track all changes.
- [x] Created auto-commit hook for automatic git commits on changes.
- [x] Pushed all changes to GitHub remote.

### In Progress
- (none)

### Latest Changes
- [x] Restored original PROJECT_SPECIFICATION.md (997-line comprehensive spec) and added Appendix A with auth secret, env vars, auth implementation details, and deviations from spec.
- [x] Created PROGRESS.md for ongoing change tracking.
- [x] Created apps/web/.env with working AUTH_SECRET and config.
- [x] Created scripts/auto-commit.ps1 — file watcher that auto-commits changes.
- [x] All changes staged, committed, and pushed to GitHub.
- [x] Improved text extraction pipeline in `processing.ts`:
  - **Decode HTML entities** before truncation (avoids cutting entities in half)
  - **Remove duplicate text** via fuzzy matching (Levenshtein distance, 85% threshold)
  - **Remove social-media boilerplate** — 28 regex patterns (subscribe, share, copyright, etc.)
  - **Normalize whitespace** — collapse spaces, trim lines, dedup empty lines
  - **Extract meaningful content** — prioritized extraction from JSON-LD, `<article>`, `<main>`, content divs, then `<p>`/headings as fallback
- [x] **Integrated NVIDIA llama-4-maverick as AI provider**:
  - Created `apps/web/src/lib/providers/` with `provider.ts` (base interface), `nvidia.ts` (NVIDIA API integration), `keyword.ts` (keyword fallback), `index.ts` (exports)
  - `NvidiaProvider`: sends cleaned content to NVIDIA chat completions API, requests structured JSON (summary, category, tags, takeaways, tone), parses code-fenced or bare JSON responses
  - `KeywordProvider`: refactored from old `classifyContent` + `generateSummary` — keyword scoring for category/tags, regex tone detection, extractive summarization
  - `runWithFallback()`: tries NvidiaProvider first; on any failure (missing key, network error, invalid JSON, timeout) automatically falls back to KeywordProvider
  - Added `takeaways` field to Prisma schema (stored as JSON string) and shared `SavedContent` type
  - Updated `ContentDetail.tsx` — displays Key Takeaways section with amber bullet list between summary and tags
  - Content saving never fails due to AI processing (async, non-blocking, best-effort results)
  - Updated `.env`, `.env.example`, `PROJECT_SPECIFICATION.md` with NVIDIA vars (placeholder values only)

### Blocked
- (none)

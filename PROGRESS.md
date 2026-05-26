# Progress Tracker

## Goal
Build Smart Content Vault into a fast, reliable personal content bookmarking and knowledge organization platform. No AI processing — just instant saves, automatic organization, and easy retrieval.

## Constraints
- Do not call any AI provider or processing service.
- No background processing queues; saves complete immediately.
- Mobile responsive at 375px+.
- All documentation must accurately reflect current capabilities.

## Key Decisions
- JWT session strategy with jose + bcryptjs for auth.
- Content extraction uses oEmbed (YouTube) + `<title>`/`og:title` HTML parsing.
- Category and tag assignment done locally via keyword matching in `categorizer.ts`.
- No AI providers, no semantic search by default, no summaries.
- FAB button for global save access on all authenticated pages.

## Status

### Completed
- [x] JWT authentication with register/login/logout flow.
- [x] Content saving with instant metadata extraction.
- [x] oEmbed integration for YouTube title + thumbnail.
- [x] HTML `<title>` and `og:title` extraction for other URLs.
- [x] Domain-based title fallback.
- [x] Category system with 20 keyword-driven categories (`categorizer.ts`).
- [x] Auto tag generation from title keywords (`tag-generator.ts`).
- [x] Thumbnail fallback hierarchy with platform-specific placeholder SVGs.
- [x] Floating FAB save button on all authenticated pages.
- [x] ContentCard shows: thumbnail, title, category badge, tags, domain, date.
- [x] ContentDetail shows: thumbnail, title, description, category, tags, metadata.
- [x] Timeline view with chronological grouping.
- [x] Search with keyword matching across title, description, category, tags, notes.
- [x] Dashboard with stats, recent saves, category cards, timeline widget.
- [x] Responsive design at 375px+.
- [x] Dark mode glassmorphism UI.
- [x] Build passes with zero TypeScript errors.
- [x] All changes committed and pushed to `origin/main`.

### In Progress
- (none)

### Latest Changes
- [x] Removed all AI provider code (NVIDIA, keyword fallback, Python AI service references).
- [x] Rewrote `processing.ts` — stripped AI, kept oEmbed + basic title extraction.
- [x] Rewrote POST `/api/content` — inline metadata extraction, immediate save.
- [x] Rewrote ContentCard, ContentDetail, ContentForm — removed AI badges, summaries, tags display.
- [x] Added floating FAB to DashboardLayout.
- [x] Added category system in `categorizer.ts` (20 categories, keyword-based).
- [x] Added tag generator in `tag-generator.ts` (up to 5 tags from title).
- [x] Added thumbnail fallback hierarchy with 7 platform SVGs.
- [x] Updated constants.ts with new category list and meta.
- [x] Rewrote all documentation (README, PROJECT_SPECIFICATION, DEPLOYMENT).
- [x] Deleted `docs/AI_PIPELINE.md` (no longer applicable).
- [x] Removed unused AI provider files.

### Blocked
- (none)

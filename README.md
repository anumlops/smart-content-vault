# Content Archive

AI-powered personal content archive and intelligent bookmarking system. Save links, get automatic AI analysis, and rediscover your content through semantic search.

## Features

- **Quick Save** — Save any link (YouTube, Instagram, Twitter/X, articles, websites) with one click
- **AI Analysis** — Automatic content extraction, categorization, tagging, and summarization
- **Semantic Search** — Search naturally like "that emotional father video" or "AI business model"
- **Smart Categories** — AI classifies into 20+ categories including AI, Cybersecurity, Startups, etc.
- **Timeline View** — Chronological browsing with relative timestamps
- **Dashboard** — Personal insights, category distribution, and trending topics
- **Dark Mode** — Beautiful glassmorphism design with dark mode first

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| AI Service | FastAPI (Python), OpenAI / sentence-transformers |
| Database | PostgreSQL + pgvector |
| Auth | NextAuth v5 (GitHub, Google) |
| Search | pgvector semantic search + keyword |

## Architecture

```
content-archive/
├── apps/web/              # Next.js frontend + API routes
│   ├── prisma/            # Database schema
│   └── src/
│       ├── app/           # Pages & API routes
│       ├── components/    # Reusable UI components
│       ├── hooks/         # React hooks
│       └── lib/           # Utilities (auth, prisma, etc.)
├── services/ai/           # FastAPI AI service
│   └── src/
│       ├── pipeline/      # Extractor, classifier, embedder, summarizer
│       ├── routers/       # API endpoints
│       └── models/        # Pydantic schemas
├── packages/shared/       # Shared types & constants
└── docker-compose.yml     # Orchestration
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16 with pgvector
- Docker (optional)

### 1. Clone and setup

```bash
git clone <repo-url>
cd content-archive
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings (database URL, API keys, etc.)
```

### 3. Set up the database

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Start the AI service

```bash
cd services/ai
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

### 5. Start the web app

```bash
npm run dev
```

Visit http://localhost:3000

### Docker setup

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | Yes |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Optional* |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID | For GitHub auth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | For GitHub auth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google auth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Google auth |

*Without OpenAI, the AI service falls back to local sentence-transformers and keyword-based classification.

## AI Pipeline

When a link is saved, the pipeline:

1. **Extract** — Fetch metadata, OG tags, YouTube transcripts, article text
2. **Classify** — Categorize content, detect emotional tone, rate educational value
3. **Summarize** — Generate concise 1-2 sentence summary
4. **Embed** — Create vector embedding for semantic search
5. **Store** — Save all enriched data to database

## Search

Three search modes:
- **Semantic** — Vector similarity using embeddings ("that AI startup video")
- **Keyword** — Traditional text search
- **Hybrid** — Combines both for best results

## API Endpoints

### Web App (Next.js API Routes)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/content` | List saved content |
| POST | `/api/content` | Save new content |
| GET | `/api/content/:id` | Get content details |
| DELETE | `/api/content/:id` | Delete content |
| PATCH | `/api/content/:id` | Update content |
| GET | `/api/search` | Search content |
| GET | `/api/insights/dashboard` | Dashboard stats |

### AI Service (FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/process` | Extract, classify, summarize |
| POST | `/api/ai/embed` | Generate and store embedding |
| GET | `/api/search` | Semantic vector search |
| GET | `/health` | Health check |

## Future Enhancements

- [ ] Browser extension for one-click saving
- [ ] WhatsApp bot integration
- [ ] Telegram bot ingestion
- [ ] PWA support with offline access
- [ ] Chrome share target
- [ ] Social features (shared collections)
- [ ] Content recommendations based on interest patterns
- [ ] Mobile apps

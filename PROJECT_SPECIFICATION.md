# Smart Content Vault — Project Specification

> **Version:** 1.0.0  
> **Status:** Approved Implementation  
> **Stack:** Next.js 14 + FastAPI + PostgreSQL/pgvector  
> **Theme:** Dark SaaS (Inspired by Notion, Linear, Perplexity)

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Database Schema](#2-database-schema)
3. [API Contracts](#3-api-contracts)
4. [Wireframe Descriptions](#4-wireframe-descriptions)
5. [Component Hierarchy](#5-component-hierarchy)
6. [User Flows](#6-user-flows)
7. [Folder Structure](#7-folder-structure)
8. [Technical Decisions](#8-technical-decisions)

---

## 1. Architecture

### 1.1 High-Level Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER LAYER                                │
│    [Web Browser]  [Mobile Browser]  [Future Mobile App]     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Paste Link
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              CONTENT INGESTION LAYER                         │
│  [URL Input] → [Metadata Extraction] → [OpenGraph Scraper]  │
│              → [Transcript Extractor] → [Article Parser]     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Extract Content
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               AI PROCESSING LAYER                            │
│  [Content Analyzer] → [Category Generator] → [Tag Generator]│
│         → [Summary Generator] → [Embedding Generator]       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Store Results
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                               │
│  PostgreSQL + pgvector                                      │
│  [content] [categories] [tags] [users] [embeddings]         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Index
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEARCH LAYER                                │
│     [Keyword Search] → [Semantic Search] → [Hybrid Ranking]  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Display
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER                             │
│  [Dashboard] [Timeline View] [Categories] [Search Results]  │
│                     [Content Detail]                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

**Content Save Pipeline:**
```
User → Save URL → Extract Content → AI Processing → Database Storage → Search Engine → Dashboard Display
```

**Search Pipeline:**
```
User Query → Search Parser → Embed Query → Vector Search → Hybrid Ranking → Results Display
```

### 1.3 System Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js 14 │────▶│  FastAPI AI  │────▶│  PostgreSQL  │
│   (App Router)│    │  Service     │    │  + pgvector  │
│   :3000      │     │  :8000       │    │  :5432       │
└──────────────┘     └──────────────┘     └──────────────┘
        │                    │
        │  NextAuth v5       │  OpenAI / sentence-transformers
        │  GitHub / Google   │  YouTube Transcript API
        └────────────────────┘  BeautifulSoup / newspaper3k
```

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│      User       │       │    SavedContent      │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │◀──────│ userId (FK)          │
│ name            │       │ id (PK)              │
│ email (unique)  │       │ url                  │
│ emailVerified   │       │ title                │
│ image           │       │ description          │
│ createdAt       │       │ thumbnailUrl         │
│ updatedAt       │       │ contentType          │
└─────────────────┘       │ note                 │
        │                 │ summary              │
        │                 │ emotionalTone        │
        ▼                 │ educationalRelevance │
┌─────────────────┐       │ category             │
│  SearchHistory  │       │ tags (JSON string)   │
├─────────────────┤       │ processingStatus     │
│ id (PK)         │       │ embedding (vector)   │
│ userId (FK)     │       │ createdAt            │
│ query           │       │ updatedAt            │
│ resultCount     │       └─────────────────────┘
│ savedContentId  │
│ createdAt       │
└─────────────────┘
```

### 2.2 PostgreSQL Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // sqlite for dev
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  savedContents SavedContent[]
  searchHistory SearchHistory[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model SavedContent {
  id                  String   @id @default(cuid())
  userId              String
  url                 String
  title               String?
  description         String?
  thumbnailUrl        String?
  contentType         String   @default("website")
  note                String?
  summary             String?
  emotionalTone       String?
  educationalRelevance Int?
  category            String?
  tags                String   @default("[]")
  processingStatus    String   @default("pending")

  // pgvector embedding (managed by AI service)
  // embedding vector(384) -- not in Prisma, added manually

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  searchHistory  SearchHistory[]

  @@index([userId])
  @@index([category])
  @@index([createdAt])
}

model SearchHistory {
  id            String   @id @default(cuid())
  userId        String
  query         String
  resultCount   Int      @default(0)
  savedContentId String?
  createdAt     DateTime @default(now())

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  savedContent SavedContent? @relation(fields: [savedContentId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([userId, createdAt])
}

// NextAuth models: Account, Session, VerificationToken
```

### 2.3 Indexes

| Table | Index | Type |
|-------|-------|------|
| SavedContent | `userId` | B-tree |
| SavedContent | `category` | B-tree |
| SavedContent | `createdAt` | B-tree |
| SavedContent | `embedding` | IVFFlat (pgvector) |
| SearchHistory | `(userId, createdAt)` | Composite B-tree |

---

## 3. API Contracts

### 3.1 Web App API Routes (Next.js)

#### `GET /api/content`
List saved content for the authenticated user.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| category | string | — | Filter by category |
| limit | number | 20 | Max items (max 100) |
| offset | number | 0 | Pagination offset |

**Response:**
```json
{
  "items": [
    {
      "id": "clx...",
      "userId": "clx...",
      "url": "https://youtube.com/watch?v=...",
      "title": "Building AI Agents",
      "description": "A deep dive...",
      "thumbnailUrl": "https://img.youtube.com/vi/.../maxresdefault.jpg",
      "contentType": "youtube",
      "note": "Great talk",
      "summary": "Explores patterns for deploying AI agents...",
      "emotionalTone": "educational",
      "educationalRelevance": 9,
      "category": "AI",
      "tags": ["AI Agents", "Production"],
      "processingStatus": "completed",
      "createdAt": "2026-05-24T10:30:00Z",
      "updatedAt": "2026-05-24T10:32:00Z"
    }
  ],
  "total": 42
}
```

#### `POST /api/content`
Save new content from a URL.

**Body:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "note": "Optional note"
}
```

**Response:** `201 Created` — Single SavedContent object.  
**Processing:** Immediately triggers async `processContent()` → calls AI service to extract/classify/summarize/embed.

#### `GET /api/content/[id]`
Get single content item.

**Response:** Single SavedContent object (or 404).

#### `DELETE /api/content/[id]`
Delete content (ownership check). Returns `204 No Content`.

#### `PATCH /api/content/[id]`
Update note, category, or tags.

#### `GET /api/search`
Search content with hybrid ranking.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | — | Search query |
| type | enum | "hybrid" | "hybrid" \| "semantic" \| "keyword" |
| category | string | — | Filter by category |
| limit | number | 20 | Max items |
| offset | number | 0 | Pagination |

**Response:**
```json
{
  "results": [
    {
      "content": { /* SavedContent */ },
      "score": 0.94,
      "matchType": "hybrid"
    }
  ],
  "total": 15
}
```

**Scoring Logic:**
- `keyword`: Simple contains-match across title/description/summary/category/note/tags. Score = 0.5
- `semantic`: Vector cosine similarity via pgvector. Score = similarity (0-1)
- `hybrid`: `0.6 × semantic_score + 0.4 × keyword_score`. Falls back to keyword if AI service unavailable.

#### `GET /api/insights/dashboard`
Aggregated dashboard statistics.

**Response:**
```json
{
  "totalSaves": 42,
  "categoryDistribution": { "AI": 15, "Startups": 8, ... },
  "popularCategories": [
    { "name": "AI", "count": 15, "percentage": 36 }
  ],
  "recentSaves": [ /* SavedContent[] */ ],
  "topTags": [
    { "tag": "machine learning", "count": 12 }
  ],
  "insights": [
    "Your top category is AI with 15 of 42 saved items.",
    "You frequently save content about 'machine learning'."
  ],
  "weeklyActivity": [
    { "date": "2026-05-18", "count": 3 }
  ]
}
```

### 3.2 AI Service API (FastAPI)

#### `POST /api/ai/process`
Extract, classify, and summarize content from a URL.

**Body:**
```json
{
  "id": "clx...",
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "id": "clx...",
  "title": "Building AI Agents",
  "description": "A deep dive...",
  "thumbnail_url": "https://img.youtube.com/vi/.../maxresdefault.jpg",
  "content_type": "youtube",
  "summary": "Explores patterns for deploying AI agents...",
  "category": "AI",
  "tags": ["AI Agents", "Production", "LLM"],
  "emotional_tone": "educational",
  "educational_relevance": 9
}
```

**Pipeline:**
1. **Extract** — Fetch OG tags, YouTube transcript, article text
2. **Classify** — OpenAI GPT-4o-mini (JSON mode) → keyword fallback
3. **Summarize** — OpenAI GPT-4o-mini → extractive fallback

#### `POST /api/ai/embed`
Generate and store vector embedding.

**Body:**
```json
{
  "id": "clx...",
  "text": "Text to embed (title + summary + category + tags)"
}
```

**Response:** `{ "status": "ok", "dimensions": 384 }`

**Embedding Models:**
- Local: `sentence-transformers/all-MiniLM-L6-v2` (384-dim)
- OpenAI: `text-embedding-3-small` (1536-dim)

#### `GET /api/search`
Semantic vector search.

**Query Params:** `q` (query), `user_id`, `limit`

**Response:**
```json
{
  "results": [
    { "content_id": "clx...", "score": 0.92 }
  ],
  "query": "AI agents"
}
```

**Implementation:** `SELECT *, embedding <=> $query_embedding AS distance FROM "SavedContent" WHERE "userId" = $user_id ORDER BY distance LIMIT $limit`

#### `GET /health`
Health check. Returns `{ "status": "ok", "service": "ai-service" }`

---

## 4. Wireframe Descriptions

### 4.1 Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  🔍  Search your content vault...              [Ctrl+K] │
├─────────────────────────────────────────────────────────┤
│  Recently Saved                                         │
│  ┌──────────────────────────────────────────────┐       │
│  │ ▶  Building AI Agents in Production          │       │
│  │    YouTube · 2h ago · youtube.com      [AI]  │       │
│  ├──────────────────────────────────────────────┤       │
│  │ ✏  The Future of Semantic Search             │       │
│  │    Blog · 5h ago · example.com       [Search] │       │
│  └──────────────────────────────────────────────┘       │
│                                                         │
│  Categories                                             │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ 🤖 AI & ML   │  │ 💻 Software  │                    │
│  │ 24 items     │  │ 15 items     │                    │
│  │ ▓▓▓▓▓░░░░░░  │  │ ▓▓▓░░░░░░░  │                    │
│  ├──────────────┤  ├──────────────┤                    │
│  │ 📊 Startups  │  │ 🎓 Design    │                    │
│  │ 20 items     │  │ 10 items     │                    │
│  │ ▓▓▓▓▓▓░░░░░  │  │ ▓▓▓░░░░░░░  │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
│  Timeline                                               │
│  ● Building AI Agents in Production                     │
│  │ Saved 2h ago · YouTube                              │
│  ● The Future of Semantic Search                        │
│  │ Saved 5h ago · Blog                                 │
│  ● RAG vs Fine-Tuning Explained                        │
│    Saved 1d ago · YouTube                              │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- Search bar with Ctrl+K badge at top
- Recently saved list: type icon (colored), title, metadata line (source · time · domain), category badge
- Category cards: emoji, name, item count, proportional progress bar
- Timeline: vertical connector lines with colored dots, title, relative time, source

### 4.2 Add Content Page

```
┌─────────────────────────────────────────────────────────┐
│  ✨ Save New Content                                    │
│  Paste any link — YouTube, Instagram, Twitter/X, etc.   │
├─────────────────────────────────────────────────────────┤
│  URL                                                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔗 https://youtube.com/watch?v=abc123    ✅      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  NOTES (optional)                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Add your notes or thoughts about this content...  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ▶ YouTube detected                                │   │
│  │   https://youtube.com/watch?v=abc123              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [Save Content]  [Cancel]                               │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- URL input with real-time validation (green checkmark / red alert)
- Multi-line notes textarea
- URL preview card: type icon + detected source + full URL
- Save + Cancel buttons

### 4.3 Search Page

```
┌─────────────────────────────────────────────────────────┐
│  Search                                                 │
│  🔍  Search your vault with AI...                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔍 semantic search                        [↵]    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [AI Hybrid]  [Semantic]  [Keyword]                     │
│                                                         │
│  Found 3 results for "semantic search"                   │
│                                                         │
│  ┌──────────────────────────────────────────┬──────┐    │
│  │ ▶ Semantic Search with Vector Embeddings │ 98   │    │
│  │   A deep dive into how semantic search   │Match │    │
│  │   works using vector embeddings...       │      │    │
│  │   [AI]  YouTube · 12 min                 │      │    │
│  ├──────────────────────────────────────────┼──────┤    │
│  │ ✏ Building a Hybrid Search Engine for RAG│ 94   │    │
│  │   Combining keyword and semantic search  │Match │    │
│  │   [Search]  Blog · 8 min                 │      │    │
│  └──────────────────────────────────────────┴──────┘    │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- Prominent search bar with pre-filled value
- Mode chips: AI Hybrid (default), Semantic, Keyword
- Result cards: thumbnail, title, 2-line description, metadata badges, relevance score on right
- Relevance score: large number (0-100) + "Match" label

### 4.4 Content Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]                                              │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │              ▶  Video Thumbnail                 │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  Building AI Agents in Production                        │
│  ▶ youtube · youtube.com                      [🔗][🗑] │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │ 🧠 AI-Generated Summary                        │     │
│  │ This talk explores practical patterns for      │     │
│  │ building and deploying AI agents in production │     │
│  │ environments...                                │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  [AI Agents] [Production] [LLM] [Tool Use]              │
│  ─────────────────────────────────────────────────────  │
│  🕐 Saved          📅 Type        ❤️ Tone      🎓 Edu │
│  May 24, 2026      youtube     educational    9/10     │
│  ─────────────────────────────────────────────────────  │
│  🔗 https://youtube.com/watch?v=abc123xyz              │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- Large thumbnail with gradient placeholder fallback
- Title + type icon + domain + action buttons (open original, delete)
- AI-generated summary in a tinted/prominent box
- Tag pills with tag icon
- Metadata grid: Saved date, Content type, Emotional tone, Educational relevance
- Original URL in a styled bar with link icon

---

## 5. Component Hierarchy

### 5.1 Component Tree

```
RootLayout
├── Toaster
└── Pages
    ├── DashboardPage
    │   └── DashboardLayout
    │       ├── Navbar
    │       │   ├── Logo (Archive)
    │       │   ├── Search icon → /search
    │       │   ├── Dashboard icon → /dashboard
    │       │   ├── Dark mode toggle
    │       │   └── User avatar dropdown
    │       ├── Sidebar
    │       │   ├── "Save Content" button
    │       │   ├── Nav items (Dashboard, Search, Timeline, Save New)
    │       │   └── Category quick-links
    │       └── Main content
    │           ├── SearchBar
    │           ├── StatsCard (×4)
    │           ├── RecentSaves
    │           │   └── ContentCard[]
    │           ├── CategoryCards
    │           ├── TimelineWidget
    │           ├── InsightsWidget
    │           └── CategoryPie
    │
    ├── NewContentPage
    │   └── DashboardLayout
    │       └── ContentForm
    │           ├── URL input (with validation)
    │           ├── Notes textarea
    │           ├── URL preview
    │           └── Save / Cancel buttons
    │
    ├── SearchPage
    │   └── DashboardLayout
    │       ├── SearchBar
    │       ├── Mode chips
    │       └── SearchResults
    │           └── ResultCard[]
    │
    ├── ContentDetailPage
    │   └── DashboardLayout
    │       └── ContentDetail
    │           ├── Thumbnail
    │           ├── Title + Actions
    │           ├── Summary box
    │           ├── Tag pills
    │           ├── Metadata grid
    │           └── URL bar
    │
    ├── TimelinePage
    │   └── DashboardLayout
    │       └── Date groups
    │           └── ContentCard[]
    │
    └── SignInPage (no layout)
        └── Card with GitHub / Google buttons
```

### 5.2 UI Components (shadcn/ui)

| Component | Source | Usage |
|-----------|--------|-------|
| Button | `@/components/ui/button` | All actions |
| Card | `@/components/ui/card` | Content cards, forms |
| Input | `@/components/ui/input` | Search, URL input |
| Badge | `@/components/ui/badge` | Category, status, tags |
| Avatar | `@/components/ui/avatar` | User menu |
| Separator | `@/components/ui/separator` | Dividers |
| Tabs | `@/components/ui/tabs` | Search type tabs |
| Skeleton | `@/components/ui/skeleton` | Loading states |
| Toast | `@/components/ui/toast` | Notifications |
| DropdownMenu | `@/components/ui/dropdown-menu` | User menu |

---

## 6. User Flows

### 6.1 Content Save Flow

```
   ┌──────────┐
   │ Open App │
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │Paste URL │
   └────┬─────┘
        │
        ▼
    ┌─────────┐
   ┌┤ Valid   │
   ││ URL?    │──No──→ ┌──────────┐
   │└─────────┘        │Show Error│──Retry──→ Paste URL
   │ Yes               └──────────┘
   ▼
   ┌──────────────────┐
   │Metadata Extraction│
   │OpenGraph · Title  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ AI Categorization │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────┐
   │Tag Generation│
   └──────┬───────┘
           │
           ▼
   ┌──────────────────┐
   │Summary Generation│
   └────────┬─────────┘
            │
            ▼
   ┌───────────────────┐
   │Embedding Generator│
   └────────┬──────────┘
            │
            ▼
   ┌──────────────────┐
   │ PostgreSQL Store  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Dashboard Update  │
   │ (UI Refresh)     │
   └──────────────────┘
```

### 6.2 Semantic Search Flow

```
   ┌──────────────┐
   │ Enter Query  │
   │ Natural lang │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │Search Parser │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Embed Query  │◄────┐
   └──────┬───────┘     │
          │              │
          ▼              │
    ┌─────────┐          │
   ┌┤ Search  │          │
   ││ Type?   │          │
   │└─────────┘          │
   │ Semantic  │ Keyword │
   ▼           ▼         │
   ┌──────────┐          │
   │  Vector   │          │
   │  Search   │          │
   └────┬─────┘          │
        │                │
        ▼                │
   ┌──────────────┐      │
   │Hybrid Ranking│      │
   │ Rerank+score │      │
   └──────┬───────┘      │
          │              │
          ▼              │
   ┌──────────────┐      │
   │   Results    │      │
   │   Display    │      │
   └──────────────┘      │
                          │
   ┌──────────────┐      │
   │  Embeddings  │──────┘
   │  (pgvector)  │
   └──────────────┘
```

### 6.3 User Journey

```
[Paste Link] → [Processing] → [Categorized] → [Stored] → [Search Later] → [Retrieve]
     │              │              │             │             │              │
 URL submitted    AI analyzes    Tags        Saved to DB   Semantic      View content
                                 assigned                  query
```

---

## 7. Folder Structure

```
content-archive/
│
├── .env                          # Environment variables
├── .env.example                  # Example env template
├── .gitignore
├── README.md
├── docker-compose.yml            # Postgres + AI Service + Web
├── package.json                  # Root workspace
├── PROJECT_SPECIFICATION.md      # This document
│
├── apps/
│   └── web/                      # Next.js 14 application
│       ├── .env                  # App-specific env
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── next.config.js
│       ├── tsconfig.json
│       │
│       ├── prisma/
│       │   ├── schema.prisma     # Database schema
│       │   ├── seed.ts           # Demo data seeder
│       │   └── dev.db            # SQLite dev database
│       │
│       └── src/
│           ├── app/
│           │   ├── globals.css           # Global styles + theme
│           │   ├── layout.tsx            # Root layout (font, metadata)
│           │   ├── page.tsx              # → redirect(/dashboard)
│           │   │
│           │   ├── api/
│           │   │   ├── auth/
│           │   │   │   └── [...nextauth]/route.ts
│           │   │   ├── content/
│           │   │   │   ├── route.ts       # GET (list), POST (create)
│           │   │   │   └── [id]/route.ts  # GET, DELETE, PATCH
│           │   │   ├── insights/
│           │   │   │   └── dashboard/route.ts  # Dashboard stats
│           │   │   └── search/
│           │   │       └── route.ts       # Hybrid search
│           │   │
│           │   ├── auth/
│           │   │   └── [...nextauth]/page.tsx  # Sign-in page
│           │   ├── content/
│           │   │   ├── [id]/page.tsx      # Content detail
│           │   │   └── new/page.tsx       # Add content form
│           │   ├── dashboard/page.tsx     # Main dashboard
│           │   ├── search/page.tsx        # Search page
│           │   └── timeline/page.tsx      # Chronological view
│           │
│           ├── components/
│           │   ├── content/
│           │   │   ├── ContentCard.tsx    # Card with status badge
│           │   │   ├── ContentDetail.tsx  # Full detail view
│           │   │   ├── ContentForm.tsx    # Save form with validation
│           │   │   └── ContentList.tsx    # Paginated list
│           │   │
│           │   ├── dashboard/
│           │   │   ├── CategoryCards.tsx  # Grid with progress bars
│           │   │   ├── CategoryPie.tsx    # Donut chart (recharts)
│           │   │   ├── InsightsWidget.tsx # AI insight cards
│           │   │   ├── RecentSaves.tsx    # Recent items list
│           │   │   ├── StatsCard.tsx      # Metric card
│           │   │   └── TimelineWidget.tsx # Timeline list
│           │   │
│           │   ├── layout/
│           │   │   ├── DashboardLayout.tsx # Provider wrapper
│           │   │   ├── Navbar.tsx         # Top navigation bar
│           │   │   └── Sidebar.tsx        # Left sidebar
│           │   │
│           │   ├── search/
│           │   │   ├── SearchBar.tsx      # Search input with Ctrl+K
│           │   │   └── SearchResults.tsx  # Result cards with score
│           │   │
│           │   └── ui/                   # shadcn/ui primitives
│           │       ├── avatar.tsx
│           │       ├── badge.tsx
│           │       ├── button.tsx
│           │       ├── card.tsx
│           │       ├── dropdown-menu.tsx
│           │       ├── input.tsx
│           │       ├── separator.tsx
│           │       ├── skeleton.tsx
│           │       ├── tabs.tsx
│           │       ├── toast.tsx
│           │       └── toaster.tsx
│           │
│           ├── hooks/
│           │   ├── use-toast.ts           # Toast hook
│           │   ├── useContent.ts          # Content CRUD + list
│           │   ├── useInsights.ts         # Dashboard stats
│           │   └── useSearch.ts           # Search results
│           │
│           └── lib/
│               ├── auth.ts               # NextAuth v5 config
│               ├── prisma.ts             # Prisma client singleton
│               └── utils.ts              # cn(), formatRelativeTime(),
│                                          # formatDate(), getDomain(), etc.
│
├── packages/
│   └── shared/                    # Shared TypeScript package
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts           # Re-exports
│           ├── types.ts           # SavedContent, SearchResult, DashboardStats...
│           └── constants.ts       # CATEGORIES, CATEGORY_META, CONTENT_TYPE_*...
│
├── services/
│   └── ai/                       # FastAPI AI microservice
│       ├── .env.example
│       ├── Dockerfile
│       ├── requirements.txt
│       └── src/
│           ├── __init__.py
│           ├── main.py           # FastAPI app + CORS + lifespan
│           ├── config.py         # Settings via pydantic-settings
│           │
│           ├── db/
│           │   ├── __init__.py
│           │   └── client.py     # psycopg2 + pgvector operations
│           │
│           ├── models/
│           │   ├── __init__.py
│           │   └── schemas.py    # Pydantic request/response models
│           │
│           ├── pipeline/
│           │   ├── __init__.py
│           │   ├── classifier.py # AI + keyword classification
│           │   ├── embedder.py   # sentence-transformers / OpenAI
│           │   ├── extractor.py  # YouTube, Instagram, Twitter, web
│           │   └── summarizer.py # AI + extractive summarization
│           │
│           └── routers/
│               ├── __init__.py
│               ├── content.py    # /api/ai/process, /api/ai/embed
│               └── search.py     # /api/search semantic
│
└── scripts/
    ├── dev.sh                    # Development startup script
    └── setup.sh                  # Initial project setup
```

---

## 8. Technical Decisions

### 8.1 Stack Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG, file-based routing, React Server Components, excellent DX |
| **Language** | TypeScript | Type safety, better refactoring, self-documenting code |
| **Styling** | TailwindCSS + shadcn/ui | Utility-first, customizable, accessible primitives, dark mode built-in |
| **Auth** | NextAuth v5 | Prisma adapter, GitHub + Google OAuth, session management |
| **ORM** | Prisma | Type-safe queries, migrations, schema-first, SQLite for dev |
| **Database** | PostgreSQL + pgvector | Production-grade, vector similarity search via pgvector extension |
| **AI Service** | FastAPI (Python) | Async support, Pydantic validation, OpenAI SDK + sentence-transformers |
| **Search** | Hybrid (keyword + semantic) | pgvector for embeddings + full-text search for keywords |
| **Data Fetching** | SWR | Stale-while-revalidate, caching, optimistic updates |
| **Charts** | Recharts | React-native, composable, responsive |

### 8.2 Architecture Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Monorepo with npm workspaces** | Shared types between web + AI service, single `npm install`, coordinated versioning |
| 2 | **Separate AI microservice** | Python ecosystem for ML (sentence-transformers, OpenAI), isolated scaling, language-appropriate |
| 3 | **Prisma for dev/prod parity** | SQLite in dev (zero setup), PostgreSQL in prod — same schema, same queries |
| 4 | **SWR over React Query** | Lighter weight, built-in revalidation, good enough for this use case |
| 5 | **pgvector over Pinecone/Weaviate** | Self-hosted, no external dependency, single database, good enough for scale |
| 6 | **OpenAI with keyword fallback** | AI provides better quality; keyword fallback ensures zero-downtime operation |
| 7 | **Glassmorphism design** | Modern SaaS aesthetic, works well with dark theme, matches wireframe specs |

### 8.3 Design System

**Colors (Dark Theme):**
- Background: `#0b0d11` (hsl 230 12% 6%)
- Surface: `hsl(228 10% 10%)`
- Primary: `hsl(239 84% 67%)` (Indigo-500)
- Accent: `hsl(186 100% 42%)` (Cyan-500)
- Text: `hsl(220 13% 91%)`
- Muted: `hsl(228 6% 50%)`
- Border: `hsl(228 6% 18%)`

**Typography:**
- Font: Inter (system fallback: -apple-system, Segoe UI)
- Scale: 12 / 13 / 14 / 16 / 18 / 20 / 24 / 28 / 32 px
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Spacing:**
- 4px grid, increments of 4 (4, 8, 12, 16, 20, 24, 32, 40, 48...)
- Card padding: 16-24px
- Section gap: 24px

**Glassmorphism:**
```css
.glass-card {
  background: hsl(var(--card) / 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border) / 0.6);
}
```

### 8.4 Performance Considerations

- **AI processing is async**: User gets immediate response, AI pipeline runs in background
- **SWR caching**: Dashboard data cached and revalidated automatically
- **Prisma connection pooling**: Singleton client prevents connection exhaustion
- **pgvector indexing**: IVFFlat index for approximate nearest neighbor search
- **Lazy loading**: Pages are dynamically rendered only when requested

### 8.5 Security

- **Authentication**: NextAuth v5 with OAuth providers (GitHub, Google)
- **Authorization**: Server-side session checks on all API routes
- **Input validation**: Zod schemas on all API inputs
- **CORS**: AI service allows all origins (internal network only)
- **Environment variables**: Secrets never committed, `.env.example` provides template

### 8.6 Development Workflow

```bash
# Setup
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Run (two terminals)
cd services/ai && uvicorn src.main:app --reload --port 8000
npm run dev                    # :3000

# Docker
docker-compose up -d
```

---

## Appendix A: Runtime Configuration

### A.1 Authentication Secret
Stored in `apps/web/.env` (gitignored). Generate with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### A.2 Environment Variables (.env)
| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `file:./dev.db` | SQLite for local dev |
| `AUTH_SECRET` | *(generate, see A.1)* | NextAuth JWT encryption |
| `NEXTAUTH_URL` | `http://localhost:3000` | App base URL |
| `GITHUB_CLIENT_ID` | *(empty)* | Set for GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | *(empty)* | Set for GitHub OAuth |
| `GOOGLE_CLIENT_ID` | *(empty)* | Set for Google OAuth |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Set for Google OAuth |
| `NVIDIA_API_KEY` | *(empty)* | NVIDIA AI inference API key |
| `NVIDIA_MODEL` | `llama-4-maverick-17b-128e-instruct` | NVIDIA model name |

### A.3 AI Provider Architecture
- **Primary**: `NvidiaProvider` — sends extracted content to NVIDIA llama-4-maverick for structured JSON (summary, category, tags, takeaways, tone)
- **Fallback**: `KeywordProvider` — keyword-based classification and extractive summarization (zero API calls, always works)
- **Fallback chain**: `processContentInline()` tries NvidiaProvider first; on any failure (missing key, network error, invalid response, timeout), automatically falls back to KeywordProvider
- **Content saving never fails**: AI processing runs async and non-blocking; failures are logged, results are best-effort

### A.4 Auth Implementation Details
- **Strategy**: JWT (required by Credentials provider with PrismaAdapter)
- **Session config**: `session: { strategy: "jwt" }` in NextAuth config
- **Session callback**: Returns `session.user.id` from `token.sub`
- **JWT callback**: Persists `user.id` into `token.sub` on sign-in
- **Providers**:
  - GitHub OAuth (conditional — only enabled when env vars are set)
  - Google OAuth (conditional — only enabled when env vars are set)
  - Demo Credentials (always enabled — finds or creates user by email `demo@contentarchive.dev`)

### A.4 Deviations from Spec
| # | Deviation | Reason |
|---|-----------|--------|
| 1 | **SQLite instead of PostgreSQL** | Zero setup for local dev; schema is identical, swap to PostgreSQL in prod |
| 2 | **Inline JS processing as primary fallback** | Python AI service requires separate setup; inline JS works out of the box |
| 3 | `**.env excluded from git** | Security best practice; refer to this appendix for values |

### A.5 New Fields
| Field | Type | Stored as | Description |
|-------|------|-----------|-------------|
| `takeaways` | `string[]` | JSON string in `SavedContent.takeaways` | Key takeaway bullet points from content analysis |

### A.6 Deviations from Spec
| # | Deviation | Reason |
|---|-----------|--------|
| 1 | **SQLite instead of PostgreSQL** | Zero setup for local dev; schema is identical, swap to PostgreSQL in prod |
| 2 | **Inline JS processing as primary fallback** | Python AI service requires separate setup; inline JS works out of the box |
| 3 | `**.env excluded from git** | Security best practice; refer to this appendix for values |

---

*End of Project Specification — Smart Content Vault v1.0.0*

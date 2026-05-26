# Smart Content Vault — Project Specification

> **Version:** 2.0.0  
> **Status:** Approved Implementation  
> **Stack:** Next.js 14 + PostgreSQL  
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
│  [URL Input] → [Metadata Extraction] → [Title/OG Scraper]   │
│              → [Thumbnail Extraction] → [Favicon Fetch]     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Extracted Content
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              CONTENT ORGANIZATION LAYER                      │
│  [Category Assignment] → [Tag Generation]                   │
│         (keyword-based, local, instant)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Store
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  STORAGE LAYER                               │
│  PostgreSQL                                                 │
│  [content] [categories] [tags] [users] [search history]     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Query
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEARCH LAYER                                │
│     [Keyword Search] → [Category Filter] → [Tag Match]      │
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
User → Save URL → Extract Metadata → Categorize → Generate Tags → Database Storage → Dashboard Display
```

**Search Pipeline:**
```
User Query → Keyword Match → Category Filter → Results Display
```

### 1.3 System Architecture

```
┌──────────────┐     ┌──────────────┐
│   Next.js 14 │────▶│  PostgreSQL  │
│   (App Router)│    │              │
│   :3000      │     │  :5432       │
└──────────────┘     └──────────────┘
        │
        │  Custom JWT Auth (jose + bcryptjs)
        │  Content Extraction via fetch + regex
        │  Category/Tag via keyword matching
        └────────────────────────────────────
```

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐
│      User       │       │    SavedContent      │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │◀──────│ userId (FK)          │
│ username        │       │ id (PK)              │
│ passwordHash    │       │ url                  │
│ name            │       │ title                │
│ email           │       │ description          │
│ createdAt       │       │ thumbnailUrl         │
│ updatedAt       │       │ contentType          │
└─────────────────┘       │ note                 │
        │                 │ category             │
        │                 │ tags (JSON string)   │
        ▼                 │ processingStatus     │
┌─────────────────┐       │ createdAt            │
│  SearchHistory  │       │ updatedAt            │
├─────────────────┤       └─────────────────────┘
│ id (PK)         │
│ userId (FK)     │
│ query           │
│ resultCount     │
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
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String          @id @default(cuid())
  username      String          @unique
  passwordHash  String
  name          String?
  email         String?
  savedContents SavedContent[]
  searchHistory SearchHistory[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model SavedContent {
  id               String   @id @default(cuid())
  userId           String
  url              String
  title            String?
  description      String?
  thumbnailUrl     String?
  contentType      String   @default("website")
  note             String?
  category         String?
  tags             String   @default("[]")
  processingStatus String   @default("pending")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  searchHistory  SearchHistory[]

  @@index([userId])
  @@index([category])
  @@index([createdAt])
}

model SearchHistory {
  id             String   @id @default(cuid())
  userId         String
  query          String
  resultCount    Int      @default(0)
  savedContentId String?
  createdAt      DateTime @default(now())

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  savedContent SavedContent? @relation(fields: [savedContentId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([userId, createdAt])
}
```

### 2.3 Indexes

| Table | Index | Type |
|-------|-------|------|
| SavedContent | `userId` | B-tree |
| SavedContent | `category` | B-tree |
| SavedContent | `createdAt` | B-tree |
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
      "title": "Building MLOps Pipeline Using Kubeflow",
      "description": "Kubeflow",
      "thumbnailUrl": "https://img.youtube.com/vi/.../maxresdefault.jpg",
      "contentType": "youtube",
      "note": "Great walkthrough",
      "category": "MLOps",
      "tags": ["mlops", "kubeflow", "pipeline"],
      "processingStatus": "completed",
      "createdAt": "2026-05-24T10:30:00Z",
      "updatedAt": "2026-05-24T10:32:00Z"
    }
  ],
  "total": 42
}
```

#### `POST /api/content`
Save new content from a URL. Metadata is extracted immediately, category and tags are assigned synchronously.

**Body:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "note": "Optional note"
}
```

**Response:** `201 Created` — Single SavedContent object with category, tags, and processingStatus="completed".

#### `GET /api/content/[id]`
Get single content item.

**Response:** Single SavedContent object (or 404).

#### `DELETE /api/content/[id]`
Delete content (ownership check). Returns `204 No Content`.

#### `PATCH /api/content/[id]`
Update note, category, or tags.

#### `GET /api/search`
Search content with keyword matching.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | — | Search query |
| type | enum | "keyword" | "keyword" only |
| category | string | — | Filter by category |
| limit | number | 20 | Max items |
| offset | number | 0 | Pagination |

**Response:**
```json
{
  "results": [
    {
      "content": { /* SavedContent */ },
      "score": 0.5,
      "matchType": "keyword"
    }
  ],
  "total": 15
}
```

**Scoring Logic:**
- Simple contains-match across title, description, category, notes, and tags.

#### `GET /api/insights/dashboard`
Aggregated dashboard statistics.

**Response:**
```json
{
  "totalSaves": 42,
  "categoryDistribution": { "MLOps": 10, "Programming": 8, ... },
  "recentSaves": [ /* SavedContent[] */ ],
  "topTags": [
    { "tag": "react", "count": 8 }
  ],
  "weeklyActivity": [
    { "date": "2026-05-18", "count": 3 }
  ]
}
```

---

## 4. Wireframe Descriptions

### 4.1 Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  🔍  Search your content archive...            [Ctrl+K] │
├─────────────────────────────────────────────────────────┤
│  Recently Saved                                         │
│  ┌──────────────────────────────────────────────┐       │
│  │ ▶  Building MLOps Pipeline Using Kubeflow    │       │
│  │    YouTube · 2h ago · youtube.com    [MLOps] │       │
│  ├──────────────────────────────────────────────┤       │
│  │ ✏  Python for Beginners Tutorial             │       │
│  │    Blog · 5h ago · example.com  [Programming]│       │
│  └──────────────────────────────────────────────┘       │
│                                                         │
│  Categories                                             │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ 🛠 DevOps    │  │ 💻 Program. │                    │
│  │ 12 items     │  │ 15 items     │                    │
│  │ ▓▓▓▓▓░░░░░░  │  │ ▓▓▓░░░░░░░  │                    │
│  ├──────────────┤  ├──────────────┤                    │
│  │ 🚀 Startups  │  │ 🎓 Education │                    │
│  │ 8 items      │  │ 10 items     │                    │
│  │ ▓▓▓▓▓▓░░░░░  │  │ ▓▓▓░░░░░░░  │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                         │
│  Timeline                                               │
│  ● Building MLOps Pipeline Using Kubeflow               │
│  │ Saved 2h ago · YouTube                              │
│  ● Python for Beginners Tutorial                        │
│  │ Saved 5h ago · Blog                                 │
│  ● Docker Crash Course                                  │
│    Saved 1d ago · YouTube                              │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- Search bar with keyboard shortcut at top
- Recently saved list: type icon, title, metadata line (source · time · domain), category badge
- Category cards: emoji, name, item count, proportional progress bar
- Timeline: vertical connector lines with colored dots, title, relative time, source

### 4.2 Add Content Page

```
┌─────────────────────────────────────────────────────────┐
│  📑 Save New Content                                    │
│  Paste a link and save it instantly                     │
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
- URL preview card: type icon + detected source + truncated URL
- Save + Cancel buttons

### 4.3 Search Page

```
┌─────────────────────────────────────────────────────────┐
│  Search                                                 │
│  Search your saved content                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔍 kubeflow pipeline                    [Search] │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Found 2 results for "kubeflow pipeline"                │
│                                                         │
│  ┌──────────────────────────────────────────┬──────┐    │
│  │ ▶ Building MLOps Pipeline Using Kubeflow │ 50   │    │
│  │   A comprehensive guide to building      │Match │    │
│  │   ML pipelines with Kubeflow...          │      │    │
│  │   [MLOps]  YouTube · 2h ago             │      │    │
│  ├──────────────────────────────────────────┼──────┤    │
│  │ ✏ Kubeflow 101: Getting Started          │ 50   │    │
│  │   Introduction to Kubeflow for           │Match │    │
│  │   machine learning workflows             │      │    │
│  │   [MLOps]  Blog · 1d ago                │      │    │
│  └──────────────────────────────────────────┴──────┘    │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- Search bar with pre-filled value and large hit area
- Result cards: thumbnail, title, 2-line description, category badge, type, time, domain
- Match score indicator on right

### 4.4 Content Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  [← Back]                                              │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │              ▶  Video Thumbnail                 │     │
│  └────────────────────────────────────────────────┘     │
│                                                         │
│  Building MLOps Pipeline Using Kubeflow                  │
│  ▶ youtube · youtube.com     [MLOps]         [🔗][🗑] │
│                                                         │
│  [mlops] [kubeflow] [pipeline] [machine-learning]       │
│                                                         │
│  This guide walks through setting up a complete MLOps   │
│  pipeline using Kubeflow...                              │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  🕐 Saved          📅 Type        🏷 Category          │
│  May 24, 2026      youtube       MLOps                 │
│  ─────────────────────────────────────────────────────  │
│  🔗 https://youtube.com/watch?v=abc123xyz              │
│                                                         │
│  Your Note                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Great overview of the MLOps lifecycle              │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Key elements:**
- Large thumbnail with platform-specific placeholder fallback
- Title + type icon + domain + category badge + action buttons
- Tag pills with relevant keywords
- Description in a tinted box
- Metadata grid: Saved date, Content type, Category
- Original URL in a styled bar
- Optional notes section

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
    │       │   ├── Logo (Content Archive)
    │       │   ├── Search icon → /search
    │       │   ├── Dashboard icon → /dashboard
    │       │   ├── Dark mode toggle
    │       │   └── User avatar dropdown
    │       ├── Sidebar
    │       │   ├── "Save Content" button
    │       │   ├── Nav items (Dashboard, Search, Timeline, Save New)
    │       │   └── Category quick-links
    │       ├── FAB (floating save button)
    │       └── Main content
    │           ├── SearchBar
    │           ├── StatsCard (×3)
    │           ├── RecentSaves
    │           │   └── ContentCard[]
    │           ├── CategoryCards
    │           ├── TimelineWidget
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
    │       └── SearchResults
    │           └── ResultCard[]
    │
    ├── ContentDetailPage
    │   └── DashboardLayout
    │       └── ContentDetail
    │           ├── Thumbnail (with platform fallback)
    │           ├── Title + Category badge + Actions
    │           ├── Tag pills
    │           ├── Description
    │           ├── Metadata grid
    │           ├── URL bar
    │           └── Notes section
    │
    ├── TimelinePage
    │   └── DashboardLayout
    │       └── Date groups
    │           └── ContentCard[]
    │
    ├── LoginPage (no layout)
    │   └── Card with LoginForm
    │
    └── RegisterPage (no layout)
        └── Card with RegisterForm
```

### 5.2 UI Components (shadcn/ui)

| Component | Source | Usage |
|-----------|--------|-------|
| Button | `@/components/ui/button` | All actions |
| Card | `@/components/ui/card` | Content cards, forms |
| Input | `@/components/ui/input` | Search, URL input |
| Badge | `@/components/ui/badge` | Category, tags, status |
| Avatar | `@/components/ui/avatar` | User menu |
| Separator | `@/components/ui/separator` | Dividers |
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
   │(oEmbed / OG tags) │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │Category Assignment│
   │(keyword matching) │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────┐
   │Tag Generation│
   │(from title)  │
   └──────┬───────┘
           │
           ▼
   ┌──────────────────┐
   │ PostgreSQL Store  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Redirect to     │
   │ Content Detail   │
   └──────────────────┘
```

### 6.2 Search Flow

```
   ┌──────────────┐
   │ Enter Query  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Keyword Match │
   │ (title, desc, │
   │  category,    │
   │  tags, notes) │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Category     │
   │ Filter (opt) │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Results    │
   │   Display    │
   └──────────────┘
```

### 6.3 User Journey

```
[Paste Link] → [Instant Save] → [Categorized] → [Tagged] → [Search Later] → [Retrieve]
     │              │                │             │             │              │
 URL submitted   Metadata        Category      Tags         Full-text      View details
                 extracted       assigned      generated    search         with metadata
```

---

## 7. Folder Structure

```
smart-content-vault/
│
├── .env                          # Environment variables
├── .env.example                  # Example env template
├── .gitignore
├── README.md
├── docker-compose.yml            # PostgreSQL container (optional)
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
│       │   └── seed.ts           # Demo data seeder
│       │
│       ├── public/
│       │   └── assets/
│       │       └── placeholders/ # Platform SVGs (youtube, instagram, etc.)
│       │
│       └── src/
│           ├── app/
│           │   ├── globals.css           # Global styles + theme
│           │   ├── layout.tsx            # Root layout (font, metadata)
│           │   ├── page.tsx              # → redirect(/dashboard)
│           │   │
│           │   ├── api/
│           │   │   ├── auth/
│           │   │   │   ├── login/route.ts
│           │   │   │   ├── logout/route.ts
│           │   │   │   ├── me/route.ts
│           │   │   │   └── register/route.ts
│           │   │   ├── content/
│           │   │   │   ├── route.ts       # GET (list), POST (create)
│           │   │   │   └── [id]/route.ts  # GET, DELETE, PATCH
│           │   │   ├── insights/
│           │   │   │   └── dashboard/route.ts  # Dashboard stats
│           │   │   └── search/
│           │   │       └── route.ts       # Keyword search
│           │   │
│           │   ├── content/
│           │   │   ├── [id]/page.tsx      # Content detail
│           │   │   └── new/page.tsx       # Add content form
│           │   ├── dashboard/page.tsx     # Main dashboard
│           │   ├── login/page.tsx         # Login page
│           │   ├── register/page.tsx      # Registration page
│           │   ├── search/page.tsx        # Search page
│           │   └── timeline/page.tsx      # Chronological view
│           │
│           ├── components/
│           │   ├── content/
│           │   │   ├── ContentCard.tsx    # Card with thumbnail, title, category, tags
│           │   │   ├── ContentDetail.tsx  # Full detail view
│           │   │   └── ContentForm.tsx    # Save form with URL validation
│           │   │
│           │   ├── dashboard/
│           │   │   ├── CategoryCards.tsx  # Grid with progress bars
│           │   │   ├── CategoryPie.tsx    # Donut chart (recharts)
│           │   │   ├── RecentSaves.tsx    # Recent items list
│           │   │   ├── StatsCard.tsx      # Metric card
│           │   │   └── TimelineWidget.tsx # Timeline list
│           │   │
│           │   ├── layout/
│           │   │   ├── DashboardLayout.tsx # Provider wrapper + FAB
│           │   │   ├── Navbar.tsx         # Top navigation bar
│           │   │   └── Sidebar.tsx        # Left sidebar
│           │   │
│           │   ├── search/
│           │   │   ├── SearchBar.tsx      # Search input
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
│               ├── auth.ts               # JWT auth helpers
│               ├── categorizer.ts         # Keyword-based category detection
│               ├── prisma.ts             # Prisma client singleton
│               ├── processing.ts         # Metadata extraction + categorization + tags
│               ├── tag-generator.ts       # Tag generation from title
│               ├── thumbnail.ts          # Thumbnail fallback hierarchy
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
└── scripts/
    └── auto-commit.ps1            # Dev auto-commit watcher (optional)
```

---

## 8. Technical Decisions

### 8.1 Stack Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG, file-based routing, React Server Components, excellent DX |
| **Language** | TypeScript | Type safety, better refactoring, self-documenting code |
| **Styling** | TailwindCSS + shadcn/ui | Utility-first, customizable, accessible primitives, dark mode built-in |
| **Auth** | Custom JWT (jose + bcryptjs) | Simple, no external dependencies, HttpOnly cookies |
| **ORM** | Prisma | Type-safe queries, migrations, schema-first |
| **Database** | PostgreSQL | Production-grade relational database |
| **Search** | Keyword / full-text | Matches across title, description, category, tags, notes |
| **Data Fetching** | SWR | Stale-while-revalidate, caching, optimistic updates |
| **Charts** | Recharts | React-native, composable, responsive |

### 8.2 Architecture Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Monorepo with npm workspaces** | Shared types, single `npm install`, coordinated versioning |
| 2 | **Custom JWT over NextAuth** | Simpler setup, no OAuth provider dependencies, full control |
| 3 | **Keyword-based categorization** | Fast, local, no API calls, easy to maintain and extend |
| 4 | **Platform placeholder SVGs** | No broken images, meaningful fallbacks, lightweight |
| 5 | **SWR over React Query** | Lighter weight, built-in revalidation, good enough for this use case |
| 6 | **Glassmorphism design** | Modern SaaS aesthetic, works well with dark theme |
| 7 | **FAB for global save** | Always accessible, reduces friction for content capture |

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

- **Instant saves**: No background queues; metadata extraction and categorization complete synchronously
- **SWR caching**: Dashboard data cached and revalidated automatically
- **Prisma connection pooling**: Singleton client prevents connection exhaustion
- **Lazy loading**: Pages are dynamically rendered only when requested
- **Static placeholder assets**: Platform SVGs are small, cached, and never fail to load

### 8.5 Security

- **Authentication**: Custom JWT with HttpOnly cookies, 7-day expiration
- **Authorization**: Server-side session checks on all API routes
- **Input validation**: Zod schemas on all API inputs
- **Password hashing**: bcryptjs with 12 salt rounds
- **Environment variables**: Secrets never committed, `.env.example` provides template

### 8.6 Development Workflow

```bash
# Setup
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Run
npm run dev  # :3000

# Docker (PostgreSQL only)
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
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `AUTH_SECRET` | *(generate, see A.1)* | JWT signing secret (32+ chars) |
| `NEXTAUTH_URL` | `http://localhost:3000` | App base URL |

### A.3 Auth Implementation Details
- **Strategy**: JWT with `jose` library (HS256 algorithm)
- **Cookies**: HttpOnly, Secure (prod), SameSite=Lax
- **Expiration**: 7 days
- **Session lookup**: Middleware reads session cookie on every request → verifies JWT → loads user from DB
- **API Routes**:
  - `POST /api/auth/register` — Create account with username + password
  - `POST /api/auth/login` — Authenticate, set session cookie
  - `POST /api/auth/logout` — Clear session cookie
  - `GET /api/auth/me` — Current user info

### A.4 Content Organization
- **Category Assignment**: `categorizer.ts` matches title + domain against 20 keyword-defined categories
- **Tag Generation**: `tag-generator.ts` extracts significant words from title, removes stop words, deduplicates, caps at 5
- **Tag Fallback**: If no keywords match, uses the domain hostname as a single tag

### A.5 Thumbnail Fallback Hierarchy

1. OpenGraph image (`og:image`) from HTML metadata
2. YouTube thumbnail (via oEmbed or `img.youtube.com`)
3. Google favicon (`s2/favicons`)
4. Platform-specific placeholder SVG (7 variants)

Placeholders never produce broken image icons.

---

*End of Project Specification — Smart Content Vault v2.0.0*

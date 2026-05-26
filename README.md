# Smart Content Vault

A personal knowledge bookmarking and organization platform. Save content from across the internet, organize it automatically, and rediscover it later.

No AI processing. No unnecessary complexity. Just fast, reliable content capture and retrieval.

---

## Why Smart Content Vault

People consume enormous amounts of online content daily — YouTube videos, articles, documentation, GitHub repositories, Instagram posts, tweets, and more. Valuable information gets lost in browser tabs, forgotten bookmarks, and endless scroll.

Smart Content Vault solves this by providing a central place to:

- **Capture** content instantly with a single link
- **Organize** automatically using smart categories and tags
- **Browse** by timeline, category, or search
- **Rediscover** saved content when you need it

---

## Core Features

- **URL Saving** — Save any link: YouTube, Instagram, Twitter/X, articles, blogs, documentation, websites
- **Metadata Extraction** — Automatically fetches title, description, thumbnail, and favicon from saved URLs
- **Category Assignment** — Content is automatically categorized from 20 categories based on title keywords
- **Auto Tag Generation** — Up to 5 relevant tags generated per item; falls back to domain name
- **Timeline View** — Chronological browsing of all saved content
- **Search** — Find saved content by title, description, category, tags, or notes
- **Content Archive** — Browse, filter, and manage your entire collection
- **Responsive Interface** — Works on desktop, tablet, and mobile (375px+)
- **Dark Mode** — Beautiful glassmorphism design with dark mode first

---

## Screens & Workflow

```
Discover Content → Save URL → Metadata Extraction → Category Assignment → Tag Generation → Search & Browse
```

### Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | Overview with stats, recent saves, category cards, timeline widget |
| **Timeline** | Chronological browsing grouped by date |
| **Search** | Full-text search with results, category badges, and match scores |
| **Content Detail** | Full view with thumbnail, metadata, tags, description, and notes |
| **Save Content** | Add new content by URL with optional notes |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes, Prisma ORM |
| Database | PostgreSQL |
| Auth | Custom JWT (jose + bcryptjs), HttpOnly cookies |
| Hosting | Vercel (web), Neon (database) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16

### 1. Clone and install

```bash
git clone <repo-url>
cd smart-content-vault
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your database URL and auth secret
```

### 3. Set up the database

```bash
npm run setup
```

### 4. Start the web app

```bash
npm run dev
```

Visit http://localhost:3000

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | JWT signing secret (32+ chars) | Yes |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) | For auth callbacks |

For Docker:

```bash
docker-compose up -d
```

---

## Local Development

### Install dependencies

```bash
npm install
```

### Generate Prisma client and push schema

```bash
npm run prisma:generate
npm run prisma:push
```

### Seed demo data

```bash
npm run prisma:seed
```

### Start development server

```bash
npm run dev
```

---

## Deployment

Smart Content Vault is designed for easy deployment on Vercel + Neon:

1. Set up a Neon PostgreSQL database
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/content` | List saved content |
| POST | `/api/content` | Save new content |
| GET | `/api/content/:id` | Get content details |
| DELETE | `/api/content/:id` | Delete content |
| PATCH | `/api/content/:id` | Update content |
| GET | `/api/search` | Search content |
| GET | `/api/insights/dashboard` | Dashboard stats |

---

## Product Vision

Smart Content Vault is built for a world where knowledge is scattered across dozens of platforms and formats. The long-term vision is a personal knowledge system that helps you not just save content, but make sense of it over time.

### Design Principles

- **Mobile-first** — Optimized for saving on the go
- **Fast interactions** — Save completes instantly, no background queues
- **Minimal friction** — Paste a URL, that's it
- **Clean information architecture** — Categories, tags, and timeline are the primary organizational primitives
- **Modern bookmarking experience** — Beyond browser bookmarks: searchable, taggable, browsable

### Target Audience

- Developers saving documentation, tutorials, and tools
- Students collecting research and course materials
- Researchers organizing sources and papers
- Knowledge workers managing references and resources
- Lifelong learners curating their personal library
- Professionals tracking industry content
- Anyone who consumes large amounts of online content

---

## Roadmap

### Phase 1 — Current

- Fast content capture with URL saving
- Automatic metadata extraction
- Category classification from title keywords
- Auto tag generation
- Full-text search
- Timeline and dashboard views
- Responsive design (375px+)

### Phase 2 — Coming Next

- Collections for grouping related content
- Advanced filtering and sorting
- Browser extension for one-click saving
- Android companion app

### Phase 3 — Future Possibilities

- Optional AI-powered summaries (user-configurable)
- Semantic search using vector embeddings
- Content recommendations based on saved interests
- Knowledge graph features for content relationships
- Learning insights and reading analytics

*Items in future phases are under consideration and not currently implemented. Contributions and feedback are welcome.*

---

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT

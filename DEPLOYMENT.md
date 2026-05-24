# Deployment Guide

## Architecture

- **Hosting**: Vercel (serverless Next.js)
- **Database**: Neon (serverless PostgreSQL)
- **Auth**: NextAuth v5 (JWT strategy)

---

## 1. Neon Database Setup

1. Go to https://console.neon.tech and sign up (free tier: 0.5 GB, 100 compute hours/month).
2. Create a new project.
3. Copy the connection string from the dashboard:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this as `DATABASE_URL` — you'll need it for Vercel.

---

## 2. Vercel Setup

### 2.1 Create Project

1. Go to https://vercel.com and import your GitHub repo.
2. Set **Root Directory** to `apps/web` (Vercel will auto-detect Next.js).
3. Select **Next.js** framework.

The `vercel.json` at the repo root handles the monorepo configuration automatically.

### 2.2 Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Generate via `openssl rand -hex 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | Yes | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |
| `NEXTAUTH_SECRET` | Yes | Same value as `AUTH_SECRET` |
| `GITHUB_CLIENT_ID` | Optional | For GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Optional | For GitHub OAuth |
| `GOOGLE_CLIENT_ID` | Optional | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | For Google OAuth |
| `NVIDIA_API_KEY` | Optional | For NVIDIA AI analysis |
| `NVIDIA_MODEL` | Optional | Default: `meta/llama-4-maverick-17b-128e-instruct` |

Add these to three environments: **Production**, **Preview**, and **Development**.

### 2.3 Build Settings

These are auto-configured by `vercel.json`:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `apps/web/.next` |
| Install Command | `npm install` |

---

## 3. Database Migration

After setting env vars on Vercel, trigger an initial deploy. Vercel will:

1. Install dependencies (`npm install`)
2. Generate Prisma client (`prisma generate` via build)
3. Build Next.js (`next build`)

**But migrations must be applied manually.** After the first deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull production env vars locally
vercel pull --environment=production

# Run migrations against production database
cd apps/web
npx prisma migrate deploy

# Or if using db push:
npx prisma db push
```

Alternatively, add a `postinstall` script or use Vercel's Post-Deploy hook to run:
```bash
npx prisma migrate deploy
```

---

## 4. Local Development with PostgreSQL

### Option A: Neon (recommended)

```bash
# apps/web/.env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

```bash
npm run dev
```

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL locally, then create a database
createdb content-archive

# apps/web/.env
DATABASE_URL="postgresql://localhost:5432/content-archive"
```

```bash
npm run prisma:push
npm run dev
```

---

## 5. Seed Data (Optional)

```bash
cd apps/web
npx prisma db seed
```

This creates a demo user (`demo@contentarchive.dev`) and sample content records.

---

## 6. Env File Template

Copy `apps/web/.env.example` to `apps/web/.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="<run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">"
NEXTAUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

NVIDIA_API_KEY=""
NVIDIA_MODEL="meta/llama-4-maverick-17b-128e-instruct"
```

---

## 7. Verify Production Readiness

- [ ] Neon database created and connection string saved
- [ ] All env vars set in Vercel dashboard
- [ ] First Vercel deploy succeeded
- [ ] Migrations applied (`npx prisma migrate deploy`)
- [ ] Demo user can sign in at `https://your-app.vercel.app/auth/signin`
- [ ] Content can be saved and processed

# Deployment Guide

## Overview

Smart Content Vault is deployed as a Next.js application on Vercel with a PostgreSQL database on Neon.

---

## Database Setup (Neon)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

---

## Vercel Deployment

### 1. Connect repository

- Go to [vercel.com](https://vercel.com) and import your GitHub repository
- Root directory: `apps/web`
- Framework: Next.js

### 2. Configure environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Yes | JWT signing secret (32+ chars) |
| `NEXTAUTH_URL` | Yes | Your production URL (e.g. `https://your-app.vercel.app`) |

### 3. Build settings

Vercel will auto-detect Next.js settings from `vercel.json`. Defaults:

```json
{
  "buildCommand": "cd ../.. && npm install && cd apps/web && npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### 4. Deploy

Vercel automatically deploys on every push to the `main` branch.

---

## Database Migrations

Run after initial deploy or schema changes:

```bash
npm run prisma:push
npm run prisma:seed
```

For production, set `DATABASE_URL` to your Neon connection string first.

---

## Local PostgreSQL Development

### Option 1: Docker

```bash
docker-compose up -d
```

### Option 2: Local install

Create the database:

```bash
createdb content-archive
```

Update `.env`:

```
DATABASE_URL="postgresql://localhost:5432/content-archive"
```

Push schema:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

---

## Seed Data

The seed script creates:

- Demo user: `demo` / `demodemo`
- Sample saved content with various content types, categories, and tags

Run with:

```bash
npm run prisma:seed
```

---

## Production Checklist

- [ ] `AUTH_SECRET` is a long random string (32+ characters)
- [ ] `NEXTAUTH_URL` matches your production domain
- [ ] `DATABASE_URL` points to a production Neon database (not local)
- [ ] Environment variables are set in Vercel dashboard (not in `.env`)
- [ ] Build succeeds with `npm run build` in the `apps/web` directory
- [ ] Home page (`/`) redirects to `/dashboard` for authenticated users
- [ ] Login/register flow works with demo credentials
- [ ] Content saving, categorization, and tag generation work as expected
- [ ] Search returns results across saved content

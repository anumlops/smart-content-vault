# JWT Authentication Replacement

Replace Auth.js/NextAuth with simple username/password + JWT cookie auth.

## Design

- JWT signed with `jose` using `AUTH_SECRET`, 7-day configurable expiration via `JWT_EXPIRES_IN`
- bcryptjs password hashing, configurable rounds via `BCRYPT_ROUNDS` env var (default 12)
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no Max-Age (browser session)
- Middleware protects `/dashboard`, `/search`, `/timeline`, `/content/*`

## API Routes

| Route | Method | Body | Response |
|-------|--------|------|----------|
| `/api/auth/register` | POST | `{ username, password }` | `201 { user }` |
| `/api/auth/login` | POST | `{ username, password }` | `200 { user }` + Set-Cookie |
| `/api/auth/logout` | POST | — | `200` + Clear-Cookie |

## Auth Helper

`getCurrentUser()` — reads `session` cookie → verifies JWT → loads user from Prisma → returns user or throws 401.

## Protected Routes

All `/api/content`, `/api/search`, `/api/insights/dashboard` use `getCurrentUser()` and filter by `userId`.

## Files

- Create: `lib/auth/jwt.ts`, `lib/auth/getCurrentUser.ts`, `lib/auth/index.ts`, route handlers, login/register pages, middleware
- Modify: `prisma/schema.prisma`, API routes, `package.json`, `.env`
- Delete: old Auth.js config and pages

## Security

- bcryptjs (10-12 rounds)
- jose JWT with HS256
- HttpOnly cookies, never expose token to JS
- No plain-text passwords stored

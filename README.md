# Real Estate Index — Claude Code Project Pack

Starter pack for building a real estate index in **VS Code** with **Claude Code**.

## What this pack includes

- Product definition and phased execution plan
- Claude Code repo guidance
- Next.js folder scaffold
- Prisma schema
- Seed script with demo properties
- Environment variable template
- Suggested task prompts for Claude Code
- Basic starter components and pages

## Product scope

Public website:
- Home page with a gallery of all marketed properties
- Property details page with gallery, map, video, and seller contact form

Admin:
- Login page
- Dashboard
- Property create/edit flow
- Media management
- Publish/unpublish

## Recommended stack

- Next.js 15+
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth
- Zod
- Leaflet or Mapbox
- Cloudinary / S3-compatible storage

## Quick start

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Open in browser:
- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Suggested order inside Claude Code

1. Read `docs/PRODUCT_SPEC.md`
2. Read `docs/PHASE_PLAN.md`
3. Read `CLAUDE.md`
4. Run Phase 1 prompt from `docs/CLAUDE_PROMPTS.md`
5. Continue phase by phase

## Notes

This is a **starter pack**, not a completed production app.
It is intentionally structured so Claude Code can continue implementation cleanly inside VS Code.

## Suggested install commands

```bash
npm install next react react-dom
npm install zod @prisma/client prisma next-auth bcryptjs
npm install react-hook-form @hookform/resolvers
npm install leaflet react-leaflet
npm install clsx lucide-react
npm install -D typescript @types/node @types/react @types/react-dom
```

For media and mail later:
```bash
npm install cloudinary resend
```

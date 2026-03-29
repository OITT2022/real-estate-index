# Claude Code Prompts

## Phase 1
```text
Read README.md, docs/PRODUCT_SPEC.md, docs/PHASE_PLAN.md, and CLAUDE.md.

Then scaffold the project into a clean Next.js App Router application with TypeScript and Tailwind conventions. Keep architecture simple. Prepare public and admin sections. Do not overengineer.
```

## Phase 2
```text
Create the Prisma database layer for Property, PropertyImage, Inquiry, and AdminUser. Make sure the schema supports image ordering, a primary image, seller contact details, publish state, and SEO fields. Then improve the seed script with realistic demo data.
```

## Phase 3
```text
Build the public homepage with:
- hero section
- filter bar
- responsive property gallery
- featured listings
- recent listings

Use server-side data loading and a polished real estate design.
```

## Phase 4
```text
Build the dynamic property page by slug.

Requirements:
- image gallery
- summary and details
- specs grid
- map section using coordinates
- video section
- contact seller form
- related properties
- dynamic metadata
```

## Phase 5
```text
Build admin authentication and a protected admin layout. Then create the dashboard and property list page. Use a practical structure that can be maintained easily.
```

## Phase 6
```text
Build property create and edit forms in admin with Zod validation. Support:
- title
- slug
- description
- price
- city
- address
- coordinates
- property details
- seller contact fields
- SEO fields
- publish/unpublish
```

## Phase 7
```text
Add media management:
- multiple images
- primary image
- sort order
- video URL
Use a temporary local strategy first, but keep the code ready to move to Cloudinary or S3 later.
```

## Phase 8
```text
Implement inquiry persistence and an admin inquiry list. Add clean success/error states and basic spam protection.
```

## Phase 9
```text
Polish the entire app for production:
- sitemap
- robots.txt
- metadata
- loading states
- empty states
- error states
- responsive refinements
- README updates
```

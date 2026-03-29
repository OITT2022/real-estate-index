# Claude Code Repository Guidance

## Mission
Build a clean, production-oriented real estate index with a strong public browsing experience and a practical admin panel.

## Non-negotiables
- Use **TypeScript everywhere**
- Keep architecture **simple and maintainable**
- Prefer **server components** where appropriate
- Use **Prisma** for all database access
- Validate inputs with **Zod**
- Use **server actions** or route handlers consistently
- Keep components small and reusable
- Avoid premature abstraction
- Keep SEO in mind for all public pages
- Write code that is easy to review in VS Code

## UI principles
- Premium real estate feel
- Spacious layout
- Strong typography
- Cards with clear hierarchy
- Excellent mobile behavior
- Fast page loads
- Clean admin UX

## Data principles
- All listings should support:
  - title
  - slug
  - description
  - price
  - city
  - address
  - lat/lng
  - images
  - video URL
  - seller contact data
  - publish status
- Dedicate separate models for images and inquiries

## Coding conventions
- Use `lib/` for shared services and helpers
- Use `components/` for UI and domain components
- Keep route files thin
- Co-locate page-specific UI near usage only when justified
- Add comments only when they improve clarity

## Admin rules
- Admin routes must be protected
- Use optimistic but safe form UX
- Draft, active, sold, archived statuses should be supported
- Image ordering should be supported

## Delivery rules
When implementing a phase:
1. Briefly explain the architecture choice
2. Create/update files
3. Update README if setup changes
4. Keep the solution simple
5. Leave clear TODOs only when necessary

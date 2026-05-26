# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 16 portfolio site** (single application, no backend/database/external services).

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves on http://localhost:3000) |
| Build | `npm run build` |
| Start prod | `npm start` |

### Important notes

- **Lint is broken**: The `npm run lint` script calls `next lint`, which was removed in Next.js 15+. There is no ESLint config in this project. TypeScript checking is done during `npm run build` instead.
- **No environment variables** are needed — no `.env` files, no secrets, no database.
- **Two routes**: `/` (portfolio homepage with entrance animation) and `/art` (scroll-based ink story viewer).
- **MP3 asset support**: `next.config.ts` configures both Turbopack and Webpack to handle `.mp3` files as assets.
- The dev server starts quickly (~300ms) and uses Turbopack by default.

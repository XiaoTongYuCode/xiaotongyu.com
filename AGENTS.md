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
- **Routes**: `/` (personal workbench homepage with the walking crowd), `/about` (personal introduction with the original scroll-driven animation), and `/work` (selected projects with a Mewa product film). `/version/2` permanently redirects to `/`.
- **Shared presentation**: `app/_components/site/SiteChrome.tsx` owns the navigation and footer; site colors, typography, and gutters live in `app/globals.css`. The homepage components live in `app/_components/home/`.
- The dev server starts quickly (~300ms) and uses Turbopack by default.

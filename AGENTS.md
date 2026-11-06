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
- **Routes**: `/` (personal workbench homepage with the walking crowd), `/about` (personal introduction with the original scroll-driven animation), and `/work` (selected projects with a Mewa product film). Chinese versions live at `/zh`, `/zh/about`, and `/zh/work`. `proxy.ts` rewrites English URLs to the internal `/en` routes; do not link to `/en` publicly. `/version/2` permanently redirects to `/`.
- **Language**: The URL determines server-rendered content through `app/[locale]/layout.tsx`. The language switch links to the same page in the other language and saves a preference cookie; old localStorage preferences migrate in the head before paint. Keep canonical URLs, reciprocal hreflang, and sitemap entries aligned.
- **Verification**: `npm run test:localization` checks routing and preference migration; `npm run test:site -- http://localhost:3107` checks a running production preview's six pages, SEO responses, redirects, and 404s.
- **Shared presentation**: `app/_components/site/SiteChrome.tsx` owns the navigation and footer; site colors, typography, and gutters live in `app/globals.css`. The homepage components live in `app/_components/home/`.
- **Walking crowd**: `public/walkers/cast.json` defines six silhouettes from four captures; `source.json` keeps the source licenses. `npm run test:walkers` checks atlas boundaries, loop continuity, calibration, and projection. `scripts/verify-walker-browser.py` covers Chromium/WebKit, reduced motion, tracking, and failed-image fallback against a production preview. Start local production QA with `npm start -- --port 3107 --hostname localhost` and use the same hostname in tests.
- The dev server starts quickly (~300ms) and uses Turbopack by default.

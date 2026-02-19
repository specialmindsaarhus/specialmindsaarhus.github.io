# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Historical context archived in `claude-historic/`.

## Project Overview

Special Minds Aarhus — educational website for autistic students aged 16-25. Built with Astro + React, deployed to GitHub Pages at https://specialmindsaarhus.github.io.

The site features interactive tutorials and learning games, including an algorithm cookie-decoration game that teaches computational thinking.

## Branches

- `main` — live production site (GitHub Pages deploys from here)
- `dev` — parallel development branch (current active work)

## Development Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # Production build (includes type check)
npm run preview    # Preview production build
npm run astro check  # Type check only
```

## Architecture

### Astro + React Islands

Static site generator (Astro) with React islands for interactive components. Interactive components use `client:only="react"` directive.

```
src/
├── pages/           # Astro pages (routes)
├── layouts/         # Layout templates (Layout.astro)
├── components/      # Reusable components
│   ├── *.astro     # Static Astro components
│   └── cookie-game/ # React game components
└── data/           # Static JSON data
```

### Deployment

- Automated via GitHub Actions (`.github/workflows/deploy.yml`)
- Triggers on push to `main`
- Config: `astro.config.mjs`

## Cookie Game — Key Facts

- Location: `src/components/cookie-game/`
- Entry: `CookieGameWrapper.tsx` → `ChallengeList.tsx` → `ChallengeView.tsx`
- Challenges data: `src/data/cookie-challenges.json`
- Types: `src/components/cookie-game/lib/types.ts`
- User progress: localStorage via `lib/storage.ts`
- Core interpreter: `AlgorithmExecutor.ts` — custom pseudocode parser (indentation-based scoping)

See `claude-historic/CLAUDE-2025-phase1.md` for deep implementation notes on AlgorithmExecutor.

## Testing

```bash
node test-algorithm-executor.mjs   # Cookie game parser tests (plain JS)
npx tsx test-variables.mjs          # Variable system tests (TypeScript)
```

## Coding Standards

- **Styling**: Tailwind CSS v3, utility-first classes
- **TypeScript**: strict mode, type check runs before every build
- **React**: v19, functional components only
- **Astro**: static-first, use `client:only="react"` for interactive islands
- **No framework magic**: keep component responsibilities clear and minimal

## Adding Content

**New tutorial page** (hardcoded Astro):
1. Create `src/pages/your-page.astro`
2. Wrap with `Layout.astro`
3. Add a Card link on `src/pages/index.astro`

**New CMS-backed page — Claude API workflow** (no `.astro` file needed):
1. Read `DIRECTUS_URL` and `DIRECTUS_TOKEN` from the local `.env` file.
2. POST the page to production Directus:
   ```bash
   curl -X POST "$DIRECTUS_URL/items/pages" \
     -H "Authorization: Bearer $DIRECTUS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"slug":"my-page","title":"...","status":"published",...}'
   ```
3. The page is **immediately live** via the `404.astro` fallback (no rebuild needed).
4. Directus fires a webhook → GitHub Actions rebuilds → page gets a proper static route + appears in homepage card grid (~2 min).

**New CMS-backed page — co-worker workflow** (content managed in Directus admin UI):
1. In Directus admin (`https://cms.spmi.dk`), create a `pages` item with the desired slug and set status to `published`. Add `info_cards` and their `items`.
2. Page is immediately live via the 404 fallback. Rebuild happens automatically via webhook.

That's it. No `.astro` file or code change is needed for CMS pages.

## Directus CMS

- **Local admin**: `http://localhost:8055` (start with `docker compose -f directus/docker-compose.yml up -d`)
- **Production**: `https://cms.spmi.dk` (deployed via Coolify on Hetzner VPS)
- **Env var for frontend**: `PUBLIC_DIRECTUS_URL` (set in `.env` locally, in GitHub Actions secrets for production)

### Collections

| Collection | Key fields |
|---|---|
| `pages` | `slug`, `title`, `subtitle`, `status` (draft\|published), `video_url`, `intro_label`, `intro_text`, `body_label`, `body_text` |
| `info_cards` | `title`, `variant` (normal\|accent), `sort`, `page` (M2O → pages) |
| `card_items` | `type` (step\|step-link\|hint\|list-item), `text`, `href`, `sort`, `card` (M2O → info_cards) |

### Updating the content model

1. Edit collections in local Directus admin UI
2. Export snapshot:
   ```bash
   docker exec $(docker compose -f directus/docker-compose.yml ps -q directus) \
     npx directus schema snapshot /directus/snapshots/schema.yaml
   ```
3. Commit `directus/snapshots/schema.yaml` and push → Coolify auto-applies on next deploy

### Coolify deployment (one-time setup)

- New Resource → Docker Compose → source path `directus/`, file `docker-compose.coolify.yml`
- Set env vars from `directus/.env.example`
- Configure domain (Traefik + SSL handled automatically)
- Post Deploy Command: `npx directus schema apply /directus/snapshots/schema.yaml`

### Key files

- `directus/docker-compose.yml` — local dev
- `directus/docker-compose.coolify.yml` — production (Coolify)
- `directus/.env.example` — all required env vars documented
- `directus/snapshots/schema.yaml` — versioned content model (generated, not hand-written)
- `src/components/CmsPage.tsx` — React island that fetches and renders any CMS page
- `src/components/CmsPageFallback.tsx` — reads slug from `window.location.pathname`, delegates to `CmsPage`
- `src/pages/404.astro` — GitHub Pages 404 fallback; renders any published Directus page immediately

### 404 fallback — how it works

GitHub Pages serves `404.html` for unknown routes while preserving the URL in the browser.
`404.astro` renders `CmsPageFallback` (a React island) which reads the URL slug and fetches from Directus.
This means **any page published in Directus is live instantly** — before the next rebuild.

After a rebuild, `[slug].astro` + `getStaticPaths()` gives the page a proper static route.

### Directus webhook → GitHub rebuild (one-time setup)

1. **GitHub PAT**: Settings → Developer settings → Fine-grained PAT → repo `specialmindsaarhus.github.io`, permission `Actions: write`
2. **GitHub Actions secret**: repo Settings → Secrets → Actions → `PUBLIC_DIRECTUS_URL=https://cms.spmi.dk`
3. **Directus Flow**:
   - Trigger: Event Hook → `items.create` + `items.update` on collection `pages`
   - Step: Webhook POST to `https://api.github.com/repos/specialmindsaarhus/specialmindsaarhus.github.io/dispatches`
   - Headers: `Authorization: Bearer <github-pat>`, `Accept: application/vnd.github+json`
   - Body: `{"event_type":"directus-publish"}`

### Claude's production credentials

Stored in local `.env` (gitignored):
```
DIRECTUS_URL=https://cms.spmi.dk
DIRECTUS_TOKEN=<admin-token>
```
Get the token from Directus admin UI → User settings → Generate static token.

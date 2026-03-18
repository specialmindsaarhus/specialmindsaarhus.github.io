# Directus CMS

- **Local admin**: `http://localhost:8055` (start with `docker compose -f directus/docker-compose.yml up -d`)
- **Production**: `https://cms.spmi.dk` (deployed via Coolify on Hetzner VPS)
- **Env var for frontend**: `PUBLIC_DIRECTUS_URL` (set in `.env` locally, in GitHub Actions secrets for production)

## Collections

| Collection | Key fields |
|---|---|
| `pages` | `slug`, `title`, `subtitle`, `status` (draft\|published), `section` (dev\|media), `video_url`, `intro_label`, `intro_text`, `vis_ekstra` (bool), `ekstra` (rich text) |
| `info_cards` | `title`, `variant` (normal\|accent), `sort`, `content` (rich text HTML), `page` (M2O → pages) |

> **Note:** `card_items` collection was removed. Info card content is now stored as HTML in `info_cards.content`.

## Sections

The `section` field on `pages` controls which landing page a card appears on:

| Value | Page | URL |
|---|---|---|
| `dev` | Main dev page | `/` (`index.astro`) |
| `media` | Media & graphics page | `/media` (`media.astro`) |

Default is `dev`. Set at creation time — changing section after publish moves the card to the other landing page on next rebuild.

## Updating the content model

1. Edit collections in local Directus admin UI
2. Export snapshot:
   ```bash
   docker exec $(docker compose -f directus/docker-compose.yml ps -q directus) \
     npx directus schema snapshot /directus/snapshots/schema.yaml
   ```
3. Commit `directus/snapshots/schema.yaml` and push → Coolify auto-applies on next deploy

## Coolify deployment (one-time setup)

- New Resource → Docker Compose → source path `directus/`, file `docker-compose.coolify.yml`
- Set env vars from `directus/.env.example`
- Configure domain (Traefik + SSL handled automatically)
- Post Deploy Command: `npx directus schema apply /directus/snapshots/schema.yaml`

## Key files

- `directus/docker-compose.yml` — local dev
- `directus/docker-compose.coolify.yml` — production (Coolify)
- `directus/.env.example` — all required env vars documented
- `directus/snapshots/schema.yaml` — versioned content model (generated, not hand-written)
- `src/components/CmsPage.tsx` — React island that fetches and renders any CMS page
- `src/components/CmsPageFallback.tsx` — reads slug from `window.location.pathname`, delegates to `CmsPage`
- `src/pages/404.astro` — GitHub Pages 404 fallback; renders any published Directus page immediately

## 404 fallback — how it works

GitHub Pages serves `404.html` for unknown routes while preserving the URL in the browser.
`404.astro` renders `CmsPageFallback` (a React island) which reads the URL slug and fetches from Directus.
This means **any page published in Directus is live instantly** — before the next rebuild.

After a rebuild, `[slug].astro` + `getStaticPaths()` gives the page a proper static route.

## Directus webhook → GitHub rebuild (one-time setup)

1. **GitHub PAT**: Settings → Developer settings → Fine-grained PAT → repo `specialmindsaarhus.github.io`, permission `Actions: write`
2. **GitHub Actions secret**: repo Settings → Secrets → Actions → `PUBLIC_DIRECTUS_URL=https://cms.spmi.dk`
3. **Directus Flow**:
   - Trigger: Event Hook → `items.create` + `items.update` on collection `pages`
   - Step: Webhook POST to `https://api.github.com/repos/specialmindsaarhus/specialmindsaarhus.github.io/dispatches`
   - Headers: `Authorization: Bearer <github-pat>`, `Accept: application/vnd.github+json`
   - Body: `{"event_type":"directus-publish"}`

## Claude's production credentials

Stored in local `.env` (gitignored):
```
DIRECTUS_URL=https://cms.spmi.dk
DIRECTUS_TOKEN=<admin-token>
```
Get the token from Directus admin UI → User settings → Generate static token.

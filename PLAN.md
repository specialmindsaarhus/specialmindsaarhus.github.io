# CMS Migration Plan
## Special Minds Aarhus — Directus + Astro Hybrid

> Created: 2026-02-18
> Branch: `dev`
> Status: Planning

---

## End Goal

A CMS-backed content pipeline where:

- **Co-worker** manages media/graphic pages through a polished admin UI — no code, no git
- **Developer** adds new page types by updating a schema file and an Astro component — one push deploys everything
- **Claude** can configure new content models, generate schema snapshots, and scaffold new pages from a documented structure
- **Existing hardcoded pages** stay untouched until deliberately migrated
- **All new pages** go through Directus from day one

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| CMS | Directus (Docker) | Best non-tech UI, REST API, schema snapshots in git |
| Database | PostgreSQL (Docker) | Robust, industry standard, Directus native |
| Reverse proxy | Caddy | Auto HTTPS, zero SSL config |
| Frontend | Astro (existing) | Unchanged — stays on GitHub Pages |
| Dynamic page rendering | React island (`client:only="react"`) | Fits existing pattern, fetches from Directus |
| Local dev | Docker Compose | Identical to prod, no surprises |
| Schema versioning | Directus snapshot YAML | Content model in git, data stays on VPS |
| CI/CD (frontend) | GitHub Actions → GitHub Pages | Existing, unchanged |
| CI/CD (schema) | GitHub Actions → SSH → Hetzner | New: applies schema on push to main |
| Hosting | Hetzner VPS (existing) | Already paid for |

---

## UX Requirements

### Co-worker (non-technical)
- Logs into `cms.[domain]` over HTTPS
- Sees only her collections — no system tables, no clutter
- Creates/edits pages using a structured form (title, subtitle, video, info-cards)
- Adds/removes info-cards with drag-to-reorder
- Uploads images to a media library (thumbnails, folder organisation)
- Changes go live in seconds — no "is it deployed yet?"
- Password-protected — no public access to admin

### Developer
- `docker compose up` → full local Directus at `http://localhost:8055`
- Local environment is identical to production (same image, same schema)
- Schema changes: edit locally → export snapshot → `git push` → auto-deployed
- New page type = update `schema.yaml` + create one Astro page + one React component
- Co-worker's content is never touched by schema deploys

### Claude
- Content model documented in `CLAUDE.md`
- Schema snapshot at `directus/snapshots/schema.yaml` is readable and editable
- REST API base URL and collection names documented
- Adding a new CMS-backed page is a documented, repeatable pattern

---

## Content Model (based on tryhackme.astro pattern)

```
pages
├── id
├── slug              (unique, URL path: "media-grafik", "tryhackme")
├── title             ("TryHackMe")
├── subtitle          ("Lær om hacking...")
├── status            (draft | published)
├── video_url         (optional YouTube embed URL)
├── intro_label       (optional bold label before intro, e.g. "Hvorfor")
├── intro_text        (the intro paragraph)
├── body_label        (optional)
├── body_text         (the body paragraph)
└── info_cards        → [many info_cards]

info_cards
├── id
├── page              → pages.id
├── sort              (drag-to-reorder)
├── title             ("Kom i gang")
├── variant           (normal | accent)
└── items             → [many card_items]

card_items
├── id
├── card              → info_cards.id
├── sort
├── type              (step | step-link | hint | list-item)
├── text              ("1) Opret en gratis konto...")
└── href              (optional, for step-link type)
```

---

## Phase 0 — Local Docker environment

**Goal**: Directus running locally, identical to what will run on VPS.

### To-do
- [ ] Create `directus/` folder in repo root
- [ ] Write `directus/docker-compose.yml` (Directus + PostgreSQL)
- [ ] Write `directus/.env.example` (document all required vars, no secrets)
- [ ] Write `directus/.env` (local secrets — gitignored)
- [ ] Add `directus/.env` and `directus/database/` and `directus/uploads/` to `.gitignore`
- [ ] Run `docker compose up -d` — verify Directus at `http://localhost:8055`
- [ ] Verify admin login works

**Deliverable**: One command spins up a full local CMS.

---

## Phase 1 — Content model + schema snapshot

**Goal**: Content model defined locally, exported to git, ready to apply anywhere.

### To-do
- [ ] Log into local Directus admin
- [ ] Create `pages` collection with all fields (slug, title, subtitle, status, video_url, intro_label, intro_text, body_label, body_text)
- [ ] Create `info_cards` collection with sort field + relation to `pages`
- [ ] Create `card_items` collection with sort field + relation to `info_cards`
- [ ] Configure M2O relations (pages → info_cards → card_items)
- [ ] Set display templates (show `title` field in relation pickers)
- [ ] Configure public role: read-only access to `pages`, `info_cards`, `card_items`
- [ ] Create `Editor` role for co-worker: full CRUD on those three collections + media library, no access to system
- [ ] Run: `docker exec directus npx directus schema snapshot /directus/snapshots/schema.yaml`
- [ ] Commit `directus/snapshots/schema.yaml` to git

**Deliverable**: Schema in git. Running `schema apply` on any fresh Directus instance reproduces the full content model.

---

## Phase 2 — Astro integration (the media/graphic page)

**Goal**: First CMS-backed page live on the site, co-worker can edit it.

### To-do
- [ ] Add `DIRECTUS_URL` to Astro environment (`.env` locally, GitHub secret for Actions)
- [ ] Create `src/components/CmsPage.tsx` — React island that:
  - Fetches a page by slug from Directus REST API
  - Fetches nested info_cards and card_items
  - Renders with same CSS classes/structure as hardcoded pages (info-card, card-title, step-link, hint, etc.)
  - Shows a loading state while fetching
  - Shows a friendly error if content not found
- [ ] Create `src/pages/medier.astro` — static shell using `<CmsPage client:only="react" slug="medier" />`
- [ ] Add "Medier & Grafik" card to `src/pages/index.astro`
- [ ] Enter sample content in local Directus for the `medier` slug
- [ ] Test locally: page renders correctly, matches visual style of existing pages
- [ ] Push — verify it builds and deploys on GitHub Pages
- [ ] Verify page loads content from local Directus (or note it will need VPS URL after Phase 3)

**Deliverable**: The media page exists and renders CMS content. Component is reusable for all future CMS pages.

---

## Phase 3 — VPS deployment

**Goal**: Directus live on Hetzner with HTTPS, schema deployed from git.

### To-do

**VPS prep**
- [ ] SSH into Hetzner VPS
- [ ] Install Docker + Docker Compose plugin (if not present)
- [ ] Create deploy user or use existing
- [ ] Create `/srv/directus/` directory on VPS
- [ ] Set up DNS: point `cms.[domain]` A record to VPS IP

**Caddy + HTTPS**
- [ ] Write `directus/Caddyfile`:
  ```
  cms.[domain] {
      reverse_proxy directus:8055
  }
  ```
- [ ] Add Caddy service to `docker-compose.yml`
- [ ] Caddy handles cert provisioning automatically on first request

**Secrets**
- [ ] Create `/srv/directus/.env` on VPS (production secrets — never committed)
- [ ] Add GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `DIRECTUS_URL`

**GitHub Actions — schema deploy**
- [ ] Write `.github/workflows/deploy-directus.yml`:
  - Triggers on push to `main` (changes in `directus/` path)
  - SSH to VPS
  - `git pull`
  - `docker compose pull`
  - `docker compose up -d`
  - `docker exec directus npx directus schema apply /directus/snapshots/schema.yaml`
- [ ] Test: push a schema change → verify it appears on VPS without data loss

**Go live**
- [ ] Update `DIRECTUS_URL` in Astro from `localhost:8055` to `https://cms.[domain]`
- [ ] Push — Astro rebuilds, media page now fetches from live VPS
- [ ] Verify HTTPS on `cms.[domain]`
- [ ] Verify media page loads content end-to-end

**Deliverable**: Full pipeline live. Co-worker can edit content, changes appear on site within seconds.

---

## Phase 4 — Co-worker onboarding

**Goal**: Co-worker is independent, no dev needed for day-to-day content.

### To-do
- [ ] Create co-worker Directus account with `Editor` role
- [ ] Walk through: logging in, creating a page, adding info-cards, uploading an image
- [ ] Add first real media/graphic content together
- [ ] Write a 1-page cheat sheet (in Danish): how to log in, add a card, upload an image
- [ ] Confirm she can operate independently

**Deliverable**: Co-worker owns the media page.

---

## Phase 5 — New pages (the endless pattern)

**Goal**: Adding a new CMS page is a documented, repeatable, Claude-executable task.

### To-do
- [ ] Document the pattern in `CLAUDE.md`:
  - How to add a new CMS-backed page (slug in Directus + `src/pages/[name].astro` + card on index)
  - Where the `CmsPage` component lives
  - Directus REST API pattern for fetching pages
- [ ] Test: ask Claude to add a second CMS page from scratch using only the documented pattern
- [ ] Confirm the pattern works without manual intervention

**Deliverable**: Any new page can be added by Claude in one session — create content in Directus, scaffold the Astro page, done.

---

## Phase 6 — Migration of existing hardcoded pages (optional, future)

**Goal**: Existing pages like `tryhackme.astro` move into Directus so they can be edited without code changes.

### Approach
- Old `.astro` files stay as-is until you choose to migrate them
- Migration = enter their content into Directus + replace the `.astro` body with `<CmsPage client:only="react" slug="tryhackme" />`
- No rush — do one at a time, whenever it makes sense
- New pages always go through Directus from Phase 5 onward

### To-do (when ready for each page)
- [ ] Enter page content into Directus (copy from `.astro` file)
- [ ] Replace `.astro` content with `CmsPage` island
- [ ] Test — visual output must be identical
- [ ] Commit

---

## Key files after full implementation

```
repo/
├── directus/
│   ├── docker-compose.yml        ← Directus + Postgres + Caddy
│   ├── Caddyfile                 ← HTTPS config, one domain per line
│   ├── .env.example              ← committed, documents required vars
│   ├── .env                      ← gitignored, local secrets
│   └── snapshots/
│       └── schema.yaml           ← THE content model, in git, Claude-editable
├── src/
│   ├── components/
│   │   └── CmsPage.tsx           ← reusable island for all CMS pages
│   └── pages/
│       ├── index.astro           ← updated with CMS page cards
│       ├── medier.astro          ← first CMS page (Phase 2)
│       └── [existing pages]      ← untouched
├── .github/workflows/
│   ├── deploy.yml                ← existing GitHub Pages deploy
│   └── deploy-directus.yml       ← new: schema deploy to Hetzner
├── CLAUDE.md                     ← updated with CMS page pattern
└── PLAN.md                       ← this file
```

---

## What never changes on a schema deploy

The `schema apply` command is **additive and non-destructive**:
- Adds new collections and fields
- Updates existing field configuration
- Never deletes content (rows) from the database
- Never touches uploaded media files

Co-worker's content is always safe.

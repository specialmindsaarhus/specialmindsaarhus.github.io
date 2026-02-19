# CMS Setup — Remaining To-Do

> Track progress by checking off boxes. Delete sections when fully done.

---

## ~~Phase 1 — Code to `main`~~ ✅ Done (2026-02-19)

dev branch merged to main. GitHub Actions deployed successfully.

---

## ~~Phase 2 — Directus on Coolify~~ ✅ Done (2026-02-19)

Directus running at https://cms.spmi.dk with SSL. Schema applied, public permissions set.

---

## ~~Phase 3 — Domain: cms.spmi.dk~~ ✅ Done (2026-02-19)

DNS A record set, SSL certificate provisioned via Let's Encrypt.

---

## ~~Phase 2 — Directus on Coolify (no domain yet)~~

Deploy Directus first using Coolify's auto-generated URL. Add the real domain in Phase 3.
This way you can verify Directus works before touching DNS.

- [ ] **In Coolify**: New Resource → Docker Compose
  - Connect GitHub repo
  - Source path: `directus/`
  - Compose file: `docker-compose.coolify.yml`
- [ ] **Set environment variables** in Coolify (from `directus/.env.example`):
  - `KEY` — generate with `openssl rand -hex 32`
  - `SECRET` — generate with `openssl rand -hex 32`
  - `DB_PASSWORD` — strong password
  - `ADMIN_EMAIL` — your admin email
  - `ADMIN_PASSWORD` — strong password
  - `PUBLIC_URL` — use Coolify's generated URL for now (e.g. `https://xyz.coolify.spmi.dk`)
- [ ] **Post Deploy Command**: `npx directus schema apply /directus/snapshots/schema.yaml`
- [ ] Deploy → verify Directus admin loads at the generated URL
- [ ] Log in → verify collections exist (`pages`, `info_cards`, `card_items`)

### After first login — permissions (manual, one-time)
- [ ] Settings → Roles → **Public** → add `read` permission on:
  - `pages` (filter: `status = published`)
  - `info_cards`
  - `card_items`
  - This allows the frontend to fetch published pages without an auth token.
- [ ] Create a test page (slug: `test`, status: published)
- [ ] Verify: `curl "https://<coolify-url>/items/pages?filter[slug][_eq]=test"` returns data

---

## Phase 3 — Domain: cms.spmi.dk

**Decision point**: Set up the domain AFTER Directus is verified working (Phase 2).
SSL certificate provisioning requires the DNS record to exist and propagate first.

- [ ] **DNS**: Add an `A` record: `cms.spmi.dk` → Hetzner VPS IP
- [ ] Wait for DNS propagation (usually a few minutes, up to 1 hour)
- [ ] **In Coolify**: add domain `https://cms.spmi.dk` to the Directus service
  - Coolify provisions SSL via Let's Encrypt automatically
- [ ] **Update env var** in Coolify: `PUBLIC_URL=https://cms.spmi.dk`
- [ ] Redeploy the Directus service in Coolify
- [ ] Verify: `https://cms.spmi.dk` loads the Directus admin
- [ ] Verify: `curl "https://cms.spmi.dk/items/pages?filter[slug][_eq]=test"` returns data

---

## Phase 4 — Connect frontend to production Directus

- [ ] **GitHub Actions secret**: repo → Settings → Secrets → Actions → New secret
  - Name: `PUBLIC_DIRECTUS_URL`
  - Value: `https://cms.spmi.dk`
- [ ] **Local `.env`**: fill in Claude's production credentials
  ```
  DIRECTUS_URL=https://cms.spmi.dk
  DIRECTUS_TOKEN=<see below>
  ```
- [ ] **Directus admin token for Claude**:
  - Directus admin UI → top-right avatar → User profile → Static token → Generate → copy
  - Paste into local `.env` as `DIRECTUS_TOKEN`
- [ ] Trigger a GitHub Actions rebuild (push any small change to `main`, or use workflow_dispatch)
- [ ] Verify: `https://specialmindsaarhus.github.io/test` renders the test page

---

## Phase 5 — Webhook (Directus → GitHub rebuild)

Enables automatic rebuild when co-worker publishes a page. The 404 fallback means pages
are already live instantly — this just makes the homepage index card appear faster.

- [ ] **GitHub PAT**:
  - GitHub → Settings → Developer settings → Fine-grained personal access tokens → New token
  - Repository: `specialmindsaarhus.github.io`
  - Permission: `Actions: write`
  - Copy the token
- [ ] **Directus Flow**:
  - Flows → New Flow
  - Trigger: Event Hook → `items.create` + `items.update` on collection `pages`
  - Action: Webhook/Request → method POST
  - URL: `https://api.github.com/repos/specialmindsaarhus/specialmindsaarhus.github.io/dispatches`
  - Headers:
    - `Authorization: Bearer <github-pat>`
    - `Accept: application/vnd.github+json`
  - Body: `{"event_type":"directus-publish"}`
- [ ] Test: publish a page in Directus → check GitHub Actions tab for a triggered run

---

## Verification checklist (end-to-end)

- [ ] `https://specialmindsaarhus.github.io/test` loads content from production Directus
- [ ] Non-existent slug shows Danish "not found" message (via 404 fallback)
- [ ] Co-worker edits a card in Directus → change visible on site within seconds (no rebuild needed)
- [ ] Co-worker publishes a new page → GitHub Actions triggered → page appears in homepage grid after ~2 min
- [ ] All existing pages (`/tryhackme`, `/godot_2d`, etc.) still render correctly
- [ ] Claude can POST a new page via API and it's immediately live

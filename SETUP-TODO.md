# CMS Setup — Remaining To-Do

> Track progress by checking off boxes. Delete sections when fully done.

---

## ~~Phase 1 — Code to `main`~~ ✅ Done (2026-02-19)

dev branch merged to main. GitHub Actions deployed successfully.

---

## ~~Phase 2 — Directus on Coolify~~ ✅ Done (2026-02-19)

Directus running at https://cms.spmi.dk. Schema applied via API, public permissions set.

**Coolify compose notes** (Docker Compose Empty — no Git connection):
- Traefik labels added manually in compose file (Coolify couldn't auto-detect port)
- `coolify` external network added to directus service
- `CORS_ORIGIN` updated to include both `https://specialmindsaarhus.github.io` and `https://dev.spmi.dk`
- `expose: ["8055"]` added to directus service
- Compose file in repo (`directus/docker-compose.coolify.yml`) is OUT OF SYNC with what's in Coolify — needs updating

---

## ~~Phase 3 — Domain: cms.spmi.dk~~ ✅ Done (2026-02-19)

DNS A record: `cms.spmi.dk → 88.198.196.41`. Directus accessible at domain.

**⚠️ SSL certificate not yet provisioned** — cms.spmi.dk shows "not secure".
Browser blocks API calls due to invalid cert → frontend can't load CMS content.
Traefik is configured with Let's Encrypt but certificate hasn't been issued yet.
Next step: check `docker logs coolify-proxy` for ACME errors.

---

## ~~Phase 4 — Connect frontend to production Directus~~ ✅ Done (2026-02-20)

- [x] **GitHub Actions secret** `PUBLIC_DIRECTUS_URL=https://cms.spmi.dk` — added
- [x] **Local `.env`** — `DIRECTUS_URL` and `DIRECTUS_TOKEN` filled in
- [x] **Rebuild triggered** — `cms.spmi.dk` correctly baked into JS bundle
- [x] **SSL** — cms.spmi.dk cert issued, HTTPS valid ✅
- [x] Verify: `https://dev.spmi.dk/media` renders the media page ✅
- [x] CMS pages appear as cards on homepage after rebuild ✅

---

## ~~🔧 Immediate blocker — SSL certificate for cms.spmi.dk~~ ✅ Resolved

Traefik retried and issued the cert. Both cms.spmi.dk and dev.spmi.dk show valid HTTPS.

---

## 🔧 SSH key setup (in progress)

Trying to add SSH public key to server for easier access.
Key: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGOP2MJanau0P/vNiErx3CHmgOUXIbohtj3cacjPxirS hetzner-vault`

Commands to run in Hetzner Console:
```bash
mkdir -p /root/.ssh && echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGOP2MJanau0P/vNiErx3CHmgOUXIbohtj3cacjPxirS hetzner-vault" | tee /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && chmod 700 /root/.ssh
```

---

## Phase 5 — Webhook (Directus → GitHub rebuild)

- [x] **Directus Flow created via API** — flow ID `2cd384e5-f33f-47d3-b20a-33c36a139e2a`, operation ID `8bde7ede-9d3b-47a1-ab4a-4afc971aef3e` ✅
- [ ] **GitHub PAT**: Settings → Developer settings → Fine-grained PAT → repo `specialmindsaarhus.github.io`, permission `Actions: write` — then update the `Authorization` header in the Directus Flow operation (Settings → Flows → Rebuild on publish → edit operation, replace `GITHUB_PAT_GOES_HERE`)
- [ ] Test: publish a page → Actions tab shows triggered run

---

## Phase 6 — Security hardening

### VPS / server
- [ ] **SSH key**: complete setup (see SSH section above), then disable password auth: set `PasswordAuthentication no` in `/etc/ssh/sshd_config` + `systemctl restart sshd`
- [ ] **Firewall (ufw)**: `ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable` — block all other inbound
- [ ] **fail2ban**: `apt install fail2ban` — protects against SSH brute force (default config is fine)
- [ ] **OS updates**: `apt update && apt upgrade -y` — patch known CVEs

### Directus API
- [ ] **Rate limiting**: added to both docker-compose files ✅ — still needs to be added in Coolify env vars UI (or redeploy from updated compose file) to take effect in production
- [ ] **Auth endpoint rate limit**: add stricter Traefik middleware on `/auth/*` (10 req/min) — prevents credential stuffing
- [ ] **Review public policy**: verify only `pages`, `info_cards`, `card_items` are public-readable (GET only) — admin panel → Settings → Roles → Public
- [ ] **Admin account**: strong password set + enable 2FA in Directus (Settings → My Profile → Two-Factor Authentication)
- [ ] **Rotate tokens**: generate a dedicated read-only token for the frontend (separate from the admin token used by Claude). Set `PUBLIC_DIRECTUS_TOKEN` in GitHub Actions secret and local `.env`, use it in `CmsPage.tsx` for requests.
- [ ] **CORS locked down**: confirm `CORS_ORIGIN` in Coolify only lists `https://specialmindsaarhus.github.io` and `https://dev.spmi.dk` — no wildcards

### Traefik / network
- [ ] Verify Coolify proxy does NOT expose Directus internal port (8055) on the public internet — only 80/443 via Traefik should be reachable

---

## Phase 7 — Schema UX: rich text content fields

**Problem**: creating a page currently requires navigating 3 levels (page → info_card → card_items) for any structured content. `intro_text` / `body_text` are plain textareas — no formatting.

**Fix**: add a WYSIWYG `content` field to `pages` (replaces the intro/body textarea combo for most pages), and a `content` field to `info_cards` (so simple cards don't need card_items at all).

### Schema changes (via Directus API — apply in production)
- [x] Add `pages.content` — type: `text`, interface: `input-rich-text-html` ✅ (applied via API)
- [x] Add `info_cards.content` — type: `text`, interface: `input-rich-text-html` ✅ (applied via API)
- [x] Schema snapshot `schema.yaml` updated in repo ✅

### Frontend changes (`CmsPage.tsx`)
- [x] Add `content?: string | null` to `CmsPageData` interface ✅
- [x] Add `content?: string | null` to `InfoCard` interface ✅
- [x] Fetch new fields in API query ✅
- [x] Render `page.content` as HTML (`<div className="rich-content">`) ✅
- [x] Render `card.content` as HTML when present, fall back to card items ✅

### Notes
- Keep `intro_label`/`intro_text`/`body_label`/`body_text` and `card_items` — they still work for existing pages and structured step content
- The `content` field is additive — use it for new pages where prose/formatting is needed

---

## Verification checklist (end-to-end)

- [ ] `https://dev.spmi.dk/media` loads content from production Directus
- [ ] Non-existent slug shows Danish "not found" message
- [ ] Co-worker edits a card → change visible within seconds (no rebuild)
- [ ] Co-worker publishes new page → appears in homepage grid after ~2 min
- [ ] All existing pages (`/tryhackme`, `/godot_2d`, etc.) still render correctly
- [ ] Claude can POST a new page via API and it's immediately live

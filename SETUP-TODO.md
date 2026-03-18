# CMS Setup — Remaining To-Do

> Phases 1–7 largely complete as of 2026-02-20. Only minor items remain.

---

## ✅ Done — summary

| Phase | What | Date |
|---|---|---|
| 1 | Code merged to main, GitHub Actions deployed | 2026-02-19 |
| 2 | Directus on Coolify at cms.spmi.dk | 2026-02-19 |
| 3 | DNS + SSL (Let's Encrypt via Traefik) | 2026-02-19/20 |
| 4 | Frontend connected to production Directus | 2026-02-20 |
| 5 | Directus webhook → GitHub rebuild (fine-grained PAT, expires 2027-02-20) | 2026-02-20 |
| 6 | VPS hardening: SSH key, no password auth, ufw, fail2ban, OS updates, rate limiting | 2026-02-20 |
| 7 | Rich text `content` field on pages + info_cards (schema + frontend) | 2026-02-20 |

---

## Remaining

### You must do (requires browser/UI)
- [ ] **Directus 2FA**: cms.spmi.dk → Settings → My Profile → Two-Factor Authentication
- [ ] **Webhook PAT renewal**: fine-grained PAT in Directus flow expires 2027-02-20 — regenerate then. Claude can update the flow via API in 30 seconds.

### Claude can do
- [ ] **Traefik rate limit on `/auth/*`**: stricter middleware (10 req/min) to prevent credential stuffing — needs SSH + Coolify compose edit
- [ ] **Read-only frontend token**: create a Directus role/token with read-only access for the frontend, replacing unauthenticated public reads

---

## Verification checklist

- [x] `https://dev.spmi.dk/media` loads content from production Directus
- [x] CMS pages appear as cards on homepage
- [x] Directus publish → GitHub Actions build triggered automatically
- [ ] Non-existent slug shows Danish "not found" message
- [ ] Co-worker edits a card → change visible within seconds (no rebuild needed)
- [ ] All existing hardcoded pages (`/tryhackme`, `/godot_2d`, etc.) still render correctly
- [ ] Claude can POST a new page via API and it's immediately live via 404 fallback

---

## Key references
- VPS: `root@88.198.196.41`
- Directus admin: https://cms.spmi.dk
- Directus flow ID: `2cd384e5-f33f-47d3-b20a-33c36a139e2a`
- Directus flow operation ID: `8bde7ede-9d3b-47a1-ab4a-4afc971aef3e`
- Coolify service UUID: `nsgcw4wwgs8w0oowgs08448c`
- Public read policy ID: `abf8a154-5b1c-4a46-ac9c-7300570f4f17`
- See `memory/tool-access.md` for API/CLI patterns

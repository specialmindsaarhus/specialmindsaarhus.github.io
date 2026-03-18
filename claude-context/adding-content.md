# Adding Content

**New tutorial page** (hardcoded Astro):
1. Create `src/pages/your-page.astro`
2. Wrap with `Layout.astro`
3. Add a Card link on `src/pages/index.astro`

**New CMS-backed page — Claude API workflow** (no `.astro` file needed):

> Use the `/cms-page` skill — it handles everything below automatically, including UTF-8 safety and placeholder video.

1. Read `DIRECTUS_URL` and `DIRECTUS_TOKEN` from the local `.env` file.
2. **Always use Python, never `curl`** — Windows terminal (cp1252) corrupts Danish characters in curl requests. Write a temporary Python script using `json.dumps(..., ensure_ascii=False).encode('utf-8')` and delete it after.
3. POST the page to production Directus (include `section`: `"dev"` or `"media"`), then POST `info_cards` (with `page` UUID and HTML `content`).
4. Insert a placeholder `video_url` (`https://www.youtube.com/embed/dQw4w9WgXcQ`) — the user replaces it in the Directus admin UI later.
5. The page is **immediately live** via the `404.astro` fallback (no rebuild needed).
6. Directus fires a webhook → GitHub Actions rebuilds → page gets a proper static route + appears in the correct section's card grid (~2 min).

**New CMS-backed page — co-worker workflow** (content managed in Directus admin UI):
1. In Directus admin (`https://cms.spmi.dk`), create a `pages` item with the desired slug, set status to `published`, and choose the correct **Section** (Dev or Media). Add `info_cards` with HTML content.
2. Page is immediately live via the 404 fallback. Rebuild happens automatically via webhook.

That's it. No `.astro` file or code change is needed for CMS pages.

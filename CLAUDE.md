# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Historical context archived in `claude-historic/`.

## Project Overview

Special Minds Aarhus — educational website for autistic students aged 16-25. Built with Astro + React, deployed to GitHub Pages at https://specialmindsaarhus.github.io.

The site features interactive tutorials and learning games, including an algorithm cookie-decoration game that teaches computational thinking.

## Branches

- `main` — live production site (GitHub Pages deploys from here)

## Development Commands

```bash
npm run dev        # Dev server at http://localhost:4321
npm run build      # Production build (includes type check)
npm run preview    # Preview production build
npm run astro check  # Type check only
```

### Local dev with live CMS data

`.env` must have `PUBLIC_DIRECTUS_URL=https://cms.spmi.dk` for CMS cards to load locally. The fallback (`http://localhost:8055`) will return no cards.

To kill stale node processes on Windows (if ports are occupied):
```bash
taskkill //F //IM node.exe
```

### Card component (`src/components/Card.astro`)

- Cards always render a top image section — either a `<img>` (if `image` prop set) or a teal placeholder div
- CMS cards build the image URL as `${base}/assets/${page.card_image}` — `card_image` is a UUID FK to `directus_files`
- Hardcoded cards in `index.astro` have no image prop → show teal placeholder

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

## Context Files

Fetch these on demand — not needed for every task:

- `claude-context/cookie-game.md` — Cookie game architecture & key files
- `claude-context/adding-content.md` — How to add CMS and hardcoded pages
- `claude-context/directus-cms.md` — Full CMS reference (collections, deployment, webhook)

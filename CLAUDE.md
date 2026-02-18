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

**New tutorial page**:
1. Create `src/pages/your-page.astro`
2. Wrap with `Layout.astro`
3. Add a Card link on `src/pages/index.astro`

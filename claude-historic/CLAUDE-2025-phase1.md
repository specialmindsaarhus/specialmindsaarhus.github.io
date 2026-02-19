# CLAUDE.md — Phase 1 Archive (pre-dev branch)

> Archived 2026-02-18. This was the active CLAUDE.md before switching to parallel development on the `dev` branch.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Special Minds Aarhus educational website built with Astro, featuring interactive tutorials and learning games for autistic students aged 16-25. The site is deployed to GitHub Pages.

## Development Commands

```bash
# Start development server (http://localhost:4321)
npm run dev

# Build for production (includes type checking)
npm run build

# Preview production build
npm run preview

# Type check only
npm run astro check
```

## Architecture

### Astro + React Islands Pattern

The site uses **Astro** as the static site generator with **React islands** for interactive components. This hybrid approach allows:
- Fast static page loads
- Interactive React components where needed (e.g., games)
- Minimal JavaScript shipped to the browser

**Key Pattern**: React components are embedded in Astro pages using the `client:only="react"` directive for client-side-only rendering.

### Site Structure

```
src/
├── pages/           # Astro pages (routes)
├── layouts/         # Layout templates
├── components/      # Reusable components
│   ├── *.astro     # Static Astro components
│   └── cookie-game/ # React game components
└── data/           # Static JSON data
```

### GitHub Pages Deployment

- **Site URL**: https://specialmindsaarhus.github.io
- **Deployment**: Automated via GitHub Actions (`.github/workflows/deploy.yml`)
- **Trigger**: Pushes to `main` branch
- **Config**: `astro.config.mjs` specifies the site URL

## Algorithm Cookie Game Architecture

A custom educational game teaching algorithmic thinking through cookie decoration. Located at `/algorithm-cookie-game`.

### Core Components

**Game State Flow**:
1. `CookieGameWrapper.tsx` - Top-level wrapper, loads challenges from JSON
2. `ChallengeList.tsx` - Challenge selection UI
3. `ChallengeView.tsx` - Main game interface (editor + visualization)
4. `AlgorithmEditor.tsx` - Code editor with syntax help
5. `CookieDisplay.tsx` - Visual cookie rendering

**Data Flow**:
- Static challenges: `src/data/cookie-challenges.json`
- User progress: localStorage (via `src/components/cookie-game/lib/storage.ts`)
- Types: `src/components/cookie-game/lib/types.ts`

### AlgorithmExecutor - Custom Pseudocode Parser

**Location**: `src/components/cookie-game/AlgorithmExecutor.ts`

This is the **most complex and critical component** - a custom interpreter for educational pseudocode.

#### Key Architecture Decisions

**Indentation-Based Scoping**:
- Uses `.trimEnd()` NOT `.trim()` to preserve leading whitespace
- Tracks indentation levels to determine scope
- Condition stack manages nested if/else-if/else blocks

**Variable System**:
- Variables stored in `Map<string, number>` (numeric only)
- Supports arithmetic: `+`, `-`, `*`, `/` (integer division), `%` (modulo)
- Special keyword: `position` (references cookie.position)
- Pre-loop initialization: Lines before "For each cookie:" are executed once with a dummy cookie

**Expression Evaluation**:
- Recursive arithmetic parser with operator precedence
- Division uses `Math.floor()` for integer division
- Expressions can include variables, position, and literals

**Condition Evaluation**:
- Numeric comparisons: `=`, `<`, `>`, `<=`, `>=`
- Pattern: `(\w+(?:\s*\/\s*\d+|\s*%\s*\d+)?)\s*(=|<|>|<=|>=)\s*(\d+)`
- Legacy support: `position is even`, `position is odd`
- Shape matching: `shape = "star"`

**Critical Implementation Details**:

1. **Condition Stack Management**:
   - Each if/else-if/else pushes a frame with `{condition, indent, executed, type}`
   - Stack is popped when indentation decreases OR when at same level but not else/else-if
   - `executed` flag prevents else-if from running after if succeeded

2. **Pre-loop vs Loop Lines**:
   - Lines before first "For each" are initialization (executed once)
   - Lines after are loop body (executed per cookie)
   - Must slice correctly to avoid re-initializing variables per cookie

3. **Nested Loops**:
   - Outer loop: `For each color in ["red", "green"]:`
   - Inner loop: `For each cookie:`
   - `currentColor` variable tracks outer loop state
   - Use `Set icing = current color` to reference it

#### Common Pitfalls

- **DO NOT** use `.trim()` on lines - it breaks indentation detection
- **ALWAYS** strip prefixes ("if ", "else if ") before passing to `evaluateCondition()`
- **REMEMBER** pre-loop lines must be sliced out when processing loop
- **TEST** with both counter-based and position-based algorithms

### Testing the Game

Test files exist in root (for Node.js testing):
- `test-algorithm-executor.mjs` - Core parser tests (embedded JS copy)
- `test-variables.mjs` - Variable system tests (imports .ts, requires tsx)

Run tests:
```bash
node test-algorithm-executor.mjs  # Works (embedded JS)
npx tsx test-variables.mjs         # Also works (TypeScript)
```

## Working with Tutorial Pages

Tutorial pages are Astro files in `src/pages/`. Each page:
- Uses `Layout.astro` wrapper
- Contains educational content (HTML/Markdown)
- Can embed interactive components

**Adding a new tutorial**:
1. Create `src/pages/your-tutorial.astro`
2. Add a Card link on `src/pages/index.astro`
3. Use existing pages as templates

## Styling

- **Framework**: Tailwind CSS (via `@astrojs/tailwind`)
- **Config**: Standard Tailwind v3 configuration
- **Pattern**: Utility-first classes in components

## TypeScript

- TypeScript enabled for type safety
- Type checking runs before build (`astro check`)
- React 19 with TypeScript support
- Cookie game types: `src/components/cookie-game/lib/types.ts`

# Cookie Game — Key Facts

- Location: `src/components/cookie-game/`
- Entry: `CookieGameWrapper.tsx` → `ChallengeList.tsx` → `ChallengeView.tsx`
- Challenges data: `src/data/cookie-challenges.json`
- Types: `src/components/cookie-game/lib/types.ts`
- User progress: localStorage via `lib/storage.ts`
- Core interpreter: `AlgorithmExecutor.ts` — custom pseudocode parser (indentation-based scoping)

See `claude-historic/CLAUDE-2025-phase1.md` for deep implementation notes on AlgorithmExecutor.

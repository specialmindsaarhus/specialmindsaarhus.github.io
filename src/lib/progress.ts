// Progress storage for the step-by-step learning flow.
// Keyed by username so different students on the same machine stay separate.

export interface StepProgress {
  currentStep: number;       // 0 = intro, 1..N = card index, N+1 = done
  completedSteps: number[];  // which steps have been marked done
  totalCards: number;        // stored so frontpage badges don't need to re-fetch
  startedAt: string;         // ISO date
  completedAt?: string;      // ISO date when all steps done
}

export type ProgressStore = Record<string, StepProgress>;

function storageKey(username: string): string {
  return `sm_progress_${username}`;
}

function loadStore(username: string): ProgressStore {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(storageKey(username));
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function saveStore(username: string, store: ProgressStore): void {
  localStorage.setItem(storageKey(username), JSON.stringify(store));
}

export function getProgress(username: string, slug: string): StepProgress | null {
  const store = loadStore(username);
  return store[slug] ?? null;
}

export function saveStep(username: string, slug: string, step: number, totalSteps: number): void {
  const store = loadStore(username);
  const existing = store[slug];
  const completedSteps = existing?.completedSteps ?? [];

  if (!completedSteps.includes(step)) {
    completedSteps.push(step);
  }

  const isDone = step > totalSteps; // step N+1 means completion screen reached
  store[slug] = {
    currentStep: step,
    completedSteps,
    totalCards: totalSteps,
    startedAt: existing?.startedAt ?? new Date().toISOString(),
    ...(isDone ? { completedAt: new Date().toISOString() } : {}),
  };

  saveStore(username, store);
}

/** Returns badge info for a card on the frontpage. */
export function getCardProgress(
  username: string,
  slug: string,
): { done: boolean; stepsCompleted: number; total: number } | null {
  const p = getProgress(username, slug);
  if (!p) return null;
  const total = p.totalCards;
  return {
    done: !!p.completedAt,
    stepsCompleted: p.completedSteps.filter(s => s >= 1 && s <= total).length,
    total,
  };
}

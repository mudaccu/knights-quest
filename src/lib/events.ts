export interface CompletionEvent {
  questId: string;
  xp: number;
  leveledUp: boolean;
  level: number;
  rank: string;
  rankChanged: boolean;
  milestone: string | null;
}

type Listener = (e: CompletionEvent) => void;
const listeners = new Set<Listener>();

/** Tiny bus so the world, HUD and effects can react to a completed quest. */
export const celebrations = {
  emit(e: CompletionEvent) {
    listeners.forEach((l) => l(e));
  },
  on(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

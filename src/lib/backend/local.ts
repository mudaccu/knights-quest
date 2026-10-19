import type { Backend, DataSnapshot } from "./types";
import type { Note, Profile, Quest, Reflection } from "../types";

const STORAGE_KEY = "knightsquest.demo.v1";

const empty = (): DataSnapshot => ({ quests: [], notes: [], reflections: [], profile: null });

function read(): DataSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<DataSnapshot>;
    return {
      quests: Array.isArray(parsed.quests) ? parsed.quests : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      reflections: Array.isArray(parsed.reflections) ? parsed.reflections : [],
      profile: parsed.profile ?? null,
    };
  } catch {
    return empty();
  }
}

/**
 * Demo-mode store. Everything lives in this browser's localStorage only —
 * nothing is synced to other devices. Other tabs stay in step via the storage event.
 */
export class LocalBackend implements Backend {
  readonly kind = "local" as const;
  private state: DataSnapshot = read();
  private listeners = new Set<(p: Partial<DataSnapshot>) => void>();

  subscribe(onData: (p: Partial<DataSnapshot>) => void, onError: (e: Error) => void) {
    this.listeners.add(onData);
    onData({ ...this.state });
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      this.state = read();
      onData({ ...this.state });
    };
    window.addEventListener("storage", onStorage);
    void onError;
    return () => {
      this.listeners.delete(onData);
      window.removeEventListener("storage", onStorage);
    };
  }

  private commit(next: Partial<DataSnapshot>) {
    this.state = { ...this.state, ...next };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      return Promise.reject(new Error("This browser refused to store more data. Free some space and try again."));
    }
    this.listeners.forEach((l) => l(next));
    return Promise.resolve();
  }

  private upsert<T>(list: T[], item: T, key: (t: T) => string): T[] {
    const id = key(item);
    const i = list.findIndex((x) => key(x) === id);
    if (i === -1) return [...list, item];
    const copy = list.slice();
    copy[i] = item;
    return copy;
  }

  saveQuest(q: Quest) {
    return this.commit({ quests: this.upsert(this.state.quests, q, (x) => x.id) });
  }
  deleteQuest(id: string) {
    return this.commit({ quests: this.state.quests.filter((q) => q.id !== id) });
  }
  saveNote(n: Note) {
    return this.commit({ notes: this.upsert(this.state.notes, n, (x) => x.id) });
  }
  deleteNote(id: string) {
    return this.commit({ notes: this.state.notes.filter((n) => n.id !== id) });
  }
  saveReflection(r: Reflection) {
    return this.commit({ reflections: this.upsert(this.state.reflections, r, (x) => x.date) });
  }
  saveProfile(patch: Partial<Profile>) {
    const base: Profile = this.state.profile ?? {
      displayName: "",
      onboarded: false,
      totalXp: 0,
      days: {},
      createdAt: new Date().toISOString(),
    };
    return this.commit({ profile: { ...base, ...patch } });
  }
  adjustXp(day: string, xp: number, completed: number) {
    const p = this.state.profile;
    if (!p) return Promise.resolve();
    const prev = p.days[day] ?? { completed: 0, xp: 0 };
    return this.commit({
      profile: {
        ...p,
        totalXp: Math.max(0, p.totalXp + xp),
        days: { ...p.days, [day]: { completed: Math.max(0, prev.completed + completed), xp: Math.max(0, prev.xp + xp) } },
      },
    });
  }
}

export function clearLocalData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

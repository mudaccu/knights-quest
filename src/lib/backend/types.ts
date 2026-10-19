import type { Note, Profile, Quest, Reflection } from "../types";

export interface DataSnapshot {
  quests: Quest[];
  notes: Note[];
  reflections: Reflection[];
  profile: Profile | null;
}

export type SnapshotKey = keyof DataSnapshot;

/**
 * Storage contract shared by the local demo store and Firestore.
 * The UI only talks to this interface, so swapping backends never touches components.
 */
export interface Backend {
  readonly kind: "local" | "cloud";
  /** Streams partial snapshots; each key is delivered at least once. */
  subscribe(onData: (partial: Partial<DataSnapshot>) => void, onError: (err: Error) => void): () => void;
  saveQuest(quest: Quest): Promise<void>;
  deleteQuest(id: string): Promise<void>;
  saveNote(note: Note): Promise<void>;
  deleteNote(id: string): Promise<void>;
  saveReflection(reflection: Reflection): Promise<void>;
  saveProfile(patch: Partial<Profile>): Promise<void>;
  /** Atomically adjusts total XP and the per-day ledger. */
  adjustXp(day: string, xp: number, completed: number): Promise<void>;
}

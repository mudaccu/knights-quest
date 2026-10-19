"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Backend, DataSnapshot, SnapshotKey } from "@/lib/backend/types";
import type { Note, NoteInput, Profile, Quest, QuestInput, Reflection } from "@/lib/types";
import { dateKey, nextOccurrence } from "@/lib/dates";
import { XP_BY_PRIORITY, journeyPosition, levelInfo } from "@/lib/progress";
import { celebrations } from "@/lib/events";
import { uid } from "@/lib/storage";
import { useToast } from "./ToastProvider";

interface Ctx extends DataSnapshot {
  ready: boolean;
  kind: Backend["kind"];
  totalXp: number;
  createQuest: (input: QuestInput) => Promise<void>;
  updateQuest: (id: string, patch: Partial<Quest>) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  reopenQuest: (id: string) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  createNote: (input: NoteInput) => Promise<void>;
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  saveReflection: (r: Omit<Reflection, "updatedAt">) => Promise<void>;
  saveProfile: (patch: Partial<Profile>) => Promise<void>;
}

const DataContext = createContext<Ctx | null>(null);
const KEYS: SnapshotKey[] = ["quests", "notes", "reflections", "profile"];

export function DataProvider({ backend, children }: { backend: Backend; children: React.ReactNode }) {
  const toast = useToast();
  const [snap, setSnap] = useState<DataSnapshot>({ quests: [], notes: [], reflections: [], profile: null });
  const [loaded, setLoaded] = useState<Set<SnapshotKey>>(new Set());
  const snapRef = useRef(snap);
  snapRef.current = snap;

  useEffect(() => {
    setLoaded(new Set());
    return backend.subscribe(
      (partial) => {
        setSnap((s) => ({ ...s, ...partial }));
        setLoaded((l) => {
          const n = new Set(l);
          (Object.keys(partial) as SnapshotKey[]).forEach((k) => n.add(k));
          return n;
        });
      },
      (err) => toast({ tone: "error", title: "The ravens lost their way", body: err.message }),
    );
  }, [backend, toast]);

  const ready = KEYS.every((k) => loaded.has(k));

  const guard = useCallback(
    async (fn: () => Promise<void>) => {
      try {
        await fn();
      } catch (e) {
        toast({ tone: "error", title: "That could not be saved", body: (e as Error).message });
        throw e;
      }
    },
    [toast],
  );

  const findQuest = (id: string) => snapRef.current.quests.find((q) => q.id === id);

  const createQuest = useCallback<Ctx["createQuest"]>(
    (input) =>
      guard(() => {
        const now = new Date().toISOString();
        return backend.saveQuest({
          ...input,
          id: uid(),
          reminderFired: false,
          completed: false,
          completedAt: null,
          xpAwarded: 0,
          createdAt: now,
          updatedAt: now,
        });
      }),
    [backend, guard],
  );

  const updateQuest = useCallback<Ctx["updateQuest"]>(
    (id, patch) =>
      guard(async () => {
        const q = findQuest(id);
        if (!q) return;
        await backend.saveQuest({ ...q, ...patch, updatedAt: new Date().toISOString() });
      }),
    [backend, guard],
  );

  const completeQuest = useCallback<Ctx["completeQuest"]>(
    (id) =>
      guard(async () => {
        const q = findQuest(id);
        if (!q || q.completed) return;
        const xp = XP_BY_PRIORITY[q.priority];
        const now = new Date();
        const before = snapRef.current.profile?.totalXp ?? 0;
        await backend.saveQuest({ ...q, completed: true, completedAt: now.toISOString(), xpAwarded: xp, updatedAt: now.toISOString() });
        await backend.adjustXp(dateKey(now), xp, 1);

        // Recurring quests spawn their next occurrence so the record of this one is kept.
        if (q.repeat !== "none") {
          const due = nextOccurrence(q.dueDate, q.repeat);
          let reminderAt: string | null = null;
          if (q.reminderAt) {
            const shift = new Date(q.reminderAt);
            const [y, m, d] = due.split("-").map(Number);
            const [py, pm, pd] = q.dueDate.split("-").map(Number);
            const deltaDays = Math.round((new Date(y, m - 1, d).getTime() - new Date(py, pm - 1, pd).getTime()) / 86400000);
            shift.setDate(shift.getDate() + deltaDays);
            reminderAt = shift.toISOString();
          }
          await backend.saveQuest({
            ...q,
            id: uid(),
            dueDate: due,
            reminderAt,
            reminderFired: false,
            completed: false,
            completedAt: null,
            xpAwarded: 0,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
        }

        const a = levelInfo(before);
        const b = levelInfo(before + xp);
        const ja = journeyPosition(before);
        const jb = journeyPosition(before + xp);
        celebrations.emit({
          questId: q.id,
          xp,
          leveledUp: b.level > a.level,
          level: b.level,
          rank: b.rank,
          rankChanged: b.rank !== a.rank,
          milestone: jb.index > ja.index ? jb.current.name : null,
        });
      }),
    [backend, guard],
  );

  const reopenQuest = useCallback<Ctx["reopenQuest"]>(
    (id) =>
      guard(async () => {
        const q = findQuest(id);
        if (!q || !q.completed) return;
        const day = q.completedAt ? dateKey(new Date(q.completedAt)) : dateKey();
        await backend.saveQuest({ ...q, completed: false, completedAt: null, xpAwarded: 0, updatedAt: new Date().toISOString() });
        if (q.xpAwarded) await backend.adjustXp(day, -q.xpAwarded, -1);
      }),
    [backend, guard],
  );

  const deleteQuest = useCallback<Ctx["deleteQuest"]>((id) => guard(() => backend.deleteQuest(id)), [backend, guard]);

  const createNote = useCallback<Ctx["createNote"]>(
    (input) =>
      guard(() => {
        const now = new Date().toISOString();
        return backend.saveNote({ ...input, id: uid(), reminderFired: false, createdAt: now, updatedAt: now });
      }),
    [backend, guard],
  );

  const updateNote = useCallback<Ctx["updateNote"]>(
    (id, patch) =>
      guard(async () => {
        const n = snapRef.current.notes.find((x) => x.id === id);
        if (!n) return;
        await backend.saveNote({ ...n, ...patch, updatedAt: new Date().toISOString() });
      }),
    [backend, guard],
  );

  const deleteNote = useCallback<Ctx["deleteNote"]>((id) => guard(() => backend.deleteNote(id)), [backend, guard]);

  const saveReflection = useCallback<Ctx["saveReflection"]>(
    (r) => guard(() => backend.saveReflection({ ...r, updatedAt: new Date().toISOString() })),
    [backend, guard],
  );

  const saveProfile = useCallback<Ctx["saveProfile"]>((patch) => guard(() => backend.saveProfile(patch)), [backend, guard]);

  const value = useMemo<Ctx>(
    () => ({
      ...snap,
      ready,
      kind: backend.kind,
      totalXp: snap.profile?.totalXp ?? 0,
      createQuest,
      updateQuest,
      completeQuest,
      reopenQuest,
      deleteQuest,
      createNote,
      updateNote,
      deleteNote,
      saveReflection,
      saveProfile,
    }),
    [snap, ready, backend.kind, createQuest, updateQuest, completeQuest, reopenQuest, deleteQuest, createNote, updateNote, deleteNote, saveReflection, saveProfile],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

export function useOptionalData() {
  return useContext(DataContext);
}

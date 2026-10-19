"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Icon } from "../ui/Icon";
import { Modal } from "../ui/Modal";
import { NoteCard } from "./NoteCard";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { useToast } from "../providers/ToastProvider";
import type { Note } from "@/lib/types";

const sortNotes = (a: Note, b: Note) => Number(b.pinned) - Number(a.pinned) || Number(b.important) - Number(a.important) || b.updatedAt.localeCompare(a.updatedAt);

const upcomingReminder = (n: Note) => !!n.reminderAt && !n.reminderFired && new Date(n.reminderAt).getTime() > Date.now();

/** Compact view used beside the world (desktop) and in the mobile sheet. */
export function ChronicleSummary() {
  const { notes, createNote } = useData();
  const { openChronicle, openNoteForm } = useUI();
  const toast = useToast();
  const [draft, setDraft] = useState("");

  const featured = useMemo(() => notes.filter((n) => n.pinned || n.important).sort(sortNotes).slice(0, 3), [notes]);
  const reminders = useMemo(
    () =>
      notes
        .filter((n) => upcomingReminder(n) && !featured.includes(n))
        .sort((a, b) => a.reminderAt!.localeCompare(b.reminderAt!))
        .slice(0, 2),
    [notes, featured],
  );
  const recent = useMemo(
    () =>
      notes
        .filter((n) => !featured.includes(n) && !reminders.includes(n))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, Math.max(0, 3 - featured.length - reminders.length)),
    [notes, featured, reminders],
  );

  const quickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    try {
      await createNote({ title: title.slice(0, 140), content: "", tag: "", pinned: false, important: false, reminderAt: null });
      setDraft("");
      toast({ tone: "success", title: "Recorded in the Chronicle", body: title });
    } catch {
      /* toast shown */
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-4 pt-4">
        <Icon name="quill" size={18} className="text-[#7a5a2a]" />
        <h2 className="flex-1 font-display text-[1.02rem] font-semibold text-ink">The Chronicle</h2>
        <button className="icon-btn icon-btn--sm text-ink-soft" onClick={openChronicle} aria-label="Search the Chronicle">
          <Icon name="search" size={16} />
        </button>
        <button className="icon-btn icon-btn--sm text-ink-soft" onClick={() => openNoteForm()} aria-label="New entry (N)" title="New entry (N)">
          <Icon name="plus" size={17} />
        </button>
      </div>

      <form onSubmit={quickAdd} className="px-4 pt-2.5">
        <label htmlFor="quick-note" className="sr-only">
          Quick note
        </label>
        <input id="quick-note" className="field !min-h-9 !text-[0.98rem]" value={draft} maxLength={140} placeholder="Something to remember… (Enter)" onChange={(e) => setDraft(e.target.value)} />
      </form>

      <div className="scroll-area min-h-0 flex-1 px-4 pb-2 pt-3">
        {notes.length === 0 ? (
          <p className="py-2 text-[0.95rem] leading-snug text-ink-soft">
            Exams, promises, ideas — record what you must not forget. Notes are for remembering; quests are for doing.
          </p>
        ) : (
          <div className="grid gap-2">
            <AnimatePresence initial={false}>
              {featured.map((n) => (
                <NoteCard key={n.id} note={n} dense />
              ))}
            </AnimatePresence>
            {reminders.length > 0 && (
              <>
                <p className="mt-1 font-display text-[0.8rem] font-semibold tracking-[0.02em] text-ink-faint">Upcoming reminders</p>
                {reminders.map((n) => (
                  <NoteCard key={n.id} note={n} dense />
                ))}
              </>
            )}
            {recent.length > 0 && (
              <>
                {(featured.length > 0 || reminders.length > 0) && <p className="mt-1 font-display text-[0.8rem] font-semibold tracking-[0.02em] text-ink-faint">Recent</p>}
                <AnimatePresence initial={false}>
                  {recent.map((n) => (
                    <NoteCard key={n.id} note={n} dense />
                  ))}
                </AnimatePresence>
              </>
            )}
          </div>
        )}
      </div>

      <button onClick={openChronicle} className="flex items-center justify-between border-t border-[rgba(110,82,40,.18)] px-4 py-2.5 text-left font-display text-[0.9rem] font-semibold tracking-[0.02em] text-ink-soft transition-colors hover:bg-[rgba(110,82,40,.07)] hover:text-ink">
        Open the Chronicle
        <span className="flex items-center gap-1 tracking-normal">
          <span className="font-serif text-[0.92rem]">
            {notes.length} {notes.length === 1 ? "entry" : "entries"}
          </span>
          <Icon name="chevron" size={14} />
        </span>
      </button>
    </div>
  );
}

type Filter = "all" | "pinned" | "important" | "reminders" | `tag:${string}`;

export function ChronicleModal() {
  const { notes } = useData();
  const { chronicleOpen, close, openNoteForm } = useUI();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const tags = useMemo(() => Array.from(new Set(notes.map((n) => n.tag).filter(Boolean))).sort(), [notes]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => {
        if (filter === "pinned" && !n.pinned) return false;
        if (filter === "important" && !n.important) return false;
        if (filter === "reminders" && !upcomingReminder(n)) return false;
        if (filter.startsWith("tag:") && n.tag !== filter.slice(4)) return false;
        return !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tag.toLowerCase().includes(q);
      })
      .sort(sortNotes);
  }, [notes, query, filter]);

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pinned", label: "Pinned" },
    { id: "important", label: "Important" },
    { id: "reminders", label: "Reminders" },
    ...tags.map((t) => ({ id: `tag:${t}` as Filter, label: `#${t}` })),
  ];

  return (
    <Modal open={chronicleOpen} onClose={() => close("chronicleOpen")} kicker="Things worth remembering" title="The Chronicle" size="lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input data-autofocus className="field !pl-9" type="search" placeholder="Search titles and contents" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search notes" />
        </div>
        <button className="btn btn-ink" onClick={() => openNoteForm()}>
          <Icon name="plus" size={16} /> New entry
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter notes">
        {chips.map((c) => (
          <button key={c.id} aria-pressed={filter === c.id} onClick={() => setFilter(c.id)} className={`chip !px-3 !py-1 transition-colors ${filter === c.id ? "!bg-[#2d241a] !text-parchment" : "hover:bg-[rgba(110,82,40,.16)]"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {shown.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {shown.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <Icon name="quill" size={34} className="text-[#a38a5c]" strokeWidth={1.2} />
          <p className="mt-3 font-display text-[0.95rem] font-semibold text-ink">{notes.length ? "No entries match" : "The Chronicle is empty"}</p>
          <p className="mt-1 max-w-xs text-[0.98rem] text-ink-soft">{notes.length ? "Try a different word or filter." : "Record an exam date, a promise, an idea — anything you don't want to forget."}</p>
        </div>
      )}
    </Modal>
  );
}

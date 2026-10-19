"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Icon } from "../ui/Icon";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { formatStamp } from "@/lib/dates";
import { DateTimeField } from "../ui/DateTime";
import { requestNotificationPermission } from "@/hooks/useReminders";
import type { NoteInput } from "@/lib/types";

const blank = (draft = ""): NoteInput => ({ title: draft, content: "", tag: "", pinned: false, important: false, reminderAt: null });

export function NoteForm() {
  const { noteForm, close } = useUI();
  const { notes, createNote, updateNote } = useData();
  const editing = noteForm?.note;
  const [v, setV] = useState<NoteInput>(blank);
  const [reminderOn, setReminderOn] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!noteForm) return;
    const n = noteForm.note;
    setV(n ? { title: n.title, content: n.content, tag: n.tag, pinned: n.pinned, important: n.important, reminderAt: n.reminderAt } : blank(noteForm.draft));
    setReminderOn(!!n?.reminderAt);
    setError("");
  }, [noteForm]);

  const tags = useMemo(() => Array.from(new Set(notes.map((n) => n.tag).filter(Boolean))).sort(), [notes]);
  const set = <K extends keyof NoteInput>(k: K, value: NoteInput[K]) => setV((x) => ({ ...x, [k]: value }));
  const onClose = () => close("noteForm");

  const defaultReminder = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!v.title.trim()) {
      setError("Give this entry a title.");
      return;
    }
    const payload: NoteInput = {
      ...v,
      title: v.title.trim().slice(0, 140),
      content: v.content.slice(0, 5000),
      tag: v.tag.trim().slice(0, 30),
      reminderAt: reminderOn ? v.reminderAt ?? defaultReminder() : null,
    };
    setSaving(true);
    try {
      if (editing) await updateNote(editing.id, { ...payload, ...(payload.reminderAt !== editing.reminderAt ? { reminderFired: false } : {}) });
      else await createNote(payload);
      onClose();
    } catch {
      /* toast shown */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!noteForm}
      onClose={onClose}
      kicker="The Chronicle"
      title={editing ? "Edit entry" : "Record an entry"}
      footer={
        <>
          {editing && (
            <span className="mr-auto text-[0.88rem] text-ink-faint">
              Written {formatStamp(editing.createdAt)}
              {editing.updatedAt !== editing.createdAt && ` · edited ${formatStamp(editing.updatedAt)}`}
            </span>
          )}
          <button type="button" className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="note-form" className="btn btn-ink" disabled={saving}>
            <Icon name="quill" size={16} />
            {editing ? "Save entry" : "Record entry"}
          </button>
        </>
      }
    >
      <form id="note-form" onSubmit={submit} className="grid gap-5" noValidate>
        <div>
          <label className="label" htmlFor="n-title">
            Title
          </label>
          <input
            id="n-title"
            data-autofocus
            className="field text-[1.1rem]"
            value={v.title}
            maxLength={140}
            placeholder="Physics exam — Thursday, Hall B"
            aria-invalid={!!error}
            onChange={(e) => {
              set("title", e.target.value);
              setError("");
            }}
          />
          {error && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[0.95rem] text-crimson">
              <Icon name="alert" size={15} /> {error}
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="n-content">
            What should you remember?
          </label>
          <textarea id="n-content" className="field" rows={5} maxLength={5000} value={v.content} placeholder="Bring the calculator. Revise chapters 7–9." onChange={(e) => set("content", e.target.value)} />
        </div>
        <div className="grid gap-5">
          <div>
            <label className="label" htmlFor="n-tag">
              Tag <span className="normal-case tracking-normal opacity-85">(optional)</span>
            </label>
            <input id="n-tag" className="field" list="note-tags" maxLength={30} value={v.tag} placeholder="Exam, Idea, Promise…" onChange={(e) => set("tag", e.target.value)} />
            <datalist id="note-tags">
              {tags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <div>
            <div className="label flex items-center justify-between">
              <span id="n-rem-label">Reminder</span>
              <button
                type="button"
                role="switch"
                aria-checked={reminderOn}
                aria-labelledby="n-rem-label"
                className="switch"
                onClick={() => {
                  const on = !reminderOn;
                  setReminderOn(on);
                  if (on) {
                    if (!v.reminderAt) set("reminderAt", defaultReminder());
                    void requestNotificationPermission();
                  }
                }}
              />
            </div>
            {reminderOn ? (
              <DateTimeField value={v.reminderAt ?? defaultReminder()} onChange={(iso) => set("reminderAt", iso)} />
            ) : (
              <p className="text-[0.98rem] text-ink-soft">No reminder set.</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`chip !px-3 !py-1.5 !text-[0.95rem] ${v.pinned ? "!bg-[#2d241a] !text-parchment" : ""}`} aria-pressed={v.pinned} onClick={() => set("pinned", !v.pinned)}>
            <Icon name="pin" size={15} /> {v.pinned ? "Pinned" : "Pin to top"}
          </button>
          <button
            type="button"
            className={`chip !px-3 !py-1.5 !text-[0.95rem] ${v.important ? "!bg-crimson !text-[#fbeee6]" : ""}`}
            aria-pressed={v.important}
            onClick={() => set("important", !v.important)}
          >
            <Icon name="star" size={15} /> {v.important ? "Marked important" : "Mark important"}
          </button>
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

"use client";

import { motion } from "framer-motion";
import { Icon } from "../ui/Icon";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { formatStamp } from "@/lib/dates";
import type { Note } from "@/lib/types";

export function NoteCard({ note, dense = false }: { note: Note; dense?: boolean }) {
  const { updateNote, deleteNote } = useData();
  const { openNoteForm, askConfirm } = useUI();
  const upcoming = note.reminderAt && !note.reminderFired && new Date(note.reminderAt).getTime() > Date.now();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      className={`group relative rounded-xl border border-[rgba(110,82,40,.18)] bg-[rgba(255,252,240,.38)] transition-colors hover:border-[rgba(110,82,40,.34)] hover:bg-[rgba(255,252,240,.6)] ${dense ? "p-3" : "p-4"}`}
    >
      {note.important && <span className="absolute left-0 top-3 h-6 w-[3px] rounded-r bg-crimson" aria-hidden />}
      <button className="block w-full text-left" onClick={() => openNoteForm(note)} aria-label={`Edit "${note.title}"`}>
        <div className="flex items-start gap-2 pr-14">
          <h3 className={`min-w-0 flex-1 font-semibold leading-snug text-ink ${dense ? "text-[1rem]" : "text-[1.08rem]"}`}>{note.title}</h3>
        </div>
        {note.content && <p className={`mt-1 whitespace-pre-wrap text-ink-soft ${dense ? "line-clamp-2 text-[0.92rem]" : "line-clamp-5 text-[0.98rem]"} leading-snug`}>{note.content}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.82rem] text-ink-faint">
          {note.tag && <span className="chip !text-[0.78rem]">{note.tag}</span>}
          {note.important && (
            <span className="inline-flex items-center gap-1 text-crimson">
              <Icon name="star" size={12} /> Important
            </span>
          )}
          {note.reminderAt && (
            <span className={`inline-flex items-center gap-1 ${upcoming ? "text-[#7a5a2a]" : ""}`}>
              <Icon name="bell" size={12} /> {formatStamp(note.reminderAt)}
            </span>
          )}
          {!dense && <span className="ml-auto">{formatStamp(note.updatedAt)}</span>}
        </div>
      </button>
      <div className="absolute right-2 top-2 flex opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          className={`icon-btn icon-btn--sm ${note.pinned ? "!opacity-100 text-[#7a5a2a]" : "text-ink-faint"}`}
          aria-label={note.pinned ? "Unpin" : "Pin"}
          aria-pressed={note.pinned}
          onClick={() => updateNote(note.id, { pinned: !note.pinned })}
        >
          <Icon name="pin" size={15} />
        </button>
        <button
          className="icon-btn icon-btn--sm text-ink-faint hover:!text-crimson"
          aria-label="Delete entry"
          onClick={() =>
            askConfirm({
              title: "Strike this entry?",
              body: `"${note.title}" will be removed from the Chronicle. This cannot be undone.`,
              confirmLabel: "Delete entry",
              onConfirm: () => deleteNote(note.id),
            })
          }
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
      {note.pinned && (
        <span className="pointer-events-none absolute right-2.5 top-2.5 text-[#7a5a2a] transition-opacity sm:group-hover:opacity-0 sm:group-focus-within:opacity-0 max-sm:hidden" aria-hidden>
          <Icon name="pin" size={14} />
        </span>
      )}
    </motion.article>
  );
}

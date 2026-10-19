"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
import { Icon } from "../ui/Icon";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { usePrefs } from "../providers/PrefsProvider";
import { dateKey, formatDay, formatTime } from "@/lib/dates";
import { CATEGORY_LABEL, REPEAT_LABEL } from "@/lib/lore";
import { CATEGORY_ICON, categoryLabel } from "@/lib/quests";
import { XP_BY_PRIORITY } from "@/lib/progress";
import type { Quest } from "@/lib/types";

export function WaxSeal({ size = 44 }: { size?: number }) {
  return (
    <svg width={`${size / 16}rem`} height={`${size / 16}rem`} viewBox="0 0 48 48" aria-hidden>
      <path
        d="M24 3c3 0 4 2.5 6.6 3.3 2.7.8 5-.7 7 1.2 2 2-.2 4.3.7 7 .9 2.7 3.7 3.8 3.7 7 0 3.4-2.7 4.4-3.6 7.1-.9 2.7 1.1 5-.8 7-2 2-4.4.3-7 1.2-2.7.9-3.6 3.6-6.6 3.6s-4-2.7-6.6-3.6c-2.7-.9-5 .8-7-1.2s-.1-4.3-.8-7C4.7 30 2 28.9 2 25.5c0-3.2 2.8-4.3 3.7-7 .9-2.7-1.3-5 .7-7s4.3-.4 7-1.2C16 9.5 21 3 24 3z"
        fill="#8c2c28"
      />
      <circle cx="24" cy="24.5" r="13" fill="#a3362f" stroke="#6c1f1b" strokeWidth="1.2" />
      <path d="M24 15.5l7 2.7v5.2c0 4.4-2.9 7.8-7 9.2-4.1-1.4-7-4.8-7-9.2v-5.2z" fill="none" stroke="#f1c9a8" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 19v10M20.2 22.6h7.6" stroke="#f1c9a8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function QuestItemImpl({ quest }: { quest: Quest }) {
  const { completeQuest, reopenQuest, deleteQuest } = useData();
  const { openQuestForm, askConfirm } = useUI();
  const { motionReduced } = usePrefs();
  const [open, setOpen] = useState(false);
  const [sealing, setSealing] = useState(false);
  const xp = quest.completed ? quest.xpAwarded : XP_BY_PRIORITY[quest.priority];
  const overdue = !quest.completed && quest.dueDate < dateKey();
  const done = quest.completed || sealing;

  const toggle = () => {
    if (sealing) return;
    if (quest.completed) {
      void reopenQuest(quest.id);
      return;
    }
    setSealing(true);
    window.setTimeout(
      () => {
        void completeQuest(quest.id).finally(() => setSealing(false));
      },
      motionReduced ? 0 : 750,
    );
  };

  const remove = () =>
    askConfirm({
      title: "Abandon this quest?",
      body: `"${quest.title}" will be removed from your journal. This cannot be undone.${quest.completed ? " XP you already earned is kept." : ""}`,
      confirmLabel: "Delete quest",
      onConfirm: () => deleteQuest(quest.id),
    });

  return (
    <motion.li
      layout={!motionReduced}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className={`group relative rounded-xl px-3 py-3 transition-colors hover:bg-[rgba(110,82,40,.07)] focus-within:bg-[rgba(110,82,40,.07)] ${done ? "opacity-[.72]" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          className="seal-btn mt-[0.35rem]"
          role="checkbox"
          aria-checked={done}
          aria-label={quest.completed ? `Reopen "${quest.title}"` : `Mark "${quest.title}" complete`}
          onClick={toggle}
        >
          <Icon name="check" size={14} strokeWidth={2.4} />
        </button>

        <button className="min-w-0 flex-1 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <p className="truncate font-display text-[0.9rem] font-medium tracking-[0.02em] text-[#8a6a32]">{quest.epithet}</p>
          <p className={`text-[1.08rem] leading-snug text-ink ${done ? "line-through decoration-[rgba(140,44,40,.55)] decoration-[1.5px]" : ""}`}>{quest.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.86rem] text-ink-soft">
            <span className="inline-flex items-center gap-1">
              <Icon name={CATEGORY_ICON[quest.category]} size={13} />
              {categoryLabel(quest, CATEGORY_LABEL)}
            </span>
            <span className={`inline-flex items-center gap-1 ${overdue ? "text-crimson" : ""}`}>
              <Icon name="calendar" size={13} />
              {formatDay(quest.dueDate)}
              {quest.dueTime && ` · ${formatTime(quest.dueTime)}`}
            </span>
            {quest.repeat !== "none" && (
              <span className="inline-flex items-center gap-1" title={REPEAT_LABEL[quest.repeat]}>
                <Icon name="repeat" size={13} />
                <span className="sr-only">{REPEAT_LABEL[quest.repeat]}</span>
              </span>
            )}
            {quest.reminderAt && !quest.completed && (
              <span className="inline-flex items-center gap-1" title="Reminder set">
                <Icon name="bell" size={13} />
                <span className="sr-only">Reminder set</span>
              </span>
            )}
            {quest.priority === "high" && <span className="font-display text-[0.8rem] font-semibold tracking-[0.02em] text-crimson">High</span>}
            {quest.priority === "low" && <span className="font-display text-[0.8rem] tracking-[0.02em] opacity-85">Low</span>}
          </div>
        </button>

        <span className={`mt-1 shrink-0 font-display text-[0.9rem] font-semibold tracking-[0.02em] ${quest.completed ? "text-moss" : "text-ink-faint"}`}>
          {quest.completed ? `+${xp}` : xp} XP
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pl-10 pt-2">
              {quest.description && <p className="whitespace-pre-wrap text-[0.98rem] leading-relaxed text-ink-soft">{quest.description}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button className="btn btn-quiet !min-h-8 !px-3 !text-[0.9rem]" onClick={() => openQuestForm(quest)}>
                  <Icon name="edit" size={14} /> Edit
                </button>
                {quest.completed && (
                  <button className="btn btn-quiet !min-h-8 !px-3 !text-[0.9rem]" onClick={() => reopenQuest(quest.id)}>
                    <Icon name="undo" size={14} /> Reopen
                  </button>
                )}
                <button className="btn btn-quiet !min-h-8 !px-3 !text-[0.9rem] hover:!text-crimson" onClick={remove}>
                  <Icon name="trash" size={14} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sealing && !motionReduced && (
          <>
            <motion.div
              className="pointer-events-none absolute right-10 top-1/2 -mt-6"
              initial={{ scale: 2.4, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: -12, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
            >
              <WaxSeal size={48} />
            </motion.div>
            <motion.span
              className="pointer-events-none absolute right-3 top-2 font-display text-[0.9rem] font-bold text-[#8a6a32]"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -26, opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            >
              +{xp} XP
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export const QuestItem = memo(QuestItemImpl);

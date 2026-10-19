"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Icon } from "../ui/Icon";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { QuestItem } from "./QuestItem";
import { dateKey, formatLongDay, journeyDay, toRoman } from "@/lib/dates";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "@/lib/lore";
import { inView, sortForView, todaySummary, type QuestView } from "@/lib/quests";
import type { Category, Priority } from "@/lib/types";

const VIEWS: { id: QuestView; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Fulfilled" },
];

const EMPTY: Record<QuestView, { title: string; body: string }> = {
  today: { title: "The road is quiet today", body: "Inscribe a quest — something you mean to do before the fire is lit." },
  upcoming: { title: "Nothing waits on the horizon", body: "Quests due on later days will gather here." },
  overdue: { title: "Nothing left behind", body: "Unfinished quests from past days rest here, without penalty, until you return to them." },
  completed: { title: "No quests fulfilled yet", body: "Seal your first quest and it will be recorded here." },
};

export function QuestJournal({ compactHeader = false, onCollapse }: { compactHeader?: boolean; onCollapse?: () => void }) {
  const { quests, profile } = useData();
  const { openQuestForm } = useUI();
  const [view, setView] = useState<QuestView>("today");
  const [category, setCategory] = useState<Category | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const today = dateKey();

  const counts = useMemo(() => {
    const c = { today: 0, upcoming: 0, overdue: 0, completed: 0 } as Record<QuestView, number>;
    for (const q of quests) for (const v of VIEWS) if (inView(q, v.id, today) && !(v.id === "today" && q.completed)) c[v.id]++;
    return c;
  }, [quests, today]);

  const list = useMemo(() => {
    const filtered = quests.filter(
      (q) => inView(q, view, today) && (category === "all" || q.category === category) && (priority === "all" || q.priority === priority),
    );
    return sortForView(filtered, view);
  }, [quests, view, category, priority, today]);

  const summary = todaySummary(quests, today);
  const filtering = category !== "all" || priority !== "all";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`px-5 ${compactHeader ? "pt-2" : "pt-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.55rem] font-bold leading-none text-ink">Quest Journal</h2>
            <p className="mt-1.5 text-[0.98rem] text-ink-soft">
              Chapter {toRoman(journeyDay(profile?.createdAt, today))} <span className="px-1 text-[#8c6a2c]">·</span> {formatLongDay(today)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button className="btn btn-ink !min-h-9 !px-3" onClick={() => openQuestForm()} title="New quest (Q)">
              <Icon name="plus" size={16} /> Quest
            </button>
            {onCollapse && (
              <button className="icon-btn icon-btn--sm -mr-2 text-ink-faint" onClick={onCollapse} aria-label="Collapse quest journal" title="Collapse">
                <Icon name="chevron" size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(110,82,40,.16)]" role="progressbar" aria-label="Today's quests fulfilled" aria-valuemin={0} aria-valuemax={summary.total} aria-valuenow={summary.done}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#8c6a2c] to-[#c9a24a] transition-[width] duration-700" style={{ width: `${summary.total ? (summary.done / summary.total) * 100 : 0}%` }} />
          </div>
          <p className="shrink-0 text-[0.92rem] text-ink-soft">
            {summary.total ? (
              <>
                <span className="font-semibold text-ink">{summary.done}</span> of {summary.total} fulfilled today
              </>
            ) : (
              "No quests due today"
            )}
          </p>
        </div>

        <div className="no-scrollbar mt-4 flex gap-0.5 overflow-x-auto" role="tablist" aria-label="Quest views">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={`relative shrink-0 rounded-lg px-2 py-1.5 font-display text-[0.9rem] font-semibold tracking-[0.02em] transition-colors ${
                view === v.id ? "bg-[#2d241a] text-parchment" : "text-ink-soft hover:bg-[rgba(110,82,40,.1)] hover:text-ink"
              }`}
            >
              {v.label}
              {counts[v.id] > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-px text-[0.8rem] ${view === v.id ? "bg-[rgba(255,255,255,.14)]" : v.id === "overdue" ? "bg-[rgba(140,44,40,.14)] text-crimson" : "bg-[rgba(110,82,40,.12)]"}`}>
                  {counts[v.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Icon name="filter" size={15} className="text-ink-faint" />
          <select className="field !min-h-8 !py-0.5 !text-[0.9rem]" value={category} onChange={(e) => setCategory(e.target.value as Category | "all")} aria-label="Filter by category">
            <option value="all">All categories</option>
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <select className="field !min-h-8 !py-0.5 !text-[0.9rem]" value={priority} onChange={(e) => setPriority(e.target.value as Priority | "all")} aria-label="Filter by priority">
            <option value="all">Any priority</option>
            {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="parchment-divider mx-5 mt-3" />

      <div className="scroll-area min-h-0 flex-1 px-2 py-2" role="tabpanel">
        {list.length ? (
          <ul className="grid gap-0.5">
            <AnimatePresence initial={false}>
              {list.map((q) => (
                <QuestItem key={q.id} quest={q} />
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <Icon name={filtering ? "filter" : view === "completed" ? "shield" : "scroll"} size={34} className="text-[#a38a5c]" strokeWidth={1.2} />
            <p className="mt-3 font-display text-[0.95rem] font-semibold text-ink">{filtering ? "No quests match these filters" : EMPTY[view].title}</p>
            <p className="mt-1 max-w-[17rem] text-[0.98rem] leading-snug text-ink-soft">{filtering ? "Try another category or priority." : EMPTY[view].body}</p>
            {filtering ? (
              <button
                className="btn btn-quiet mt-4"
                onClick={() => {
                  setCategory("all");
                  setPriority("all");
                }}
              >
                Clear filters
              </button>
            ) : (
              (view === "today" || view === "upcoming") && (
                <button className="btn btn-ink mt-4" onClick={() => openQuestForm()}>
                  <Icon name="plus" size={16} /> Inscribe a quest
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

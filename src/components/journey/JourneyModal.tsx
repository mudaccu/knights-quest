"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Icon } from "../ui/Icon";
import { JourneyMap } from "./JourneyMap";
import { useData } from "../providers/DataProvider";
import { useUI, type JourneyTab } from "../providers/UIProvider";
import { useToast } from "../providers/ToastProvider";
import { dateKey, formatLongDay, parseKey } from "@/lib/dates";
import { MILESTONES, journeyPosition, levelInfo } from "@/lib/progress";
import { completedOn } from "@/lib/quests";

const TABS: { id: JourneyTab; label: string; icon: "map" | "quill" | "calendar" }[] = [
  { id: "journey", label: "Journey", icon: "map" },
  { id: "reflection", label: "Reflection", icon: "quill" },
  { id: "history", label: "History", icon: "calendar" },
];

export function JourneyModal() {
  const { journey, close, openJourney } = useUI();
  return (
    <Modal open={!!journey} onClose={() => close("journey")} kicker="The knight's record" title="Your Journey" size="lg">
      <div className="mb-5 flex gap-1 rounded-xl bg-[rgba(110,82,40,.1)] p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={journey === t.id}
            onClick={() => openJourney(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-display text-[0.9rem] font-semibold tracking-[0.02em] transition-colors ${
              journey === t.id ? "bg-[#2d241a] text-parchment shadow" : "text-ink-soft hover:text-ink"
            }`}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>
      {journey === "journey" && <JourneyTabView />}
      {journey === "reflection" && <ReflectionTab />}
      {journey === "history" && <HistoryTab />}
    </Modal>
  );
}

function JourneyTabView() {
  const { totalXp, profile } = useData();
  const lvl = levelInfo(totalXp);
  const pos = journeyPosition(totalXp);
  const days = profile?.days ?? {};
  const fulfilled = Object.values(days).reduce((s, d) => s + d.completed, 0);
  const activeDays = Object.values(days).filter((d) => d.completed > 0).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="min-w-[14rem] flex-1">
          <p className="font-display text-[0.9rem] font-semibold tracking-[0.02em] text-ink-faint">Level {lvl.level}</p>
          <p className="font-display text-[1.6rem] font-semibold leading-tight text-ink">{lvl.rank}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[rgba(110,82,40,.16)]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8c6a2c] to-[#d4ad55] transition-[width] duration-1000" style={{ width: `${lvl.progress * 100}%` }} />
          </div>
          <p className="mt-1 text-[0.95rem] text-ink-soft">
            {lvl.intoLevel} / {lvl.levelSpan} XP toward level {lvl.level + 1}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-center">
          {[
            ["Total XP", totalXp],
            ["Quests fulfilled", fulfilled],
            ["Days on the road", activeDays],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dd className="font-display text-[1.4rem] font-semibold text-ink">{v}</dd>
              <dt className="text-[0.82rem] leading-tight text-ink-soft">{k}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-[rgba(110,82,40,.2)] bg-[rgba(255,252,240,.35)] px-3 pb-2 pt-4">
        <JourneyMap xp={totalXp} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label">Now resting at</p>
          <p className="font-display text-[1.05rem] font-semibold text-ink">{pos.current.name}</p>
          <p className="text-ink-soft">{pos.current.blurb}</p>
        </div>
        <div>
          <p className="label">The road ahead</p>
          {pos.next ? (
            <>
              <p className="font-display text-[1.05rem] font-semibold text-ink">{pos.next.name}</p>
              <p className="text-ink-soft">{pos.xpToNext} XP further along the road.</p>
            </>
          ) : (
            <p className="text-ink-soft">You have reached Everdawn. The road continues beyond the known map — every quest still counts.</p>
          )}
        </div>
      </div>

      <ol className="grid gap-1.5 sm:grid-cols-2">
        {MILESTONES.map((m) => {
          const reached = totalXp >= m.xp;
          return (
            <li key={m.name} className={`flex items-center gap-2 text-[0.98rem] ${reached ? "text-ink" : "text-ink-faint"}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${reached ? "bg-crimson text-[#f6dcc4]" : "border border-[rgba(110,82,40,.35)]"}`}>{reached && <Icon name="check" size={12} strokeWidth={2.4} />}</span>
              {m.name}
              <span className="ml-auto text-[0.85rem] opacity-85">{m.xp} XP</span>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-[0.92rem] text-ink-faint">Unfinished quests never cost you progress. The road only moves forward.</p>
    </div>
  );
}

function ReflectionTab() {
  const { reflections, quests, saveReflection } = useData();
  const toast = useToast();
  const today = dateKey();
  const existing = reflections.find((r) => r.date === today);
  const [v, setV] = useState({ accomplished: "", wentWell: "", improve: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setV({ accomplished: existing?.accomplished ?? "", wentWell: existing?.wentWell ?? "", improve: existing?.improve ?? "" });
    // Only when the stored entry itself changes.
  }, [existing?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const doneToday = quests.filter((q) => completedOn(q, today));
  const dirty = v.accomplished !== (existing?.accomplished ?? "") || v.wentWell !== (existing?.wentWell ?? "") || v.improve !== (existing?.improve ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveReflection({ date: today, accomplished: v.accomplished.slice(0, 3000), wentWell: v.wentWell.slice(0, 3000), improve: v.improve.slice(0, 3000) });
      toast({ tone: "success", title: "Reflection recorded", body: "Rest well, knight." });
    } catch {
      /* toast shown */
    } finally {
      setSaving(false);
    }
  };

  const fields: [keyof typeof v, string, string][] = [
    ["accomplished", "What did you accomplish today?", "Even small steps count."],
    ["wentWell", "What went well?", "A moment worth keeping."],
    ["improve", "What would you like to do better tomorrow?", "Gently — not a judgement."],
  ];

  return (
    <form onSubmit={save} className="grid gap-5">
      <div>
        <p className="font-display text-[1.05rem] font-semibold text-ink">{formatLongDay(today)}</p>
        <p className="text-ink-soft">By the fire, look back on the day&apos;s road.</p>
        {doneToday.length > 0 && (
          <div className="mt-3 rounded-xl bg-[rgba(110,82,40,.08)] px-4 py-3">
            <p className="label !mb-1">Fulfilled today</p>
            <ul className="grid gap-0.5 text-[0.98rem] text-ink">
              {doneToday.map((q) => (
                <li key={q.id} className="flex items-center gap-2">
                  <Icon name="check" size={14} className="text-moss" strokeWidth={2.2} /> {q.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {fields.map(([k, label, hint], i) => (
        <div key={k}>
          <label className="label" htmlFor={`r-${k}`}>
            {label}
          </label>
          <textarea id={`r-${k}`} data-autofocus={i === 0 ? true : undefined} className="field" rows={3} maxLength={3000} placeholder={hint} value={v[k]} onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))} />
        </div>
      ))}
      <div className="flex items-center justify-end gap-3">
        {existing && !dirty && <span className="text-[0.92rem] text-ink-faint">Saved</span>}
        <button type="submit" className="btn btn-ink" disabled={saving || !dirty}>
          <Icon name="quill" size={16} /> {existing ? "Update reflection" : "Record reflection"}
        </button>
      </div>
    </form>
  );
}

function HistoryTab() {
  const { profile, reflections, quests } = useData();
  const today = dateKey();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(today);
  const days = profile?.days ?? {};
  const reflected = useMemo(() => new Set(reflections.map((r) => r.date)), [reflections]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= count; d++) out.push(dateKey(new Date(cursor.y, cursor.m, d)));
    return out;
  }, [cursor]);

  const shift = (n: number) => setCursor((c) => {
    const d = new Date(c.y, c.m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const selectedStat = days[selected];
  const selectedQuests = quests.filter((q) => completedOn(q, selected));
  const selectedReflection = reflections.find((r) => r.date === selected);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const isCurrentMonth = cursor.y === new Date().getFullYear() && cursor.m === new Date().getMonth();

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <button className="icon-btn text-ink-soft" onClick={() => shift(-1)} aria-label="Previous month">
            <Icon name="chevronLeft" />
          </button>
          <p className="font-display text-[1rem] font-semibold text-ink" aria-live="polite">
            {monthLabel}
          </p>
          <button className="icon-btn text-ink-soft" onClick={() => shift(1)} aria-label="Next month" disabled={isCurrentMonth}>
            <Icon name="chevron" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="pb-1 font-display text-[0.8rem] font-semibold tracking-[0.02em] text-ink-faint">
              {d}
            </span>
          ))}
          {cells.map((key, i) => {
            if (!key) return <span key={`e${i}`} />;
            const stat = days[key];
            const n = stat?.completed ?? 0;
            const future = key > today;
            return (
              <button
                key={key}
                disabled={future}
                onClick={() => setSelected(key)}
                aria-pressed={selected === key}
                aria-label={`${formatLongDay(key)}: ${n} quests fulfilled${reflected.has(key) ? ", reflection written" : ""}`}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-[0.95rem] transition-colors disabled:opacity-35 ${
                  selected === key ? "bg-[#2d241a] text-parchment" : key === today ? "ring-1 ring-[#a37f35] hover:bg-[rgba(110,82,40,.1)]" : "hover:bg-[rgba(110,82,40,.1)]"
                }`}
              >
                {parseKey(key).getDate()}
                <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                  {n > 0 && <span className="rounded-full bg-crimson" style={{ width: Math.min(4 + n * 1.5, 12), height: 5 }} />}
                  {reflected.has(key) && <span className={`h-1.5 w-1.5 rounded-full ${selected === key ? "bg-[#e8c878]" : "bg-[#a37f35]"}`} />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-4 text-[0.85rem] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full bg-crimson" /> Quests fulfilled
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a37f35]" /> Reflection
          </span>
        </p>
      </div>

      <div className="rounded-xl border border-[rgba(110,82,40,.2)] bg-[rgba(255,252,240,.35)] p-4">
        <p className="font-display text-[1rem] font-semibold text-ink">{formatLongDay(selected)}</p>
        <p className="text-[0.95rem] text-ink-soft">
          {selectedStat?.completed ? `${selectedStat.completed} quest${selectedStat.completed === 1 ? "" : "s"} fulfilled · ${selectedStat.xp} XP` : "A quiet day on the road."}
        </p>
        {selectedQuests.length > 0 && (
          <ul className="mt-3 grid gap-1">
            {selectedQuests.map((q) => (
              <li key={q.id} className="flex items-start gap-2 text-[0.98rem] text-ink">
                <Icon name="check" size={14} className="mt-1 text-moss" strokeWidth={2.2} />
                <span>
                  {q.title}
                  <span className="block font-display text-[0.9rem] text-[#8a6a32]">{q.epithet}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        {selectedReflection ? (
          <div className="mt-4 grid gap-3 border-t border-[rgba(110,82,40,.2)] pt-3">
            {[
              ["Accomplished", selectedReflection.accomplished],
              ["Went well", selectedReflection.wentWell],
              ["Tomorrow", selectedReflection.improve],
            ]
              .filter(([, t]) => t)
              .map(([k, t]) => (
                <div key={k}>
                  <p className="label !mb-0.5">{k}</p>
                  <p className="whitespace-pre-wrap text-[0.98rem] leading-snug text-ink">{t}</p>
                </div>
              ))}
          </div>
        ) : (
          <p className="mt-4 border-t border-[rgba(110,82,40,.2)] pt-3 text-[0.95rem] text-ink-faint">No reflection written for this day.</p>
        )}
      </div>
    </div>
  );
}

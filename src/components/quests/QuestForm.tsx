"use client";

import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Icon } from "../ui/Icon";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { addDays, dateKey } from "@/lib/dates";
import { DateField, DateTimeField, TimeField } from "../ui/DateTime";
import { CATEGORY_LABEL, PRIORITY_LABEL, REPEAT_LABEL, suggestEpithet } from "@/lib/lore";
import { CATEGORY_ICON } from "@/lib/quests";
import { XP_BY_PRIORITY } from "@/lib/progress";
import { requestNotificationPermission } from "@/hooks/useReminders";
import type { Category, Priority, QuestInput, Repeat } from "@/lib/types";

const CATEGORIES: Category[] = ["study", "work", "health", "personal", "custom"];
const PRIORITIES: Priority[] = ["low", "normal", "high"];
const REPEATS: Repeat[] = ["none", "daily", "weekdays", "weekly", "monthly"];

function blank(): QuestInput {
  return {
    title: "",
    epithet: "",
    description: "",
    category: "personal",
    customCategory: "",
    dueDate: dateKey(),
    dueTime: "",
    priority: "normal",
    reminderAt: null,
    repeat: "none",
  };
}

export function QuestForm() {
  const { questForm, close } = useUI();
  const { createQuest, updateQuest } = useData();
  const editing = questForm?.quest;
  const [v, setV] = useState<QuestInput>(blank);
  const [salt, setSalt] = useState(0);
  const [epithetTouched, setEpithetTouched] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!questForm) return;
    const q = questForm.quest;
    setV(q ? { ...q } : blank());
    setReminderOn(!!q?.reminderAt);
    setEpithetTouched(!!q);
    setSalt(0);
    setError("");
  }, [questForm]);

  const set = <K extends keyof QuestInput>(k: K, value: QuestInput[K]) => setV((x) => ({ ...x, [k]: value }));

  // Suggest a fantasy title as the user types, until they edit it themselves.
  const suggested = v.title.trim() ? suggestEpithet(v.title, v.category, salt) : "";
  const epithet = epithetTouched ? v.epithet : suggested;

  const defaultReminder = () => {
    const d = new Date(`${v.dueDate}T${v.dueTime || "09:00"}`);
    if (!v.dueTime) d.setHours(9, 0, 0, 0);
    else d.setMinutes(d.getMinutes() - 30);
    if (d.getTime() < Date.now()) {
      // Already past: suggest the next round hour instead.
      const soon = new Date();
      soon.setHours(soon.getHours() + 1, 0, 0, 0);
      return soon.toISOString();
    }
    return d.toISOString();
  };

  const onClose = () => close("questForm");

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!v.title.trim()) {
      setError("Every quest needs a name.");
      return;
    }
    if (v.category === "custom" && !v.customCategory.trim()) {
      setError("Give your custom category a name.");
      return;
    }
    const payload: QuestInput = {
      ...v,
      title: v.title.trim().slice(0, 140),
      epithet: (epithet || suggestEpithet(v.title, v.category)).trim().slice(0, 80),
      description: v.description.trim().slice(0, 2000),
      customCategory: v.category === "custom" ? v.customCategory.trim().slice(0, 30) : "",
      reminderAt: reminderOn ? v.reminderAt ?? defaultReminder() : null,
    };
    setSaving(true);
    try {
      if (editing) {
        const reminderChanged = payload.reminderAt !== editing.reminderAt;
        await updateQuest(editing.id, { ...payload, ...(reminderChanged ? { reminderFired: false } : {}) });
      } else await createQuest(payload);
      onClose();
    } catch {
      /* toast already shown */
    } finally {
      setSaving(false);
    }
  };

  const today = dateKey();
  const quickDates: [string, string][] = [
    ["Today", today],
    ["Tomorrow", addDays(today, 1)],
    ["Next week", addDays(today, 7)],
  ];

  return (
    <Modal
      open={!!questForm}
      onClose={onClose}
      kicker={editing ? "Amend the quest" : "A new quest"}
      title={editing ? "Edit quest" : "Inscribe a quest"}
      footer={
        <>
          <span className="mr-auto hidden text-[0.95rem] text-ink-faint sm:inline">Worth {XP_BY_PRIORITY[v.priority]} XP when fulfilled</span>
          <button type="button" className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="quest-form" className="btn btn-ink" disabled={saving}>
            <Icon name="quill" size={16} />
            {editing ? "Save changes" : "Inscribe quest"}
          </button>
        </>
      }
    >
      <form id="quest-form" onSubmit={submit} className="grid gap-5" noValidate>
        <div>
          <label className="label" htmlFor="q-title">
            What must be done?
          </label>
          <input
            id="q-title"
            data-autofocus
            className="field text-[1.1rem]"
            value={v.title}
            maxLength={140}
            placeholder="Finish the chemistry revision"
            aria-invalid={!!error && !v.title.trim()}
            aria-describedby={error ? "q-error" : undefined}
            onChange={(e) => {
              set("title", e.target.value);
              if (error) setError("");
            }}
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="font-display text-[0.8rem] tracking-[0.02em] text-ink-faint">Known as</span>
            <input
              className="field min-h-0 flex-1 border-transparent bg-transparent px-1 py-0.5 font-display text-[0.86rem] text-[#7a5a2a] hover:border-[rgba(110,82,40,.3)] focus:bg-[rgba(255,252,240,.6)]"
              value={epithet}
              maxLength={80}
              placeholder="A fantasy title appears as you type"
              aria-label="Fantasy title"
              onChange={(e) => {
                setEpithetTouched(true);
                set("epithet", e.target.value);
              }}
            />
            <button
              type="button"
              className="icon-btn icon-btn--sm text-ink-soft"
              aria-label="Suggest another fantasy title"
              title="Suggest another title"
              disabled={!v.title.trim()}
              onClick={() => {
                setEpithetTouched(false);
                setSalt((s) => s + 1);
              }}
            >
              <Icon name="dice" size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="q-desc">
            Notes <span className="normal-case tracking-normal opacity-85">(optional)</span>
          </label>
          <textarea id="q-desc" className="field" rows={2} maxLength={2000} value={v.description} placeholder="Chapters 4–6, then the practice paper" onChange={(e) => set("description", e.target.value)} />
        </div>

        <fieldset>
          <legend className="label">Category</legend>
          <div className="segmented">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" aria-pressed={v.category === c} onClick={() => set("category", c)}>
                <Icon name={CATEGORY_ICON[c]} size={15} />
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          {v.category === "custom" && (
            <input
              className="field mt-2"
              value={v.customCategory}
              maxLength={30}
              placeholder="Name it — e.g. Music, Garden, Finances"
              aria-label="Custom category name"
              onChange={(e) => set("customCategory", e.target.value)}
            />
          )}
        </fieldset>

        <fieldset>
          <legend className="label">Priority</legend>
          <div className="segmented">
            {PRIORITIES.map((p) => (
              <button key={p} type="button" aria-pressed={v.priority === p} onClick={() => set("priority", p)}>
                <span className={`inline-block h-2 w-2 rounded-full ${p === "high" ? "bg-crimson" : p === "normal" ? "bg-[#a37f35]" : "bg-[#9c9179]"}`} />
                {PRIORITY_LABEL[p]}
                <span className="text-[0.8rem] opacity-80">{XP_BY_PRIORITY[p]} XP</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid items-start gap-4 sm:grid-cols-[1.25fr_1fr]">
          <div>
            <label className="label" htmlFor="q-date">
              Due
            </label>
            <DateField id="q-date" value={v.dueDate} onChange={(k) => set("dueDate", k)} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickDates.map(([label, key]) => (
                <button key={label} type="button" className={`chip transition-colors hover:bg-[rgba(110,82,40,.16)] ${v.dueDate === key ? "!bg-[#2d241a] !text-parchment" : ""}`} onClick={() => set("dueDate", key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="q-time">
              Time <span className="normal-case tracking-normal opacity-85">(optional)</span>
            </label>
            <TimeField id="q-time" value={v.dueTime} optional onChange={(t) => set("dueTime", t)} />
          </div>
        </div>

        <fieldset>
          <legend className="label">Repeat</legend>
          <div className="segmented">
            {REPEATS.map((r) => (
              <button key={r} type="button" aria-pressed={v.repeat === r} onClick={() => set("repeat", r)}>
                {r === "none" ? "Once" : REPEAT_LABEL[r]}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <div>
            <div className="label flex items-center justify-between">
              <span id="q-rem-label">Remind me</span>
              <button
                type="button"
                role="switch"
                aria-checked={reminderOn}
                aria-labelledby="q-rem-label"
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
              <p className="text-[0.98rem] text-ink-soft">No reminder. Turn it on to be nudged while the journal is open.</p>
            )}
          </div>
        </div>

        {error && (
          <p id="q-error" role="alert" className="flex items-center gap-2 text-[0.98rem] text-crimson">
            <Icon name="alert" size={16} /> {error}
          </p>
        )}
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

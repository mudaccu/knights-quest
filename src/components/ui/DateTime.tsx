"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { dateKey, formatDay, formatTime, parseKey } from "@/lib/dates";

/*
 * The browser's own date/time pop-ups are drawn by the operating system and ignore
 * the app's scaling, so they can be unreadably small. These pickers open inline,
 * inside the form, at the same size and style as everything else.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) closeRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener("pointerdown", onDown);
    // On window (capture) so Escape closes just the picker, not the whole dialog.
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
  return ref;
}

function Drawer({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-2 rounded-lg border border-[rgba(110,82,40,.3)] bg-[rgba(255,251,238,.7)] p-3 shadow-[0_6px_18px_-10px_rgba(60,40,15,.5)]">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Trigger({ id, open, onClick, icon, children }: { id?: string; open: boolean; onClick: () => void; icon: "calendar" | "clock"; children: React.ReactNode }) {
  return (
    <button id={id} type="button" className="field flex items-center justify-between gap-2 text-left" aria-expanded={open} onClick={onClick}>
      <span className="truncate">{children}</span>
      <Icon name={icon} size={18} className="shrink-0 text-ink-soft" />
    </button>
  );
}

/* ───────────── Calendar ───────────── */

export function Calendar({ value, onPick, min }: { value: string; onPick: (key: string) => void; min?: string }) {
  const start = parseKey(value || dateKey());
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const today = dateKey();

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (string | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= count; d++) out.push(dateKey(new Date(cursor.y, cursor.m, d)));
    return out;
  }, [cursor]);

  const shift = (n: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const title = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className="icon-btn text-ink-soft" onClick={() => shift(-1)} aria-label="Previous month">
          <Icon name="chevronLeft" size={20} />
        </button>
        <p className="font-display text-[1.1rem] font-bold text-ink" aria-live="polite">
          {title}
        </p>
        <button type="button" className="icon-btn text-ink-soft" onClick={() => shift(1)} aria-label="Next month">
          <Icon name="chevron" size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 font-display text-[0.9rem] font-bold text-ink-faint">
            {d}
          </span>
        ))}
        {cells.map((key, i) => {
          if (!key) return <span key={`e${i}`} />;
          const selected = key === value;
          const disabled = !!min && key < min;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onPick(key)}
              aria-pressed={selected}
              aria-label={parseKey(key).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              className={`grid h-10 place-items-center rounded-md text-[1.08rem] transition-colors disabled:opacity-30 ${
                selected ? "bg-[#2d241a] font-bold text-parchment" : key === today ? "font-bold text-crimson ring-1 ring-[#a37f35] hover:bg-[rgba(110,82,40,.12)]" : "text-ink hover:bg-[rgba(110,82,40,.12)]"
              }`}
            >
              {parseKey(key).getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateField({ id, value, onChange, min }: { id?: string; value: string; onChange: (key: string) => void; min?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div ref={ref}>
      <Trigger id={id} open={open} icon="calendar" onClick={() => setOpen((o) => !o)}>
        {formatDay(value)}
        {/* "Today", "Friday"… also show the calendar date */}
        {!/\d/.test(formatDay(value)) && <span className="text-ink-soft"> · {parseKey(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
      </Trigger>
      <Drawer open={open}>
        <Calendar
          value={value}
          min={min}
          onPick={(k) => {
            onChange(k);
            setOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
}

/* ───────────── Time ───────────── */

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const pad = (n: number) => String(n).padStart(2, "0");

function split(hhmm: string) {
  const [h, m] = (hhmm || "09:00").split(":").map(Number);
  return { h12: h % 12 === 0 ? 12 : h % 12, m, pm: h >= 12 };
}
const join = (h12: number, m: number, pm: boolean) => `${pad((h12 % 12) + (pm ? 12 : 0))}:${pad(m)}`;

export function TimePanel({ value, onChange }: { value: string; onChange: (hhmm: string) => void }) {
  const { h12, m, pm } = split(value);
  const groupId = useId();
  const cell = (on: boolean) =>
    `h-10 rounded-md text-[1.05rem] transition-colors ${on ? "bg-[#2d241a] font-bold text-parchment" : "text-ink hover:bg-[rgba(110,82,40,.12)]"}`;
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-[1.1rem] font-bold text-ink">{formatTime(join(h12, m, pm))}</p>
        <div className="segmented" role="group" aria-label="Morning or afternoon">
          <button type="button" aria-pressed={!pm} onClick={() => onChange(join(h12, m, false))}>
            AM
          </button>
          <button type="button" aria-pressed={pm} onClick={() => onChange(join(h12, m, true))}>
            PM
          </button>
        </div>
      </div>
      <div>
        <p id={`${groupId}-h`} className="label">
          Hour
        </p>
        <div className="grid grid-cols-6 gap-1" role="group" aria-labelledby={`${groupId}-h`}>
          {HOURS.map((h) => (
            <button key={h} type="button" className={cell(h === h12)} aria-pressed={h === h12} onClick={() => onChange(join(h, m, pm))}>
              {h}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p id={`${groupId}-m`} className="label">
          Minute
        </p>
        <div className="grid grid-cols-6 gap-1" role="group" aria-labelledby={`${groupId}-m`}>
          {MINUTES.map((x) => (
            <button key={x} type="button" className={cell(x === m)} aria-pressed={x === m} onClick={() => onChange(join(h12, x, pm))}>
              :{pad(x)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimeField({ id, value, onChange, optional = false }: { id?: string; value: string; onChange: (hhmm: string) => void; optional?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  return (
    <div ref={ref}>
      <Trigger
        id={id}
        open={open}
        icon="clock"
        onClick={() => {
          if (!value && !open) onChange("09:00");
          setOpen((o) => !o);
        }}
      >
        {value ? formatTime(value) : <span className="text-[rgba(70,56,42,.55)]">Any time</span>}
      </Trigger>
      <Drawer open={open}>
        <TimePanel value={value} onChange={onChange} />
        <div className="mt-3 flex justify-end gap-2">
          {optional && value && (
            <button
              type="button"
              className="btn btn-quiet !min-h-9"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear time
            </button>
          )}
          <button type="button" className="btn btn-ink !min-h-9" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      </Drawer>
    </div>
  );
}

/** Date + time for a reminder, stored as an ISO timestamp. */
export function DateTimeField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const d = new Date(value);
  const day = dateKey(d);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes() - (d.getMinutes() % 5))}`;
  const update = (k: string, t: string) => onChange(new Date(`${k}T${t}`).toISOString());
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <DateField value={day} min={dateKey()} onChange={(k) => update(k, time)} />
      <TimeField value={time} onChange={(t) => update(day, t || "09:00")} />
    </div>
  );
}

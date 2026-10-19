"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { celebrations, type CompletionEvent } from "@/lib/events";
import { Crest } from "../hud/TopBar";

/** A short banner when the knight rises a level or reaches a new landmark. */
export function Ceremony() {
  const [event, setEvent] = useState<(CompletionEvent & { key: number }) | null>(null);

  useEffect(
    () =>
      celebrations.on((e) => {
        if (!e.leveledUp && !e.milestone) return;
        setEvent({ ...e, key: Date.now() });
      }),
    [],
  );

  useEffect(() => {
    if (!event) return;
    const t = window.setTimeout(() => setEvent(null), 5200);
    return () => window.clearTimeout(t);
  }, [event]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.key}
          className="fixed inset-x-0 top-[22%] z-[70] flex justify-center px-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.5 } }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="assertive"
        >
          <button onClick={() => setEvent(null)} className="parchment relative overflow-hidden rounded-2xl px-8 py-6 text-center sm:px-12" aria-label="Dismiss">
            <motion.div
              className="absolute inset-0"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(232,200,120,.45), transparent 60%)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5] }}
              transition={{ duration: 2 }}
            />
            <div className="relative flex flex-col items-center">
              <motion.div initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}>
                <Crest size={54} />
              </motion.div>
              {event.leveledUp ? (
                <>
                  <p className="mt-3 font-display text-[0.9rem] font-semibold tracking-[0.02em] text-ink-faint">{event.rankChanged ? "A new title is bestowed" : "Your strength grows"}</p>
                  <p className="mt-1 font-display text-[1.7rem] font-semibold leading-tight text-ink">Level {event.level}</p>
                  <p className="font-display text-[1.05rem] text-[#7a5a2a]">{event.rank}</p>
                </>
              ) : null}
              {event.milestone && (
                <p className={`${event.leveledUp ? "mt-3 text-[1rem]" : "mt-3 font-display text-[1.4rem] font-semibold"} text-ink`}>
                  {event.leveledUp ? <>You have reached {event.milestone}</> : event.milestone}
                </p>
              )}
              {!event.leveledUp && event.milestone && <p className="text-ink-soft">A new landmark on your road.</p>}
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

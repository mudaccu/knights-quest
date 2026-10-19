"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Icon } from "../ui/Icon";
import { useUI } from "../providers/UIProvider";
import { useData } from "../providers/DataProvider";
import { dateKey } from "@/lib/dates";

export function MobileNav() {
  const { setSheet, sheet, openJourney, openQuestForm, openNoteForm } = useUI();
  const { quests } = useData();
  const [choose, setChoose] = useState(false);
  const today = dateKey();
  const due = quests.filter((q) => !q.completed && q.dueDate <= today).length;

  const item = "flex flex-1 flex-col items-center gap-0.5 py-1.5 font-display text-[0.8rem] font-semibold tracking-[0.02em] transition-colors";

  return (
    <>
      <AnimatePresence>
        {choose && (
          <>
            <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setChoose(false)} />
            <motion.div
              className="glass fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom))] left-1/2 z-50 grid w-[15rem] -translate-x-1/2 gap-1 rounded-2xl p-2"
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
            >
              <button
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5"
                onClick={() => {
                  setChoose(false);
                  openQuestForm();
                }}
              >
                <Icon name="scroll" className="text-gold-bright" />
                <span>
                  <span className="block font-display text-[0.8rem] font-semibold tracking-[0.02em]">New quest</span>
                  <span className="text-[0.85rem] opacity-80">Something to accomplish</span>
                </span>
              </button>
              <button
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/5"
                onClick={() => {
                  setChoose(false);
                  openNoteForm();
                }}
              >
                <Icon name="quill" className="text-gold-bright" />
                <span>
                  <span className="block font-display text-[0.8rem] font-semibold tracking-[0.02em]">New note</span>
                  <span className="text-[0.85rem] opacity-80">Something to remember</span>
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <nav className="glass fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex items-center rounded-2xl px-1 text-mist" aria-label="Main">
        <button className={`${item} ${sheet === "quests" ? "text-gold-bright" : "opacity-80"}`} onClick={() => setSheet("quests")}>
          <span className="relative">
            <Icon name="scroll" />
            {due > 0 && <span className="absolute -right-2 -top-1 rounded-full bg-crimson px-1 text-[0.8rem] leading-[1.1rem] text-white">{due}</span>}
          </span>
          Quests
        </button>
        <button className={`${item} ${sheet === "chronicle" ? "text-gold-bright" : "opacity-80"}`} onClick={() => setSheet("chronicle")}>
          <Icon name="quill" />
          Chronicle
        </button>
        <div className="flex flex-1 justify-center">
          <button className="btn btn-gold -mt-6 !h-14 !w-14 !rounded-full !p-0" onClick={() => setChoose((c) => !c)} aria-label="Add a quest or note" aria-expanded={choose}>
            <motion.span animate={{ rotate: choose ? 45 : 0 }}>
              <Icon name="plus" size={24} strokeWidth={2} />
            </motion.span>
          </button>
        </div>
        <button className={`${item} opacity-80`} onClick={() => openJourney("journey")}>
          <Icon name="map" />
          Journey
        </button>
        <button className={`${item} opacity-80`} onClick={() => openJourney("reflection")}>
          <Icon name="moon" />
          Reflect
        </button>
      </nav>
    </>
  );
}

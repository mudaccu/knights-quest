"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";
import { SoundControl } from "./SoundControl";
import { ProfileMenu } from "./ProfileMenu";
import { useData } from "../providers/DataProvider";
import { useUI } from "../providers/UIProvider";
import { celebrations } from "@/lib/events";
import { journeyPosition, levelInfo } from "@/lib/progress";
import type { Phase } from "@/lib/types";
import { PHASE_LABEL } from "../world/palette";

export function Crest({ size = 34 }: { size?: number }) {
  return (
    <svg width={`${size / 16}rem`} height={`${size / 16}rem`} viewBox="0 0 40 40" aria-hidden>
      <path d="M20 3l14 5.5v9.8C34 27.5 28 34.4 20 37 12 34.4 6 27.5 6 18.3V8.5z" fill="#7d2724" stroke="#d9b45e" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 6.8l10.6 4.2v7.4c0 7-4.4 12.4-10.6 14.8C13.8 30.8 9.4 25.4 9.4 18.4V11z" fill="none" stroke="#d9b45e" strokeWidth="0.8" opacity="0.55" />
      <path d="M20 11v17M14.4 17h11.2" stroke="#ecd08a" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <Crest />
      <span className="whitespace-nowrap font-logo text-[1.02rem] font-semibold tracking-[0.14em] text-[#f1e6cb] [text-shadow:0_1px_10px_rgba(0,0,0,.5)] max-[380px]:hidden">KNIGHTS QUEST</span>
    </div>
  );
}

export function TopBar({ phase }: { phase: Phase }) {
  const { totalXp } = useData();
  const { openJourney } = useUI();
  const lvl = levelInfo(totalXp);
  const pos = journeyPosition(totalXp);
  const [floaters, setFloaters] = useState<{ id: number; xp: number }[]>([]);
  const [glow, setGlow] = useState(false);
  const evening = phase === "sunset" || phase === "night";

  useEffect(
    () =>
      celebrations.on((e) => {
        const id = Date.now() + Math.random();
        setFloaters((f) => [...f, { id, xp: e.xp }]);
        setGlow(true);
        window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1600);
        window.setTimeout(() => setGlow(false), 1400);
      }),
    [],
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
      <div className="pointer-events-auto mx-auto flex max-w-[100rem] items-center gap-2 sm:gap-4">
        <Wordmark />

        <button
          onClick={() => openJourney("journey")}
          className="glass group ml-auto flex min-w-0 items-center gap-3 rounded-full py-1.5 pl-3 pr-4 transition-colors hover:border-gold/40 sm:ml-6 sm:mr-auto"
          aria-label={`Level ${lvl.level} ${lvl.rank}, ${totalXp} XP. Open your journey`}
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-[0.8rem] font-semibold text-gold-bright">{lvl.level}</span>
          <span className="min-w-0 text-left">
            <span className="block truncate font-display text-[0.9rem] font-semibold tracking-[0.02em] text-[#efe3c4]">{lvl.rank}</span>
            <span className="relative mt-1 block h-1 w-28 overflow-hidden rounded-full bg-white/10 sm:w-40" id="xp-bar">
              <span className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#a37f35] to-[#ecd08a] transition-[width] duration-1000 ${glow ? "shadow-[0_0_12px_3px_rgba(236,208,138,.7)]" : ""}`} style={{ width: `${Math.max(3, lvl.progress * 100)}%` }} />
            </span>
          </span>
          <span className="hidden text-left text-[0.9rem] leading-tight text-mist/70 lg:block">
            {pos.next ? (
              <>
                Bound for <span className="text-mist">{pos.next.name}</span>
                <span className="block text-[0.8rem]">{pos.xpToNext} XP to go</span>
              </>
            ) : (
              <>Beyond the known map</>
            )}
          </span>
          <span className="relative">
            <AnimatePresence>
              {floaters.map((f) => (
                <motion.span
                  key={f.id}
                  className="absolute -top-2 left-0 whitespace-nowrap font-display text-[0.85rem] font-bold text-gold-bright [text-shadow:0_0_10px_rgba(236,208,138,.8)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -6 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.6 }}
                >
                  +{f.xp} XP
                </motion.span>
              ))}
            </AnimatePresence>
          </span>
        </button>

        <div className="glass flex items-center gap-0.5 rounded-full px-1.5 py-1">
          <span className="hidden items-center gap-1.5 px-2 text-[0.9rem] text-mist/75 md:flex" title="Time of day">
            <Icon name={phase === "night" ? "moon" : phase === "sunset" ? "sunset" : "sun"} size={16} />
            {PHASE_LABEL[phase]}
          </span>
          {evening && (
            <button className="icon-btn text-gold-bright max-sm:hidden" onClick={() => openJourney("reflection")} aria-label="Evening reflection" title="Evening reflection">
              <Icon name="quill" />
            </button>
          )}
          <button className="icon-btn max-sm:hidden" onClick={() => openJourney("journey")} aria-label="Journey and history" title="Journey">
            <Icon name="map" />
          </button>
          <SoundControl />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

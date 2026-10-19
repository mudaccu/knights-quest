"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { World } from "./world/World";
import { PrefsProvider, usePrefs } from "./providers/PrefsProvider";
import { SoundProvider } from "./providers/SoundProvider";
import { ToastProvider } from "./providers/ToastProvider";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { DataProvider, useData } from "./providers/DataProvider";
import { UIProvider, useUI } from "./providers/UIProvider";
import { Welcome } from "./Welcome";
import { Onboarding } from "./Onboarding";
import { TopBar, Crest } from "./hud/TopBar";
import { MobileNav } from "./hud/MobileNav";
import { QuestJournal } from "./quests/QuestJournal";
import { QuestForm } from "./quests/QuestForm";
import { ChronicleModal, ChronicleSummary } from "./notes/Chronicle";
import { NoteForm } from "./notes/NoteForm";
import { JourneyModal } from "./journey/JourneyModal";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Sheet } from "./ui/Sheet";
import { Icon } from "./ui/Icon";
import { Ceremony } from "./effects/Ceremony";
import { useMediaQuery, usePhase } from "@/hooks/usePhase";
import { useReminders } from "@/hooks/useReminders";
import { todaySummary } from "@/lib/quests";
import type { Phase } from "@/lib/types";

/** Quest panel width in rem, so it scales with the interface. */
const PANEL_REM = 25.75;

function useRem() {
  const read = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const [rem, setRem] = useState(read);
  useEffect(() => {
    const onResize = () => setRem(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return rem;
}

export default function KnightsQuest() {
  return (
    <PrefsProvider>
      <Shell />
    </PrefsProvider>
  );
}

function Shell() {
  const { prefs, motionReduced } = usePrefs();
  const phase = usePhase(prefs.phase);
  return (
    <MotionConfig reducedMotion={motionReduced ? "always" : "never"}>
      <SoundProvider phase={phase}>
        <ToastProvider>
          <AuthProvider>
            <UIProvider>
              <Root phase={phase} />
            </UIProvider>
          </AuthProvider>
        </ToastProvider>
      </SoundProvider>
    </MotionConfig>
  );
}

function Root({ phase }: { phase: Phase }) {
  const { state, backend } = useAuth();
  const { prefs, motionReduced } = usePrefs();
  const desktop = useMediaQuery("(min-width: 1200px)");
  const rem = useRem();
  const [onboarded, setOnboarded] = useState(false);
  const night = phase === "night";

  const inApp = !!backend && onboarded;
  const panelOpen = desktop && inApp && prefs.questPanelOpen;
  const anchor = !inApp ? (desktop ? 0.3 : 0.5) : desktop ? (night ? 0.42 : 0.5) : night ? 0.3 : 0.5;

  return (
    <>
      <World phase={phase} anchor={anchor} reserveRight={panelOpen ? (PANEL_REM + 1.5) * rem : 0} lift={!desktop && inApp ? 64 : 0} motionOn={!motionReduced} />

      <AnimatePresence>{state.status === "signedOut" && <Welcome key="welcome" />}</AnimatePresence>
      <AnimatePresence>{state.status === "loading" && <Loader key="loader" label="Lighting the lanterns…" />}</AnimatePresence>

      {backend && (
        <DataProvider backend={backend} key={state.status === "cloud" ? state.user.uid : "demo"}>
          <Experience phase={phase} desktop={desktop} onOnboarded={setOnboarded} />
        </DataProvider>
      )}

      <Curtain />
    </>
  );
}

function Experience({ phase, desktop, onOnboarded }: { phase: Phase; desktop: boolean; onOnboarded: (v: boolean) => void }) {
  const { ready, profile } = useData();
  const onboarded = !!profile?.onboarded;

  useEffect(() => {
    onOnboarded(ready && onboarded);
    return () => onOnboarded(false);
  }, [ready, onboarded, onOnboarded]);

  if (!ready) return <Loader label="Unrolling your journal…" />;
  if (!onboarded) return <Onboarding />;
  return <Main phase={phase} desktop={desktop} />;
}

function Main({ phase, desktop }: { phase: Phase; desktop: boolean }) {
  const ui = useUI();
  const { prefs, setPref } = usePrefs();
  const { quests } = useData();
  const summary = todaySummary(quests);
  useReminders();

  // Keyboard shortcuts: Q new quest, N new note, J journey.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || ui.anyModalOpen) return;
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select, [contenteditable=true]")) return;
      const k = e.key.toLowerCase();
      if (k === "q") {
        e.preventDefault();
        ui.openQuestForm();
      } else if (k === "n") {
        e.preventDefault();
        ui.openNoteForm();
      } else if (k === "j") {
        e.preventDefault();
        ui.openJourney();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ui]);

  return (
    <>
      <TopBar phase={phase} />

      {desktop ? (
        <>
          <AnimatePresence initial={false}>
            {prefs.questPanelOpen ? (
              <motion.aside
                key="panel"
                className="parchment fixed bottom-5 right-5 top-[5.4rem] z-30 flex flex-col overflow-hidden rounded-2xl"
                style={{ width: `${PANEL_REM}rem` }}
                initial={{ x: "110%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "110%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                aria-label="Quest journal"
              >
                <div className="min-h-0 flex-1">
                  <QuestJournal onCollapse={() => setPref("questPanelOpen", false)} />
                </div>
              </motion.aside>
            ) : (
              <motion.button
                key="tab"
                className="parchment fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-xl px-2.5 py-4"
                initial={{ x: 60 }}
                animate={{ x: 0 }}
                exit={{ x: 60 }}
                onClick={() => setPref("questPanelOpen", true)}
                aria-label="Open quest journal"
              >
                <Icon name="scroll" size={20} className="text-[#7a5a2a]" />
                <span className="font-display text-[0.9rem] font-semibold tracking-[0.02em] text-ink [writing-mode:vertical-rl]">Quest Journal</span>
                {summary.total > 0 && (
                  <span className="rounded-full bg-[#2d241a] px-1.5 py-0.5 font-display text-[0.8rem] text-parchment">
                    {summary.done}/{summary.total}
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          <motion.aside
            className="parchment fixed bottom-5 left-5 z-30 flex max-h-[min(46vh,30rem)] w-[20rem] flex-col overflow-hidden rounded-2xl"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 30 }}
            aria-label="The Chronicle"
          >
            <ChronicleSummary />
          </motion.aside>
        </>
      ) : (
        <>
          <MobileNav />
          <Sheet open={ui.sheet === "quests"} onClose={() => ui.setSheet(null)} label="Quest journal">
            <QuestJournal compactHeader />
          </Sheet>
          <Sheet open={ui.sheet === "chronicle"} onClose={() => ui.setSheet(null)} label="The Chronicle">
            <ChronicleSummary />
          </Sheet>
        </>
      )}

      <QuestForm />
      <NoteForm />
      <ChronicleModal />
      <JourneyModal />
      <ConfirmDialog />
      <Ceremony />
    </>
  );
}

function Loader({ label }: { label: string }) {
  return (
    <motion.div className="fixed inset-0 z-[55] grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.6 } }} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <motion.div animate={{ opacity: [0.55, 1, 0.55], scale: [0.98, 1, 0.98] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
          <Crest size={52} />
        </motion.div>
        <p className="font-display text-[0.9rem] font-semibold tracking-[0.02em] text-[#efe3c4] [text-shadow:0_1px_8px_rgba(0,0,0,.6)]">{label}</p>
      </div>
    </motion.div>
  );
}

/** Fade in from darkness on first load. */
function Curtain() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 2400);
    return () => window.clearTimeout(t);
  }, []);
  return gone ? null : <div className="curtain pointer-events-none fixed inset-0 z-[90] bg-[#05070a]" aria-hidden />;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loadPref, savePref } from "@/lib/storage";
import type { Phase } from "@/lib/types";

export interface Prefs {
  /** "auto" follows the user's local clock. */
  phase: "auto" | Phase;
  /** "system" follows the OS prefers-reduced-motion setting. */
  motion: "system" | "full" | "reduced";
  questPanelOpen: boolean;
}

const DEFAULTS: Prefs = { phase: "auto", motion: "system", questPanelOpen: true };
const KEY = "knightsquest.prefs.v1";

interface Ctx {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  /** Effective result of the motion setting. */
  motionReduced: boolean;
  /** Whether the OS asks for reduced motion. */
  osReduced: boolean;
}

const PrefsContext = createContext<Ctx | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPref(KEY, DEFAULTS));
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOsReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const setPref = useCallback<Ctx["setPref"]>((key, value) => {
    setPrefs((p) => {
      const next = { ...p, [key]: value };
      savePref(KEY, next);
      return next;
    });
  }, []);

  const motionReduced = prefs.motion === "reduced" || (prefs.motion === "system" && osReduced);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", motionReduced);
  }, [motionReduced]);

  return <PrefsContext.Provider value={{ prefs, setPref, motionReduced, osReduced }}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PrefsProvider");
  return ctx;
}

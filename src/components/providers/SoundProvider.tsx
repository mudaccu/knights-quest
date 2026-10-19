"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AmbientEngine, type SoundSettings } from "@/lib/audio/engine";
import { loadPref, savePref } from "@/lib/storage";
import type { Phase } from "@/lib/types";

const KEY = "knightsquest.sound.v1";
// Muted by default — sound only begins after the user explicitly turns it on.
const DEFAULTS: SoundSettings = { enabled: false, volume: 0.45, music: true, ambience: true };

interface Ctx {
  settings: SoundSettings;
  /** True when sound is on but the browser is waiting for a click to resume. */
  pending: boolean;
  setEnabled: (on: boolean) => void;
  update: (patch: Partial<SoundSettings>) => void;
}

const SoundContext = createContext<Ctx | null>(null);

export function SoundProvider({ phase, children }: { phase: Phase; children: React.ReactNode }) {
  const [settings, setSettings] = useState<SoundSettings>(() => loadPref(KEY, DEFAULTS));
  const [pending, setPending] = useState(false);
  const engine = useRef<AmbientEngine | null>(null);

  const getEngine = () => (engine.current ??= new AmbientEngine());

  const persist = (s: SoundSettings) => savePref(KEY, s);

  // If sound was left on last visit, resume on the first interaction (autoplay rules).
  useEffect(() => {
    if (!settings.enabled) return;
    setPending(true);
    const resume = () => {
      const e = getEngine();
      e.update(settings);
      void e.start().then(() => setPending(false));
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engine.current?.setPhase(phase);
  }, [phase]);

  useEffect(() => () => engine.current?.dispose(), []);

  const setEnabled = useCallback(
    (on: boolean) => {
      setSettings((s) => {
        const next = { ...s, enabled: on };
        persist(next);
        const e = getEngine();
        e.setPhase(phase);
        e.update(next);
        if (on) void e.start().then(() => setPending(false));
        else {
          setPending(false);
          void e.suspend();
        }
        return next;
      });
    },
    [phase],
  );

  const update = useCallback((patch: Partial<SoundSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      persist(next);
      engine.current?.update(next);
      return next;
    });
  }, []);

  return <SoundContext.Provider value={{ settings, pending, setEnabled, update }}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
}

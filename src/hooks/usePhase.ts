"use client";

import { useEffect, useState } from "react";
import { phaseForHour } from "@/components/world/palette";
import type { Phase } from "@/lib/types";

/** Time of day from the local clock (rechecked every 30s), unless overridden. */
export function usePhase(override: "auto" | Phase = "auto"): Phase {
  const [clock, setClock] = useState<Phase>(() => phaseForHour(new Date().getHours()));
  useEffect(() => {
    const tick = () => setClock(phaseForHour(new Date().getHours()));
    const id = window.setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  return override === "auto" ? clock : override;
}

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return match;
}

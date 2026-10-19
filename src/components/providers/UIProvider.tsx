"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Note, Quest } from "@/lib/types";

export type JourneyTab = "journey" | "reflection" | "history";
export type Sheet = "quests" | "chronicle" | null;

interface ConfirmRequest {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
}

interface UIState {
  questForm: { quest?: Quest } | null;
  noteForm: { note?: Note; draft?: string } | null;
  chronicleOpen: boolean;
  journey: JourneyTab | null;
  confirm: ConfirmRequest | null;
  sheet: Sheet;
}

interface Ctx extends UIState {
  openQuestForm: (quest?: Quest) => void;
  openNoteForm: (note?: Note, draft?: string) => void;
  openChronicle: () => void;
  openJourney: (tab?: JourneyTab) => void;
  askConfirm: (req: ConfirmRequest) => void;
  setSheet: (s: Sheet) => void;
  close: (key: "questForm" | "noteForm" | "chronicleOpen" | "journey" | "confirm") => void;
  anyModalOpen: boolean;
}

const UIContext = createContext<Ctx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [s, set] = useState<UIState>({ questForm: null, noteForm: null, chronicleOpen: false, journey: null, confirm: null, sheet: null });

  const openQuestForm = useCallback((quest?: Quest) => set((x) => ({ ...x, questForm: { quest } })), []);
  const openNoteForm = useCallback((note?: Note, draft?: string) => set((x) => ({ ...x, noteForm: { note, draft } })), []);
  const openChronicle = useCallback(() => set((x) => ({ ...x, chronicleOpen: true, sheet: null })), []);
  const openJourney = useCallback((tab: JourneyTab = "journey") => set((x) => ({ ...x, journey: tab, sheet: null })), []);
  const askConfirm = useCallback((confirm: ConfirmRequest) => set((x) => ({ ...x, confirm })), []);
  const setSheet = useCallback((sheet: Sheet) => set((x) => ({ ...x, sheet })), []);
  const close = useCallback<Ctx["close"]>((key) => set((x) => ({ ...x, [key]: key === "chronicleOpen" ? false : null })), []);

  const value = useMemo<Ctx>(
    () => ({
      ...s,
      openQuestForm,
      openNoteForm,
      openChronicle,
      openJourney,
      askConfirm,
      setSheet,
      close,
      anyModalOpen: !!(s.questForm || s.noteForm || s.chronicleOpen || s.journey || s.confirm),
    }),
    [s, openQuestForm, openNoteForm, openChronicle, openJourney, askConfirm, setSheet, close],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon, type IconName } from "../ui/Icon";

export type ToastTone = "info" | "success" | "error" | "reminder";

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: ToastTone;
}

interface Ctx {
  toast: (t: { title: string; body?: string; tone?: ToastTone; duration?: number }) => void;
}

const ToastContext = createContext<Ctx | null>(null);

const TONE_ICON: Record<ToastTone, IconName> = {
  info: "scroll",
  success: "check",
  error: "alert",
  reminder: "bell",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback<Ctx["toast"]>(
    ({ title, body, tone = "info", duration }) => {
      const id = next.current++;
      setToasts((t) => [...t.slice(-3), { id, title, body, tone }]);
      window.setTimeout(() => dismiss(id), duration ?? (tone === "reminder" ? 12000 : tone === "error" ? 7000 : 4000));
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-16 z-[80] flex flex-col items-center gap-2 px-4 sm:top-20"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`toast pointer-events-auto toast--${t.tone}`}
            >
              <span className="toast__icon" aria-hidden>
                <Icon name={TONE_ICON[t.tone]} size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[0.8rem] tracking-[0.02em]">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[0.95rem] leading-snug opacity-80">{t.body}</p>}
              </div>
              <button className="icon-btn icon-btn--sm -mr-1" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <Icon name="close" size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}

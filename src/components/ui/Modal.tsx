"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Small caps line above the title. */
  kicker?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Disable closing via backdrop/Escape (e.g. during onboarding). */
  dismissible?: boolean;
}

const WIDTH = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl" };

export function Modal({ open, onClose, title, kicker, children, footer, size = "md", dismissible = true }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      const el = panel.current;
      if (!el) return;
      const target = el.querySelector<HTMLElement>("[data-autofocus]") ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el;
      target.focus();
    }, 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === "Tab" && panel.current) {
        const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      previous?.focus?.();
    };
  }, [open, dismissible]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.22 } }}
        >
          <div className="absolute inset-0 bg-[#05070a]/60 backdrop-blur-[3px]" onClick={dismissible ? onClose : undefined} aria-hidden />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={`parchment relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl outline-none sm:rounded-2xl ${WIDTH[size]}`}
            initial={{ y: 40, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.99, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <header className="flex items-start gap-3 px-5 pb-3 pt-5 sm:px-7 sm:pt-6">
              <div className="min-w-0 flex-1">
                {kicker && <p className="font-display text-[0.9rem] font-semibold tracking-[0.02em] text-ink-faint">{kicker}</p>}
                <h2 id={titleId} className="font-display text-[1.35rem] font-semibold leading-tight text-ink sm:text-[1.5rem]">
                  {title}
                </h2>
              </div>
              {dismissible && (
                <button className="icon-btn -mr-2 -mt-1 text-ink-soft" onClick={onClose} aria-label="Close">
                  <Icon name="close" />
                </button>
              )}
            </header>
            <div className="parchment-divider parchment-divider--fleuron mx-8 sm:mx-10" />
            <div className="scroll-area min-h-0 flex-1 px-5 py-5 sm:px-7">{children}</div>
            {footer && (
              <>
                <div className="parchment-divider mx-5 sm:mx-7" />
                <footer className="flex flex-wrap items-center justify-end gap-2 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-7 sm:pb-5">{footer}</footer>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

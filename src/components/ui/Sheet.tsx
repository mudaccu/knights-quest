"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/** Mobile bottom sheet: drag the handle down, tap the backdrop or press Escape to close. */
export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const drag = useDragControls();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="parchment absolute inset-x-0 bottom-0 flex h-[78dvh] flex-col rounded-t-[1.4rem] pb-[env(safe-area-inset-bottom)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose();
            }}
          >
            <button className="flex w-full touch-none justify-center pb-1 pt-3" onPointerDown={(e) => drag.start(e)} onClick={onClose} aria-label="Close">
              <span className="h-1.5 w-11 rounded-full bg-[rgba(110,82,40,.35)]" />
            </button>
            <div className="min-h-0 flex-1">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

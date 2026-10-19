"use client";

import { motion } from "framer-motion";
import { Icon } from "./ui/Icon";
import { Crest } from "./hud/TopBar";
import { useAuth } from "./providers/AuthProvider";

/** Shown over the living world when no one is signed in. */
export function Welcome() {
  const { state, cloudAvailable, signInWithGoogle, enterDemo, busy } = useAuth();
  const error = state.status === "signedOut" ? state.error : undefined;

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto px-4 pt-[12vh] sm:items-center sm:pt-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/50" aria-hidden />
      <motion.section
        className="relative w-full max-w-[34rem] text-center"
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        aria-labelledby="welcome-title"
      >
        <div className="flex justify-center">
          <Crest size={64} />
        </div>
        <h1 id="welcome-title" className="mt-4 font-logo text-[2.3rem] font-semibold tracking-[0.1em] text-[#f3e8cc] [text-shadow:0_2px_24px_rgba(0,0,0,.6)] sm:text-[2.8rem]">
          KNIGHTS QUEST
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-[1.15rem] leading-snug text-[#eadfc6] [text-shadow:0_1px_12px_rgba(0,0,0,.7)]">
          You are not merely managing tasks. You are documenting a journey.
        </p>

        <div className="glass mx-auto mt-8 max-w-[26rem] rounded-2xl p-5 text-left">
          {cloudAvailable ? (
            <button className="btn w-full !min-h-11 bg-[#f5f1e8] !text-[0.8rem] text-[#2a2119] hover:bg-white" onClick={signInWithGoogle} disabled={busy}>
              <Icon name="google" size={18} />
              {busy ? "Opening the gates…" : "Continue with Google"}
            </button>
          ) : (
            <p className="rounded-lg bg-white/5 px-3 py-2 text-[0.92rem] leading-snug text-mist/80">
              <Icon name="alert" size={15} className="mr-1.5 inline -translate-y-px" />
              Cloud sync isn&apos;t configured for this build yet, so Google sign-in is unavailable.
            </p>
          )}

          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 text-[0.95rem] text-[#f2b2a6]">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <div className="my-4 flex items-center gap-3 text-[0.8rem] tracking-[0.02em] text-mist/60">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>

          <button className="btn btn-ghost w-full !min-h-11" onClick={enterDemo}>
            <Icon name="shield" size={17} /> Begin in demo mode
          </button>
          <p className="mt-2.5 text-center text-[0.86rem] leading-snug text-mist/60">Demo mode keeps your journal only in this browser. It isn&apos;t synced across devices.</p>
        </div>
      </motion.section>
    </motion.div>
  );
}

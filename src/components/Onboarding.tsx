"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Icon, type IconName } from "./ui/Icon";
import { useAuth } from "./providers/AuthProvider";
import { useData } from "./providers/DataProvider";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "scroll", title: "Quests", body: "Real tasks — study, work, health, home — written in your journal. Seal one when it's done to earn experience." },
  { icon: "quill", title: "The Chronicle", body: "Things worth remembering: an exam date, a promise, an idea. Pin the ones that matter most." },
  { icon: "moon", title: "Evening reflection", body: "When the fire is lit, look back on the day. A missed quest never costs you progress." },
];

export function Onboarding() {
  const { state } = useAuth();
  const { saveProfile } = useData();
  const suggested = state.status === "cloud" ? state.user.displayName.split(" ")[0] : "";
  const [step, setStep] = useState(0);
  const [name, setName] = useState(suggested);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await saveProfile({ displayName: name.trim().slice(0, 40) || "Wanderer", onboarded: true, totalXp: 0, days: {}, createdAt: new Date().toISOString() });
    } catch {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={() => {}}
      dismissible={false}
      size="sm"
      kicker={step === 0 ? "Every journey begins" : "Before you set out"}
      title={step === 0 ? "What is your name, knight?" : "How the road works"}
      footer={
        step === 0 ? (
          <button className="btn btn-ink" onClick={() => setStep(1)} form="name-form" type="submit">
            Continue <Icon name="chevron" size={16} />
          </button>
        ) : (
          <>
            <button className="btn btn-quiet mr-auto" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn btn-ink" onClick={finish} disabled={saving}>
              <Icon name="sword" size={16} /> Begin the journey
            </button>
          </>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === 0 ? (
          <motion.form
            key="name"
            id="name-form"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            onSubmit={(e) => {
              e.preventDefault();
              setStep(1);
            }}
          >
            <label className="label" htmlFor="ob-name">
              Your name
            </label>
            <input id="ob-name" data-autofocus className="field text-[1.1rem]" value={name} maxLength={40} placeholder="Sir or Dame…" onChange={(e) => setName(e.target.value)} />
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">The road ahead is yours. By day you travel; by night you rest beside the fire. Your real-life quests carry you forward.</p>
          </motion.form>
        ) : (
          <motion.ul key="how" className="grid gap-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
            {STEPS.map((s) => (
              <li key={s.title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgba(110,82,40,.12)] text-[#7a5a2a]">
                  <Icon name={s.icon} size={20} />
                </span>
                <div>
                  <p className="font-display text-[0.95rem] font-semibold text-ink">{s.title}</p>
                  <p className="text-[0.98rem] leading-snug text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </Modal>
  );
}

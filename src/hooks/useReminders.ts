"use client";

import { useEffect, useRef } from "react";
import { useData } from "@/components/providers/DataProvider";
import { useToast } from "@/components/providers/ToastProvider";

export async function requestNotificationPermission() {
  if (typeof Notification === "undefined") return "unsupported" as const;
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch {
      return "denied" as const;
    }
  }
  return Notification.permission;
}

function notify(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/crest.svg", tag: `${title}-${body}` });
  } catch {
    /* some mobile browsers only allow notifications from a service worker */
  }
}

/**
 * Fires due reminders for quests and notes while the app is open: an in-app
 * toast plus a system notification when permission was granted.
 */
export function useReminders() {
  const { quests, notes, updateQuest, updateNote, ready } = useData();
  const toast = useToast();
  const firing = useRef(new Set<string>());
  const latest = useRef({ quests, notes });
  latest.current = { quests, notes };

  useEffect(() => {
    if (!ready) return;
    const check = () => {
      const now = Date.now();
      for (const q of latest.current.quests) {
        if (q.completed || !q.reminderAt || q.reminderFired || firing.current.has(q.id)) continue;
        if (new Date(q.reminderAt).getTime() <= now) {
          firing.current.add(q.id);
          toast({ tone: "reminder", title: "A quest calls", body: q.title });
          notify("Knights Quest — a quest calls", q.title);
          void updateQuest(q.id, { reminderFired: true }).finally(() => firing.current.delete(q.id));
        }
      }
      for (const n of latest.current.notes) {
        if (!n.reminderAt || n.reminderFired || firing.current.has(n.id)) continue;
        if (new Date(n.reminderAt).getTime() <= now) {
          firing.current.add(n.id);
          toast({ tone: "reminder", title: "From the Chronicle", body: n.title });
          notify("Knights Quest — from the Chronicle", n.title);
          void updateNote(n.id, { reminderFired: true }).finally(() => firing.current.delete(n.id));
        }
      }
    };
    check();
    const id = window.setInterval(check, 15_000);
    return () => window.clearInterval(id);
  }, [ready, toast, updateQuest, updateNote]);
}

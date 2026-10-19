import type { Category, Priority, Repeat } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  study: "Study",
  work: "Work",
  health: "Health",
  personal: "Personal",
  custom: "Custom",
};

export const PRIORITY_LABEL: Record<Priority, string> = { low: "Low", normal: "Normal", high: "High" };

export const REPEAT_LABEL: Record<Repeat, string> = {
  none: "Does not repeat",
  daily: "Every day",
  weekdays: "Every weekday",
  weekly: "Every week",
  monthly: "Every month",
};

const EPITHETS: Record<Category, string[]> = {
  study: [
    "The Scholar's Trial",
    "Lessons of the Old Tomes",
    "The Lantern-Lit Study",
    "Riddles of the Archive",
    "The Apprentice's Vigil",
    "Ink Before Dawn",
  ],
  work: [
    "The Guildmaster's Commission",
    "A Charge from the Keep",
    "The Steward's Ledger",
    "Forging at the Anvil",
    "The Merchant's Errand",
    "Duty of the Watch",
  ],
  health: [
    "The Trial of Endurance",
    "The Long March",
    "Tending the Inner Flame",
    "Strength of the Oak",
    "The Healer's Counsel",
    "Breath of the Highlands",
  ],
  personal: [
    "A Matter of the Hearth",
    "The Quiet Oath",
    "Letters to Distant Kin",
    "Mending the Banner",
    "A Promise Kept",
    "The Wanderer's Rest",
  ],
  custom: [
    "A Quest of One's Own",
    "The Unwritten Road",
    "A Task Beyond the Map",
    "The Errant Path",
    "By the Knight's Own Hand",
  ],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A stable fantasy title for a quest; `salt` lets the user reroll. */
export function suggestEpithet(title: string, category: Category, salt = 0): string {
  const list = EPITHETS[category];
  return list[(hash(title.trim().toLowerCase()) + salt) % list.length];
}

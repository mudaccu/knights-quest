import type { Priority } from "./types";

export const XP_BY_PRIORITY: Record<Priority, number> = { low: 10, normal: 20, high: 35 };

/** Total XP required to reach a level. L1 = 0, L2 = 100, L3 = 300, L4 = 600 … */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

export interface LevelInfo {
  level: number;
  rank: string;
  intoLevel: number;
  levelSpan: number;
  progress: number;
}

export const RANKS: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: "Squire" },
  { minLevel: 3, title: "Knight-Errant" },
  { minLevel: 6, title: "Knight of the Realm" },
  { minLevel: 10, title: "Knight Banneret" },
  { minLevel: 15, title: "Paladin" },
  { minLevel: 21, title: "Lord Protector" },
];

export function rankFor(level: number): string {
  let title = RANKS[0].title;
  for (const r of RANKS) if (level >= r.minLevel) title = r.title;
  return title;
}

export function levelInfo(xp: number): LevelInfo {
  const safe = Math.max(0, xp);
  let level = 1;
  while (xpForLevel(level + 1) <= safe) level++;
  const base = xpForLevel(level);
  const span = xpForLevel(level + 1) - base;
  return { level, rank: rankFor(level), intoLevel: safe - base, levelSpan: span, progress: (safe - base) / span };
}

export type MilestoneKind = "crossroads" | "forest" | "ruins" | "river" | "tower" | "mountain" | "castle";

export interface Milestone {
  xp: number;
  name: string;
  kind: MilestoneKind;
  blurb: string;
}

export const MILESTONES: Milestone[] = [
  { xp: 0, name: "The Mossy Crossroads", kind: "crossroads", blurb: "Where every journey begins." },
  { xp: 100, name: "Whispering Pines", kind: "forest", blurb: "The wind remembers every traveller." },
  { xp: 300, name: "Ruins of Aldermere", kind: "ruins", blurb: "Old stones, older promises." },
  { xp: 600, name: "The Silver Ford", kind: "river", blurb: "Cold water, steady footing." },
  { xp: 1000, name: "Highwatch Keep", kind: "tower", blurb: "From here, the road ahead is clear." },
  { xp: 1600, name: "The Ashen Pass", kind: "mountain", blurb: "Few cross it. You did." },
  { xp: 2500, name: "Everdawn Castle", kind: "castle", blurb: "The banners rise for you." },
];

export interface JourneyPosition {
  current: Milestone;
  next: Milestone | null;
  index: number;
  /** 0..1 progress from current toward next milestone. */
  segment: number;
  /** 0..1 progress along the whole known road. */
  overall: number;
  xpToNext: number;
}

export function journeyPosition(xp: number): JourneyPosition {
  let index = 0;
  for (let i = 0; i < MILESTONES.length; i++) if (xp >= MILESTONES[i].xp) index = i;
  const current = MILESTONES[index];
  const next = MILESTONES[index + 1] ?? null;
  const segment = next ? (xp - current.xp) / (next.xp - current.xp) : 1;
  const overall = next ? (index + segment) / (MILESTONES.length - 1) : 1;
  return { current, next, index, segment, overall, xpToNext: next ? next.xp - xp : 0 };
}

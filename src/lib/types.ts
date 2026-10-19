export type Category = "study" | "work" | "health" | "personal" | "custom";
export type Priority = "low" | "normal" | "high";
export type Repeat = "none" | "daily" | "weekdays" | "weekly" | "monthly";
export type Phase = "morning" | "afternoon" | "sunset" | "night";

export interface Quest {
  id: string;
  title: string;
  /** Fantasy name shown above the real title, e.g. "The Scholar's Trial". */
  epithet: string;
  description: string;
  category: Category;
  /** Label used when category is "custom". */
  customCategory: string;
  /** Local date, YYYY-MM-DD. */
  dueDate: string;
  /** Local time, HH:MM, or "" when not set. */
  dueTime: string;
  priority: Priority;
  /** ISO timestamp, or null when no reminder. */
  reminderAt: string | null;
  reminderFired: boolean;
  repeat: Repeat;
  completed: boolean;
  completedAt: string | null;
  /** XP granted when completed; 0 while open. */
  xpAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: string;
  pinned: boolean;
  important: boolean;
  reminderAt: string | null;
  reminderFired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  /** Local date, YYYY-MM-DD — also the document id. */
  date: string;
  accomplished: string;
  wentWell: string;
  improve: string;
  updatedAt: string;
}

export interface DayStat {
  completed: number;
  xp: number;
}

export interface Profile {
  displayName: string;
  onboarded: boolean;
  totalXp: number;
  days: Record<string, DayStat>;
  createdAt: string;
}

export type QuestInput = Pick<
  Quest,
  | "title"
  | "epithet"
  | "description"
  | "category"
  | "customCategory"
  | "dueDate"
  | "dueTime"
  | "priority"
  | "reminderAt"
  | "repeat"
>;

export type NoteInput = Pick<Note, "title" | "content" | "tag" | "pinned" | "important" | "reminderAt">;

import { dateKey } from "./dates";
import type { Category, Priority, Quest } from "./types";
import type { IconName } from "@/components/ui/Icon";

export type QuestView = "today" | "upcoming" | "overdue" | "completed";

export const CATEGORY_ICON: Record<Category, IconName> = {
  study: "book",
  work: "hammer",
  health: "heart",
  personal: "hearth",
  custom: "banner",
};

const PRIORITY_RANK: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

const byDue = (a: Quest, b: Quest) =>
  a.dueDate.localeCompare(b.dueDate) ||
  (a.dueTime || "99").localeCompare(b.dueTime || "99") ||
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
  a.createdAt.localeCompare(b.createdAt);

export const completedOn = (q: Quest, day: string) => !!q.completedAt && dateKey(new Date(q.completedAt)) === day;

export function inView(q: Quest, view: QuestView, today = dateKey()): boolean {
  switch (view) {
    case "today":
      return q.completed ? completedOn(q, today) : q.dueDate === today;
    case "upcoming":
      return !q.completed && q.dueDate > today;
    case "overdue":
      return !q.completed && q.dueDate < today;
    case "completed":
      return q.completed;
  }
}

export function sortForView(list: Quest[], view: QuestView): Quest[] {
  if (view === "completed") return [...list].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  if (view === "today") return [...list].sort((a, b) => Number(a.completed) - Number(b.completed) || byDue(a, b));
  return [...list].sort(byDue);
}

export function todaySummary(quests: Quest[], today = dateKey()) {
  const relevant = quests.filter((q) => (q.completed ? completedOn(q, today) : q.dueDate === today));
  const done = relevant.filter((q) => q.completed).length;
  return { done, total: relevant.length };
}

export function categoryLabel(q: Pick<Quest, "category" | "customCategory">, labels: Record<Category, string>) {
  return q.category === "custom" && q.customCategory.trim() ? q.customCategory.trim() : labels[q.category];
}

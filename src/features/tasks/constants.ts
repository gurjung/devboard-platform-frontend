import type React from "react";
import {
  Table as TableIcon,
  Kanban as KanbanIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { TaskStatus, TaskPriority, TaskView } from "./types";
import {
  BacklogIcon,
  TodoIcon,
  InProgressIcon,
  InReviewIcon,
  DoneIcon,
  PriorityLowIcon,
  PriorityMediumIcon,
  PriorityHighIcon,
  PriorityUrgentIcon,
} from "./components/task-icons";

export function getShortTaskKey(taskId: string): string {
  const cleaned = taskId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = (cleaned.slice(-4) || "0001").padStart(4, "0");
  return `DEV-${suffix}`;
}

export interface StatusConfig {
  id: TaskStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  badgeClass: string;
  dotClass: string;
  bgLight: string;
  borderClass: string;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  BACKLOG: {
    id: "BACKLOG",
    label: "Backlog",
    icon: BacklogIcon,
    color: "text-slate-600 dark:text-slate-400",
    badgeClass:
      "bg-muted/60 text-muted-foreground border-input",
    dotClass: "bg-slate-400",
    bgLight: "bg-slate-500/5",
    borderClass: "border-slate-500/30",
  },
  TODO: {
    id: "TODO",
    label: "To Do",
    icon: TodoIcon,
    color: "text-sky-600 dark:text-sky-400",
    badgeClass:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
    dotClass: "bg-sky-500",
    bgLight: "bg-sky-500/5",
    borderClass: "border-sky-500/30",
  },
  IN_PROGRESS: {
    id: "IN_PROGRESS",
    label: "In Progress",
    icon: InProgressIcon,
    color: "text-amber-700 dark:text-amber-400",
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    dotClass: "bg-amber-500",
    bgLight: "bg-amber-500/5",
    borderClass: "border-amber-500/30",
  },
  IN_REVIEW: {
    id: "IN_REVIEW",
    label: "In Review",
    icon: InReviewIcon,
    color: "text-indigo-600 dark:text-indigo-400",
    badgeClass:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
    dotClass: "bg-indigo-500",
    bgLight: "bg-indigo-500/5",
    borderClass: "border-indigo-500/30",
  },
  DONE: {
    id: "DONE",
    label: "Done",
    icon: DoneIcon,
    color: "text-emerald-600 dark:text-emerald-400",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    dotClass: "bg-emerald-500",
    bgLight: "bg-emerald-500/5",
    borderClass: "border-emerald-500/30",
  },
};

export const TASK_STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export interface PriorityConfig {
  id: TaskPriority;
  label: string;
  icon: React.ElementType;
  color: string;
  badgeClass: string;
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  LOW: {
    id: "LOW",
    label: "Low",
    icon: PriorityLowIcon,
    color: "text-slate-600 dark:text-slate-400",
    badgeClass:
      "bg-muted/60 text-muted-foreground border-input",
  },
  MEDIUM: {
    id: "MEDIUM",
    label: "Medium",
    icon: PriorityMediumIcon,
    color: "text-sky-600 dark:text-sky-400",
    badgeClass:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
  },
  HIGH: {
    id: "HIGH",
    label: "High",
    icon: PriorityHighIcon,
    color: "text-amber-700 dark:text-amber-400",
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
  },
  URGENT: {
    id: "URGENT",
    label: "Urgent",
    icon: PriorityUrgentIcon,
    color: "text-rose-600 dark:text-rose-400",
    badgeClass:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
  },
};

export const TASK_PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export interface ViewConfig {
  id: TaskView;
  label: string;
  icon: React.ElementType;
}

export const TASK_VIEWS: ViewConfig[] = [
  { id: "table", label: "Table", icon: TableIcon },
  { id: "kanban", label: "Kanban", icon: KanbanIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
];

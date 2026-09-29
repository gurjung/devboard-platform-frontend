import React from "react";
import {
  Circle,
  Clock,
  PlayCircle,
  Eye,
  CheckCircle2,
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { TaskStatus, TaskPriority, TaskView } from "./types";

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
    icon: Circle,
    color: "text-slate-500",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotClass: "bg-slate-400",
    bgLight: "bg-slate-500/5",
    borderClass: "border-slate-500/30",
  },
  TODO: {
    id: "TODO",
    label: "To Do",
    icon: Clock,
    color: "text-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
    bgLight: "bg-blue-500/5",
    borderClass: "border-blue-500/30",
  },
  IN_PROGRESS: {
    id: "IN_PROGRESS",
    label: "In Progress",
    icon: PlayCircle,
    color: "text-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
    bgLight: "bg-amber-500/5",
    borderClass: "border-amber-500/30",
  },
  IN_REVIEW: {
    id: "IN_REVIEW",
    label: "In Review",
    icon: Eye,
    color: "text-purple-500",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
    bgLight: "bg-purple-500/5",
    borderClass: "border-purple-500/30",
  },
  DONE: {
    id: "DONE",
    label: "Done",
    icon: CheckCircle2,
    color: "text-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
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
    icon: ArrowDown,
    color: "text-slate-500",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  MEDIUM: {
    id: "MEDIUM",
    label: "Medium",
    icon: Minus,
    color: "text-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  HIGH: {
    id: "HIGH",
    label: "High",
    icon: ArrowUp,
    color: "text-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  URGENT: {
    id: "URGENT",
    label: "Urgent",
    icon: AlertTriangle,
    color: "text-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
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

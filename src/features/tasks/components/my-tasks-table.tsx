"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskPriorityBadge } from "./task-priority-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { en } from "@/locales/en";

interface MyTasksTableProps {
  workspaceSlug: string;
  tasks: Task[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage: () => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus, projectId: string) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority, projectId: string) => void;
  onDeleteClick?: (task: Task) => void;
  hasActiveFilters?: boolean;
}

type SortField = "title" | "project" | "status" | "priority" | "dueDate";
type SortDirection = "asc" | "desc";

export function MyTasksTable({
  workspaceSlug,
  tasks,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onTaskClick,
  onStatusChange,
  onPriorityChange,
  onDeleteClick,
  hasActiveFilters,
}: MyTasksTableProps) {
  const [sortField, setSortField] = React.useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onFetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortField(null);
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTasks = React.useMemo(() => {
    if (!sortField) return tasks;

    const priorityWeight: Record<TaskPriority, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    const statusWeight: Record<TaskStatus, number> = {
      BACKLOG: 1,
      TODO: 2,
      IN_PROGRESS: 3,
      IN_REVIEW: 4,
      DONE: 5,
    };

    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "project") {
        comparison = (a.project?.name || "").localeCompare(b.project?.name || "");
      } else if (sortField === "status") {
        comparison = statusWeight[a.status] - statusWeight[b.status];
      } else if (sortField === "priority") {
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
      } else if (sortField === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [tasks, sortField, sortDirection]);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-border/60 rounded-2xl bg-card">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 text-center">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3 text-muted-foreground">
          <CheckCircle2 className="size-6 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {hasActiveFilters ? "No matching tasks found" : "All caught up!"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {hasActiveFilters
            ? "Try clearing or adjusting your filters to see assigned tasks."
            : "You have no tasks assigned to you in this workspace right now."}
        </p>
      </div>
    );
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-3 opacity-40 ml-1" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="size-3 text-primary ml-1" />
    ) : (
      <ArrowDown className="size-3 text-primary ml-1" />
    );
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold select-none">
            <tr>
              {/* Status */}
              <th
                onClick={() => handleSort("status")}
                className="py-3 px-4 w-36 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <span>{en.tasks.tableHeaders.status}</span>
                  {renderSortIndicator("status")}
                </div>
              </th>

              {/* Task Title */}
              <th
                onClick={() => handleSort("title")}
                className="py-3 px-4 min-w-[220px] cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <span>{en.tasks.tableHeaders.task}</span>
                  {renderSortIndicator("title")}
                </div>
              </th>

              {/* Project Column */}
              <th
                onClick={() => handleSort("project")}
                className="py-3 px-4 w-48 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <span>Project</span>
                  {renderSortIndicator("project")}
                </div>
              </th>

              {/* Priority */}
              <th
                onClick={() => handleSort("priority")}
                className="py-3 px-4 w-32 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <span>{en.tasks.tableHeaders.priority}</span>
                  {renderSortIndicator("priority")}
                </div>
              </th>

              {/* Due Date */}
              <th
                onClick={() => handleSort("dueDate")}
                className="py-3 px-4 w-36 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <span>{en.tasks.tableHeaders.dueDate}</span>
                  {renderSortIndicator("dueDate")}
                </div>
              </th>

              {/* Actions */}
              <th className="py-3 px-3 w-14 text-right">
                <span className="sr-only">{en.tasks.tableHeaders.actions}</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {sortedTasks.map((task) => {
              const isOverdue =
                task.dueDate &&
                task.status !== "DONE" &&
                isPast(new Date(task.dueDate)) &&
                !isToday(new Date(task.dueDate));

              const formattedDate = task.dueDate
                ? format(new Date(task.dueDate), "MMM d, yyyy")
                : null;

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Status Cell */}
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskStatusBadge
                      status={task.status}
                      interactive
                      size="sm"
                      onStatusChange={(newStatus) =>
                        onStatusChange(task.id, newStatus, task.projectId)
                      }
                    />
                  </td>

                  {/* Task Title & Desc */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={cn(
                          "font-semibold text-foreground text-xs line-clamp-1 group-hover:text-primary transition-colors",
                          task.status === "DONE" && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Project Cell */}
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {task.project ? (
                      <Link
                        href={`/dashboard/${workspaceSlug}/projects/${task.project.slug}`}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-muted/60 hover:bg-accent border border-border/60 text-xs font-medium text-foreground transition-colors"
                      >
                        <FolderKanban className="size-3 text-primary opacity-80" />
                        <span className="truncate max-w-32">{task.project.name}</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/60 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Priority Cell */}
                  <td
                    className="py-3 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskPriorityBadge
                      priority={task.priority}
                      interactive
                      size="sm"
                      onPriorityChange={(newPriority) =>
                        onPriorityChange(task.id, newPriority, task.projectId)
                      }
                    />
                  </td>

                  {/* Due Date Cell */}
                  <td className="py-3 px-4">
                    {formattedDate ? (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          isOverdue
                            ? "text-rose-600 dark:text-rose-400 font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {isOverdue ? (
                          <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <CalendarIcon className="size-3.5 opacity-60 shrink-0" />
                        )}
                        <span>{formattedDate}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Actions Cell */}
                  <td
                    className="py-3 px-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="size-7 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer outline-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 p-1">
                        <DropdownMenuItem
                          onClick={() => onTaskClick(task)}
                          className="flex items-center gap-2 text-xs cursor-pointer"
                        >
                          <Edit className="size-3.5" />
                          <span>{en.tasks.editTask}</span>
                        </DropdownMenuItem>
                        {onDeleteClick && (
                          <DropdownMenuItem
                            onClick={() => onDeleteClick(task)}
                            variant="destructive"
                            className="flex items-center gap-2 text-xs cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            <span>{en.tasks.deleteTask}</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="py-2 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Loading more tasks...</span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
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
  FolderOpen,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { getShortTaskKey } from "../constants";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskAssigneeAvatar } from "./task-assignee-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";

interface TaskTableViewProps {
  tasks: Task[];
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage: () => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onDeleteClick?: (task: Task) => void;
  onOpenCreateDialog: () => void;
  hasActiveFilters?: boolean;
}

type SortField = "title" | "status" | "priority" | "dueDate";
type SortDirection = "asc" | "desc";

export function TaskTableView({
  tasks,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onTaskClick,
  onStatusChange,
  onPriorityChange,
  onDeleteClick,
  onOpenCreateDialog,
  hasActiveFilters,
}: TaskTableViewProps) {
  const [sortField, setSortField] = React.useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");
  const [sortAnnouncement, setSortAnnouncement] = React.useState("");
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const captionId = React.useId();

  const collator = React.useMemo(
    () => new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }),
    []
  );

  // Setup IntersectionObserver for infinite scroll sentinel
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

  const handleSort = (field: SortField, label: string) => {
    let nextField: SortField | null = field;
    let nextDirection: SortDirection = "asc";

    if (sortField === field) {
      if (sortDirection === "asc") {
        nextDirection = "desc";
      } else {
        nextField = null;
      }
    }

    setSortField(nextField);
    setSortDirection(nextDirection);

    const countLabel = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
    if (nextField) {
      setSortAnnouncement(
        `Sorted by ${label}, ${nextDirection === "asc" ? "ascending" : "descending"}, ${countLabel}`
      );
    } else {
      setSortAnnouncement(`Default task order restored, ${countLabel}`);
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
      if (sortField === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const comparison =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return sortDirection === "asc" ? comparison : -comparison;
      }

      let comparison = 0;
      if (sortField === "title") {
        comparison = collator.compare(a.title, b.title);
      } else if (sortField === "status") {
        comparison = statusWeight[a.status] - statusWeight[b.status];
      } else if (sortField === "priority") {
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [tasks, sortField, sortDirection, collator]);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] border border-border/50 rounded-xl bg-card">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] rounded-xl border border-dashed border-border bg-muted/15 p-8 text-center">
        <div className="size-11 rounded-xl bg-muted flex items-center justify-center mb-3 text-muted-foreground">
          <FolderOpen className="size-5" aria-hidden="true" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          {hasActiveFilters
            ? en.tasks.noTasksFound
            : en.tasks.emptyProjectTasks}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {hasActiveFilters
            ? en.tasks.noTasksFoundDescription
            : en.tasks.emptyProjectTasksDescription}
        </p>
        <Button
          size="sm"
          onClick={onOpenCreateDialog}
          className="mt-4 h-8 px-3.5 text-xs font-medium rounded-lg cursor-pointer"
        >
          {en.tasks.createTask}
        </Button>
      </div>
    );
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown
          aria-hidden="true"
          className="size-3 text-muted-foreground ml-1 shrink-0"
        />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp
        aria-hidden="true"
        className="size-3 text-brand-text ml-1 shrink-0"
      />
    ) : (
      <ArrowDown
        aria-hidden="true"
        className="size-3 text-brand-text ml-1 shrink-0"
      />
    );
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div role="status" className="sr-only">
        {sortAnnouncement}
      </div>

      <div
        tabIndex={0}
        role="region"
        aria-labelledby={captionId}
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
      >
        <table className="w-full min-w-[760px] text-left text-xs border-separate border-spacing-0">
          <caption id={captionId} className="sr-only">
            Project tasks list
          </caption>

          {/* Table Header */}
          <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-xs text-muted-foreground font-medium select-none">
            <tr>
              {/* Status */}
              <th
                scope="col"
                aria-sort={
                  sortField === "status"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                className="p-0 w-36 border-b border-border/70"
              >
                <button
                  type="button"
                  onClick={() => handleSort("status", en.tasks.tableHeaders.status)}
                  className="flex w-full min-h-9 items-center py-2 px-3.5 text-left font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                >
                  <span>{en.tasks.tableHeaders.status}</span>
                  {renderSortIndicator("status")}
                </button>
              </th>

              {/* Task Title & Description */}
              <th
                scope="col"
                aria-sort={
                  sortField === "title"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                className="p-0 min-w-[240px] max-w-md border-b border-border/70"
              >
                <button
                  type="button"
                  onClick={() => handleSort("title", en.tasks.tableHeaders.task)}
                  className="flex w-full min-h-9 items-center py-2 px-3.5 text-left font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                >
                  <span>{en.tasks.tableHeaders.task}</span>
                  {renderSortIndicator("title")}
                </button>
              </th>

              {/* Priority */}
              <th
                scope="col"
                aria-sort={
                  sortField === "priority"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                className="p-0 w-32 border-b border-border/70"
              >
                <button
                  type="button"
                  onClick={() => handleSort("priority", en.tasks.tableHeaders.priority)}
                  className="flex w-full min-h-9 items-center py-2 px-3.5 text-left font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                >
                  <span>{en.tasks.tableHeaders.priority}</span>
                  {renderSortIndicator("priority")}
                </button>
              </th>

              {/* Assignee (non-sortable) */}
              <th
                scope="col"
                className="py-2 px-3.5 w-44 border-b border-border/70 font-medium text-muted-foreground"
              >
                <span>{en.tasks.tableHeaders.assignee}</span>
              </th>

              {/* Due Date */}
              <th
                scope="col"
                aria-sort={
                  sortField === "dueDate"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                className="p-0 w-36 border-b border-border/70"
              >
                <button
                  type="button"
                  onClick={() => handleSort("dueDate", en.tasks.tableHeaders.dueDate)}
                  className="flex w-full min-h-9 items-center py-2 px-3.5 text-left font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                >
                  <span>{en.tasks.tableHeaders.dueDate}</span>
                  {renderSortIndicator("dueDate")}
                </button>
              </th>

              {/* Actions */}
              <th
                scope="col"
                className="py-2 px-3 w-12 text-right border-b border-border/70 font-medium"
              >
                <span className="sr-only">{en.tasks.tableHeaders.actions}</span>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {sortedTasks.map((task) => {
              const isOverdue =
                task.dueDate &&
                task.status !== "DONE" &&
                isPast(new Date(task.dueDate)) &&
                !isToday(new Date(task.dueDate));

              const formattedDate = task.dueDate
                ? format(new Date(task.dueDate), "MMM d, yyyy")
                : null;

              const issueKey = getShortTaskKey(task.id);

              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {/* Status Cell */}
                  <td
                    className="py-2.5 px-3.5 border-b border-border/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskStatusBadge
                      status={task.status}
                      size="sm"
                      interactive
                      onStatusChange={(newStatus) =>
                        onStatusChange(task.id, newStatus)
                      }
                    />
                  </td>

                  {/* Task Title & Desc Cell */}
                  <td className="py-2.5 px-3.5 max-w-md border-b border-border/40">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[11px] font-medium text-muted-foreground tabular-nums shrink-0">
                          {issueKey}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                          }}
                          className={cn(
                            "min-w-0 truncate text-left font-medium text-foreground text-xs group-hover:text-brand-text hover:text-brand-text focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-xs transition-colors cursor-pointer",
                            task.status === "DONE" &&
                              "line-through text-muted-foreground"
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </button>
                      </div>
                      {task.description && (
                        <span
                          className="text-[11px] text-muted-foreground truncate block pl-[62px]"
                          title={task.description}
                        >
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority Cell */}
                  <td
                    className="py-2.5 px-3.5 border-b border-border/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TaskPriorityBadge
                      priority={task.priority}
                      size="sm"
                      interactive
                      onPriorityChange={(newPriority) =>
                        onPriorityChange(task.id, newPriority)
                      }
                    />
                  </td>

                  {/* Assignee Cell */}
                  <td className="py-2.5 px-3.5 border-b border-border/40">
                    <TaskAssigneeAvatar
                      assignee={task.assignee}
                      size="sm"
                      showName
                    />
                  </td>

                  {/* Due Date Cell */}
                  <td className="py-2.5 px-3.5 border-b border-border/40 tabular-nums">
                    {formattedDate ? (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          isOverdue
                            ? "text-rose-700 dark:text-rose-300 font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {isOverdue ? (
                          <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                        ) : (
                          <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        )}
                        <span>{formattedDate}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">
                        —
                      </span>
                    )}
                  </td>

                  {/* Action Menu Cell */}
                  <td
                    className="py-2.5 px-3 text-right border-b border-border/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Actions for ${task.title}`}
                        className="size-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                      >
                        <MoreVertical className="size-3.5" aria-hidden="true" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 p-1 rounded-xl">
                        <DropdownMenuItem
                          onClick={() => onTaskClick(task)}
                          className="flex items-center gap-2 text-xs cursor-pointer rounded-md"
                        >
                          <Edit className="size-3.5" />
                          <span>{en.tasks.editTask}</span>
                        </DropdownMenuItem>
                        {onDeleteClick && (
                          <DropdownMenuItem
                            onClick={() => onDeleteClick(task)}
                            variant="destructive"
                            className="flex items-center gap-2 text-xs cursor-pointer rounded-md"
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
      <div ref={sentinelRef} className="py-1.5 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1.5">
            <Loader2 className="size-3.5 animate-spin text-brand-text" />
            <span>Loading more tasks...</span>
          </div>
        )}
      </div>
    </div>
  );
}

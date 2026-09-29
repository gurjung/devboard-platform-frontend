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
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

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
          <FolderOpen className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {hasActiveFilters
            ? en.tasks.noTasksFound
            : en.tasks.emptyProjectTasks}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {hasActiveFilters
            ? en.tasks.noTasksFoundDescription
            : en.tasks.emptyProjectTasksDescription}
        </p>
        <Button
          size="sm"
          onClick={onOpenCreateDialog}
          className="mt-4 text-xs font-semibold rounded-xl cursor-pointer"
        >
          {en.tasks.createTask}
        </Button>
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
          {/* Table Header */}
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

              {/* Task Title & Description */}
              <th
                onClick={() => handleSort("title")}
                className="py-3 px-4 min-w-[200px] max-w-sm md:max-w-md cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">
                  <span>{en.tasks.tableHeaders.task}</span>
                  {renderSortIndicator("title")}
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

              {/* Assignee */}
              <th className="py-3 px-4 w-44">
                <span>{en.tasks.tableHeaders.assignee}</span>
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

          {/* Table Body */}
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
                  <td className="py-3 px-4">
                    <TaskStatusBadge
                      status={task.status}
                      size="sm"
                    />
                  </td>

                  {/* Task Title & Desc Cell */}
                  <td className="py-3 px-4 max-w-sm md:max-w-md">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span
                        className={cn(
                          "font-semibold text-foreground text-xs line-clamp-1 truncate break-all block group-hover:text-primary transition-colors",
                          task.status === "DONE" && "line-through text-muted-foreground"
                        )}
                        title={task.title}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span
                          className="text-[11px] text-muted-foreground line-clamp-1 truncate break-all block"
                          title={task.description}
                        >
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority Cell */}
                  <td className="py-3 px-4">
                    <TaskPriorityBadge
                      priority={task.priority}
                      size="sm"
                    />
                  </td>

                  {/* Assignee Cell */}
                  <td className="py-3 px-4">
                    <TaskAssigneeAvatar
                      assignee={task.assignee}
                      size="sm"
                      showName
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

                  {/* Action Menu Cell */}
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

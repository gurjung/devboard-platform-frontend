"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isPast,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "../types";
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
  getShortTaskKey,
} from "../constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { en } from "@/locales/en";

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onOpenCreateWithDueDate: (dueDate: string) => void;
}

export function TaskCalendarView({
  tasks,
  onTaskClick,
  onOpenCreateWithDueDate,
}: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedDayMore, setSelectedDayMore] = React.useState<{
    date: Date;
    tasks: Task[];
  } | null>(null);

  // Month interval calculation inside memo so dependencies stay primitive/stateful
  const { monthStart, days } = React.useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(start);
    return {
      monthStart: start,
      days: eachDayOfInterval({
        start: startOfWeek(start),
        end: endOfWeek(end),
      }),
    };
  }, [currentDate]);

  // Tasks mapped by date string "YYYY-MM-DD"
  const { tasksByDate, unscheduledTasks } = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    const unscheduled: Task[] = [];

    for (const task of tasks) {
      if (!task.dueDate) {
        unscheduled.push(task);
        continue;
      }

      try {
        const dateKey = format(new Date(task.dueDate), "yyyy-MM-dd");
        if (!map[dateKey]) {
          map[dateKey] = [];
        }
        map[dateKey].push(task);
      } catch {
        unscheduled.push(task);
      }
    }

    return { tasksByDate: map, unscheduledTasks: unscheduled };
  }, [tasks]);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-3.5">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-card p-3 rounded-xl border border-border/50">
        <div className="flex items-center gap-3">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-7 px-2.5 text-xs font-medium rounded-md cursor-pointer"
          >
            {en.tasks.calendar.today}
          </Button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="size-8 p-0 rounded-lg cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="size-8 p-0 rounded-lg cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border/50 bg-muted/50 text-center text-[11px] font-medium text-muted-foreground py-2">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days cells grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/40">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentDay = isToday(day);
            const maxVisible = 2;
            const visibleTasks = dayTasks.slice(0, maxVisible);
            const remainingCount = dayTasks.length - maxVisible;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "group min-h-[112px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors hover:bg-muted/25 relative",
                  !isCurrentMonth && "bg-muted/35 text-muted-foreground",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "size-6 rounded-md flex items-center justify-center text-xs font-medium tabular-nums",
                      isCurrentDay
                        ? "bg-primary text-primary-foreground font-semibold"
                        : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <button
                    type="button"
                    aria-label={`Add task for ${format(day, "MMM d")}`}
                    onClick={() => onOpenCreateWithDueDate(dateKey)}
                    className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 size-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring transition-opacity cursor-pointer after:absolute after:inset-0 after:z-0"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>

                {/* Day Task Pills */}
                <div className="flex flex-col gap-1 my-1 flex-1">
                  {visibleTasks.map((task) => {
                    const isOverdue =
                      task.status !== "DONE" &&
                      isPast(new Date(task.dueDate!)) &&
                      !isToday(new Date(task.dueDate!));

                    const priorityCfg = TASK_PRIORITY_CONFIG[task.priority];
                    const StatusIcon = TASK_STATUS_CONFIG[task.status].icon;

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onTaskClick(task)}
                        className={cn(
                          "relative z-10 w-full text-left flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border text-[11px] font-medium truncate cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                          task.status === "DONE"
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 line-through"
                            : isOverdue
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                            : "bg-muted/60 border-input text-foreground hover:bg-accent"
                        )}
                        title={`${getShortTaskKey(task.id)} · ${task.title} (${priorityCfg.label})`}
                      >
                        <StatusIcon
                          aria-hidden="true"
                          className={cn(
                            "size-3 shrink-0",
                            isOverdue
                              ? "text-rose-600 dark:text-rose-400"
                              : TASK_STATUS_CONFIG[task.status].color
                          )}
                        />
                        <span className="truncate">{task.title}</span>
                      </button>
                    );
                  })}

                  {/* More tasks indicator */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDayMore({ date: day, tasks: dayTasks })
                      }
                      className="relative z-10 text-[10px] font-medium text-brand-text hover:underline text-left px-1 mt-0.5 min-h-6 cursor-pointer tabular-nums focus-visible:outline-2 focus-visible:outline-ring rounded-xs"
                    >
                      +{remainingCount} {en.tasks.calendar.moreTasks}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled Tasks Section */}
      {unscheduledTasks.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-xs font-semibold text-foreground tabular-nums">
              {en.tasks.calendar.noDueDate} ({unscheduledTasks.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unscheduledTasks.map((task) => {
              const StatusIcon = TASK_STATUS_CONFIG[task.status].icon;
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onTaskClick(task)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-input bg-muted/30 hover:bg-accent text-xs font-medium cursor-pointer transition-colors"
                >
                  <StatusIcon
                    aria-hidden="true"
                    className={cn(
                      "size-3 shrink-0",
                      TASK_STATUS_CONFIG[task.status].color
                    )}
                  />
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {getShortTaskKey(task.id)}
                  </span>
                  <span className="truncate max-w-44">{task.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day All Tasks Modal Dialog */}
      <Dialog
        open={Boolean(selectedDayMore)}
        onOpenChange={(open) => !open && setSelectedDayMore(null)}
      >
        <DialogContent className="sm:max-w-md p-5 gap-4">
          {selectedDayMore && (
            <>
              <DialogHeader className="border-b border-border/50 pb-3">
                <DialogTitle className="text-sm font-semibold">
                  Tasks for {format(selectedDayMore.date, "EEEE, MMMM d, yyyy")}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {selectedDayMore.tasks.length} scheduled{" "}
                  {selectedDayMore.tasks.length === 1 ? "task" : "tasks"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
                {selectedDayMore.tasks.map((task) => {
                  const cfg = TASK_STATUS_CONFIG[task.status];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setSelectedDayMore(null);
                        onTaskClick(task);
                      }}
                      className="w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-lg border border-input hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={cn("size-3.5 shrink-0", cfg.color)} />
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums shrink-0">
                          {getShortTaskKey(task.id)}
                        </span>
                        <span className="text-xs font-medium text-foreground truncate">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <DialogFooter className="pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  onClick={() => {
                    const dateStr = format(selectedDayMore.date, "yyyy-MM-dd");
                    setSelectedDayMore(null);
                    onOpenCreateWithDueDate(dateStr);
                  }}
                  className="h-8 text-xs font-medium rounded-lg cursor-pointer gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>{en.tasks.createTask}</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

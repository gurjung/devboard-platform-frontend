"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isPast,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "../constants";
import { Button } from "@/components/ui/button";
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

  // Month interval calculation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = React.useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarStart, calendarEnd]);

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
    <div className="flex flex-col gap-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-2xs">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-7 px-2.5 text-xs font-semibold rounded-lg cursor-pointer"
          >
            {en.tasks.calendar.today}
          </Button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="size-8 p-0 rounded-xl cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="size-8 p-0 rounded-xl cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-2xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
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
                onClick={() => onOpenCreateWithDueDate(dateKey)}
                className={cn(
                  "group min-h-[110px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer hover:bg-muted/30 relative",
                  !isCurrentMonth && "bg-muted/15 text-muted-foreground/40",
                  isCurrentDay && "bg-primary/5"
                )}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "size-6 rounded-full flex items-center justify-center text-xs font-medium",
                      isCurrentDay
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : isCurrentMonth
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateWithDueDate(dateKey);
                    }}
                    className="opacity-0 group-hover:opacity-100 size-5 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-opacity cursor-pointer"
                    title={`Add task for ${format(day, "MMM d")}`}
                  >
                    <Plus className="size-3.5" />
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

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border text-[11px] font-medium truncate cursor-pointer transition-all duration-150 hover:shadow-2xs",
                          task.status === "DONE"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 line-through opacity-70"
                            : isOverdue
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold"
                            : "bg-muted/70 border-border text-foreground hover:bg-accent"
                        )}
                        title={`${task.title} (${task.status} - ${priorityCfg.label})`}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            isOverdue
                              ? "bg-rose-500"
                              : task.status === "DONE"
                              ? "bg-emerald-500"
                              : priorityCfg.color.replace("text-", "bg-")
                          )}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}

                  {/* More tasks indicator */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayMore({ date: day, tasks: dayTasks });
                      }}
                      className="text-[10px] font-semibold text-primary hover:underline text-left px-1 mt-0.5 cursor-pointer"
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
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-muted-foreground" />
            <h4 className="text-xs font-bold text-foreground">
              {en.tasks.calendar.noDueDate} ({unscheduledTasks.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/30 hover:bg-accent text-xs font-medium cursor-pointer transition-colors"
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    TASK_PRIORITY_CONFIG[task.priority].color.replace(
                      "text-",
                      "bg-"
                    )
                  )}
                />
                <span className="truncate max-w-48">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Day All Tasks Modal Dialog */}
      {selectedDayMore && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in-0"
          onClick={() => setSelectedDayMore(null)}
        >
          <div
            className="w-full max-w-md bg-card rounded-2xl border border-border p-5 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground">
                Tasks for {format(selectedDayMore.date, "EEEE, MMMM d, yyyy")}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDayMore(null)}
                className="h-7 w-7 p-0 rounded-lg cursor-pointer"
              >
                ✕
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {selectedDayMore.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedDayMore(null);
                    onTaskClick(task);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        TASK_STATUS_CONFIG[task.status].dotClass
                      )}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border/40">
              <Button
                size="sm"
                onClick={() => {
                  const dateStr = format(selectedDayMore.date, "yyyy-MM-dd");
                  setSelectedDayMore(null);
                  onOpenCreateWithDueDate(dateStr);
                }}
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                + {en.tasks.createTask}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

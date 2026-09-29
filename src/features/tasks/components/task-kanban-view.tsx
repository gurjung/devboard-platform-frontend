"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  GripVertical,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "../types";
import { TASK_STATUSES, TASK_STATUS_CONFIG } from "../constants";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskAssigneeAvatar } from "./task-assignee-avatar";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCreateWithStatus: (status: TaskStatus) => void;
}

// ─── Draggable Task Card ───────────────────────────────────────────
interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isOverlay?: boolean;
}

function TaskCard({ task, onClick, isOverlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    isPast(new Date(task.dueDate)) &&
    !isToday(new Date(task.dueDate));

  const formattedDate = task.dueDate
    ? format(new Date(task.dueDate), "MMM d")
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-border/70 bg-card p-3 shadow-2xs hover:border-border transition-all duration-150 cursor-pointer select-none",
        isDragging && "opacity-30 border-dashed border-primary",
        isOverlay && "rotate-2 scale-105 shadow-xl border-primary ring-2 ring-primary/20 cursor-grabbing bg-card z-50",
        task.status === "DONE" && "opacity-75"
      )}
      onClick={() => onClick(task)}
    >
      {/* Drag handle & Priority header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <TaskPriorityBadge priority={task.priority} size="sm" />
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 -mr-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/80 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to move"
        >
          <GripVertical className="size-3.5" />
        </div>
      </div>

      {/* Task Title & Description */}
      <h4
        className={cn(
          "text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors",
          task.status === "DONE" && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </h4>

      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
          {task.description}
        </p>
      )}

      {/* Footer: Due date & Assignee */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/40">
        <div>
          {formattedDate ? (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium",
                isOverdue
                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="size-3 text-rose-500" />
              ) : (
                <CalendarIcon className="size-3 opacity-60" />
              )}
              <span>{formattedDate}</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/50">No date</span>
          )}
        </div>

        <TaskAssigneeAvatar assignee={task.assignee} size="xs" />
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────
interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const config = TASK_STATUS_CONFIG[status];
  const Icon = config.icon;
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-1 min-w-[260px] max-w-[340px] rounded-2xl border border-border/60 bg-muted/20 p-2.5 shadow-2xs transition-colors",
        isOver && "border-primary/50 bg-primary/5 ring-2 ring-primary/10"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 px-1.5 py-1 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-6 rounded-lg flex items-center justify-center border",
              config.badgeClass
            )}
          >
            <Icon className={cn("size-3.5", config.color)} />
          </div>
          <span className="text-xs font-bold text-foreground">
            {config.label}
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(status)}
          className="size-6 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          title={`Add task to ${config.label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Task Cards Sortable Container */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 flex-1 min-h-[160px] p-0.5 overflow-y-auto max-h-[calc(100vh-280px)]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed border-border/60 p-4 text-center">
              <span className="text-[11px] text-muted-foreground">
                {en.tasks.kanban.emptyColumn}
              </span>
              <button
                type="button"
                onClick={() => onAddTask(status)}
                className="mt-2 text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                + {en.tasks.kanban.addTask}
              </button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Main Kanban View ─────────────────────────────────────────────
export function TaskKanbanView({
  tasks,
  onTaskClick,
  onStatusChange,
  onOpenCreateWithStatus,
}: TaskKanbanViewProps) {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  // Set up pointer sensor with distance activation constraint to distinguish click vs drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by status
  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };

    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        grouped.BACKLOG.push(task);
      }
    }

    return grouped;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    // Determine target status
    let targetStatus: TaskStatus | null = null;

    if (overId.startsWith("column-")) {
      targetStatus = overId.replace("column-", "") as TaskStatus;
    } else {
      // Over another task, take that task's status
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus) {
      const currentTask = tasks.find((t) => t.id === activeTaskId);
      if (currentTask && currentTask.status !== targetStatus) {
        onStatusChange(activeTaskId, targetStatus);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
            onAddTask={onOpenCreateWithStatus}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeTask ? (
          <TaskCard task={activeTask} onClick={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

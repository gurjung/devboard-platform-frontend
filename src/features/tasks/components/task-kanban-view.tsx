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
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "../types";
import { TASK_STATUSES, TASK_STATUS_CONFIG, getShortTaskKey } from "../constants";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskAssigneeAvatar } from "./task-assignee-avatar";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";
import { useSimulation } from "@/features/simulation/context/simulation-context";
import { KanbanSimulationRibbon } from "@/features/simulation/components/kanban-simulation-ribbon";

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
  const { isDemo, highlightedTaskId, spotlightMessage } = useSimulation();
  const isHighlighted = isDemo && task.id === highlightedTaskId;
  const cardRef = React.useRef<HTMLDivElement | null>(null);

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

  const setCombinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      cardRef.current = node;
    },
    [setNodeRef]
  );

  React.useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isHighlighted]);

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
  const issueKey = getShortTaskKey(task.id);

  return (
    <div
      ref={setCombinedRef}
      style={style}
      className={cn(
        "group relative rounded-lg border border-input bg-card p-3 hover:border-border transition-colors duration-200 select-none",
        isDragging && "opacity-35 border-dashed border-primary",
        isOverlay &&
          "scale-[1.02] shadow-xl border-primary ring-2 ring-primary/20 cursor-grabbing bg-card z-50",
        isHighlighted &&
          "ring-4 ring-primary ring-offset-2 ring-offset-background border-primary shadow-xl scale-[1.02] bg-primary/10 z-30 animate-pulse"
      )}
    >
      {/* Simulation Guided Spotlight Banner */}
      {isHighlighted && spotlightMessage && (
        <div
          role="status"
          className="mb-2.5 -mx-1 -mt-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-sm flex items-center justify-between gap-1.5 animate-pulse"
        >
          <span className="flex items-center gap-1.5">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-white"></span>
            </span>
            <span>{spotlightMessage}</span>
          </span>
          <span className="text-[9px] uppercase tracking-wider font-mono">
            LIVE DEMO
          </span>
        </div>
      )}

      {/* Key & Drag Handle Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-mono text-[10px] font-medium text-muted-foreground tabular-nums">
          {issueKey}
        </span>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag task ${task.title}`}
          className="relative z-10 size-6 -mr-1 -mt-0.5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-ring transition-colors"
        >
          <GripVertical className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Task Title & Description */}
      <h3 className="text-[13px] font-medium leading-snug">
        <button
          type="button"
          onClick={() => onClick(task)}
          className={cn(
            "text-left w-full block text-foreground group-hover:text-brand-text hover:text-brand-text transition-colors cursor-pointer after:absolute after:inset-0 after:z-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 rounded-xs",
            task.status === "DONE" && "line-through text-muted-foreground"
          )}
        >
          <span className="line-clamp-2">{task.title}</span>
        </button>
      </h3>

      {task.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: Priority + Due date & Assignee */}
      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-border/45">
        <div className="flex items-center gap-2 min-w-0">
          <TaskPriorityBadge priority={task.priority} size="sm" />
          {formattedDate && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium tabular-nums truncate",
                isOverdue
                  ? "text-rose-700 dark:text-rose-300 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              ) : (
                <CalendarIcon className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
              )}
              <span>{formattedDate}</span>
            </div>
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
        "board-column flex flex-col flex-1 min-w-[270px] max-w-[330px] rounded-xl border border-border/65 bg-muted/25 dark:bg-muted/15 p-2.5 transition-colors",
        isOver && "border-primary/50 bg-primary/5 ring-2 ring-primary/15"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 px-1 py-1 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("size-3.5 shrink-0", config.color)} aria-hidden="true" />
          <h2 className="text-xs font-semibold text-foreground truncate">
            {config.label}
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground bg-background/80 border border-border/60 px-1.5 py-0.5 rounded-md tabular-nums leading-none">
            {tasks.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(status)}
          className="size-6 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0"
          aria-label={`Add task to ${config.label}`}
        >
          <Plus className="size-3.5" aria-hidden="true" />
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
            <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed border-border/70 p-4 text-center">
              <span className="text-[11px] text-muted-foreground">
                {en.tasks.kanban.emptyColumn}
              </span>
              <button
                type="button"
                onClick={() => onAddTask(status)}
                className="mt-2 text-[11px] font-medium text-brand-text hover:underline cursor-pointer"
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

  // Set up pointer sensor with distance activation constraint and keyboard coordinates
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    <div className="flex flex-col flex-1 min-w-0">
      <KanbanSimulationRibbon />

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
    </div>
  );
}

"use client";

import React, { use, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckSquare,
  ChevronRight,
  Search,
  X,
  RotateCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Task,
  TaskStatus,
  TaskPriority,
} from "@/features/tasks/types";
import { useMyTasks } from "@/features/tasks/hooks/use-my-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { MyTasksTable } from "@/features/tasks/components/my-tasks-table";
import {
  TASK_STATUSES,
  TASK_STATUS_CONFIG,
  TASK_PRIORITIES,
  TASK_PRIORITY_CONFIG,
} from "@/features/tasks/constants";

const EditTaskDialog = dynamic(
  () =>
    import("@/features/tasks/components/edit-task-dialog").then(
      (mod) => mod.EditTaskDialog
    ),
  { ssr: false }
);
import type { WorkspaceRole } from "@/features/workspace/types";
import { cn } from "@/lib/utils";
import { TourSpotlightWrapper } from "@/features/simulation/components/tour-spotlight-wrapper";

interface MyTasksPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default function MyTasksPage({ params }: MyTasksPageProps) {
  const { workspaceSlug } = use(params);
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status");
  const initialStatus: TaskStatus | "ALL" =
    statusParam && (TASK_STATUSES as readonly string[]).includes(statusParam)
      ? (statusParam as TaskStatus)
      : "ALL";
  const initialOverdue = searchParams.get("overdue") === "true";

  return (
    <MyTasksContent
      key={`${initialStatus}-${initialOverdue}`}
      workspaceSlug={workspaceSlug}
      initialStatus={initialStatus}
      initialOverdue={initialOverdue}
    />
  );
}

interface MyTasksContentProps {
  workspaceSlug: string;
  initialStatus: TaskStatus | "ALL";
  initialOverdue: boolean;
}

function MyTasksContent({
  workspaceSlug,
  initialStatus,
  initialOverdue,
}: MyTasksContentProps) {
  const router = useRouter();
  const { user } = useAuth();

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  const [filters, setFilters] = useState<{
    search: string;
    status: TaskStatus | "ALL";
    priority: TaskPriority | "ALL";
    overdue: boolean;
  }>({
    search: "",
    status: initialStatus,
    priority: "ALL",
    overdue: initialOverdue,
  });

  // Dialog state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Queries
  const {
    tasks,
    totalCount,
    isLoading: isTasksLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMyTasks({
    workspaceId: currentWorkspace?.id,
    filters,
  });

  const updateTaskMutation = useUpdateTask(
    currentWorkspace?.id,
    editingTask?.projectId
  );
  const deleteTaskMutation = useDeleteTask(
    currentWorkspace?.id,
    editingTask?.projectId
  );

  const role = (currentWorkspace?.role || "MEMBER").toUpperCase() as WorkspaceRole;

  if (isWorkspacesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h1 className="text-xl font-bold text-foreground">Workspace not found</h1>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 text-xs cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      filters.status !== "ALL" ||
      filters.priority !== "ALL" ||
      filters.overdue
  );

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      priority: "ALL",
      overdue: false,
    });
    router.replace(`/dashboard/${workspaceSlug}/my-tasks`, { scroll: false });
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  };

  const handleStatusChange = (
    taskId: string,
    newStatus: TaskStatus,
    projectId: string
  ) => {
    updateTaskMutation.mutate({
      taskId,
      projectId,
      data: { status: newStatus },
      silent: false,
    });
  };

  const handlePriorityChange = (
    taskId: string,
    newPriority: TaskPriority,
    projectId: string
  ) => {
    updateTaskMutation.mutate({
      taskId,
      projectId,
      data: { priority: newPriority },
      silent: false,
    });
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate({
      taskId: task.id,
      projectId: task.projectId || task.project?.id,
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1600px] mx-auto py-1 px-1 sm:px-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-lg bg-primary/10 text-brand-text border border-primary/20 flex items-center justify-center shrink-0">
            <CheckSquare className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                My Tasks
              </h1>
              <Badge
                variant="outline"
                className="h-5 text-[11px] font-medium px-2 rounded-md border-border/70 text-muted-foreground tabular-nums"
              >
                {totalCount} {totalCount === 1 ? "task" : "tasks"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <Link
                href={`/dashboard/${workspaceSlug}`}
                className="font-medium hover:text-foreground transition-colors whitespace-nowrap"
              >
                {currentWorkspace.name}
              </Link>
              <ChevronRight className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="truncate">Assigned to you across all projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2.5 py-0.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input
              aria-label="Search my tasks"
              placeholder="Search by title, description, or project..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-8 pr-8 text-xs h-8 rounded-lg bg-card border-input"
            />
            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring cursor-pointer"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="w-auto min-w-34">
              <Select
                value={filters.status}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (val as TaskStatus | "ALL") || "ALL",
                  }))
                }
              >
                <SelectTrigger
                  aria-label="Filter by status"
                  className="h-8 text-xs rounded-lg bg-card border-input flex items-center gap-1.5 px-2.5"
                >
                  <span className="text-muted-foreground font-medium shrink-0">
                    Status:
                  </span>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">
                    <span className="text-xs">All Statuses</span>
                  </SelectItem>
                  {TASK_STATUSES.map((st) => {
                    const cfg = TASK_STATUS_CONFIG[st];
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={st} value={st}>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon className={cn("size-3.5", cfg.color)} />
                          <span>{cfg.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-auto min-w-34">
              <Select
                value={filters.priority}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: (val as TaskPriority | "ALL") || "ALL",
                  }))
                }
              >
                <SelectTrigger
                  aria-label="Filter by priority"
                  className="h-8 text-xs rounded-lg bg-card border-input flex items-center gap-1.5 px-2.5"
                >
                  <span className="text-muted-foreground font-medium shrink-0">
                    Priority:
                  </span>
                  <SelectValue placeholder="Filter priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">
                    <span className="text-xs">All Priorities</span>
                  </SelectItem>
                  {TASK_PRIORITIES.map((pr) => {
                    const cfg = TASK_PRIORITY_CONFIG[pr];
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={pr} value={pr}>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon className={cn("size-3.5", cfg.color)} />
                          <span>{cfg.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Overdue toggle chip */}
            <button
              type="button"
              aria-pressed={filters.overdue}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  overdue: !prev.overdue,
                }))
              }
              className={cn(
                "h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap",
                filters.overdue
                  ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/35"
                  : "bg-card border-input text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              <span>Overdue Only</span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1 rounded-lg"
              >
                <RotateCcw className="size-3" />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="mt-1">
        <TourSpotlightWrapper id="my-tasks-table">
          <MyTasksTable
            workspaceSlug={workspaceSlug}
            tasks={tasks}
            isLoading={isTasksLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onFetchNextPage={fetchNextPage}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDeleteClick={handleDeleteTask}
            hasActiveFilters={hasActiveFilters}
          />
        </TourSpotlightWrapper>
      </div>

      {/* Edit Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          workspaceId={currentWorkspace.id}
          projectId={editingTask.projectId}
          userRole={role}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

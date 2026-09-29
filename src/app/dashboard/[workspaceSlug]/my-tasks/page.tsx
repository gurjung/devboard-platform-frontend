"use client";

import React, { use, useState, useEffect } from "react";
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
import {
  type Task,
  type TaskStatus,
  type TaskPriority,
  useMyTasks,
  useUpdateTask,
  useDeleteTask,
  MyTasksTable,
  EditTaskDialog,
  TASK_STATUSES,
  TASK_STATUS_CONFIG,
  TASK_PRIORITIES,
  TASK_PRIORITY_CONFIG,
} from "@/features/tasks";
import type { WorkspaceRole } from "@/features/workspace/types";
import { en } from "@/locales/en";
import { cn } from "@/lib/utils";

interface MyTasksPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
}

export default function MyTasksPage({ params }: MyTasksPageProps) {
  const { workspaceSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  // Initial filter values from URL params
  const initialStatus = (searchParams.get("status") as TaskStatus) || "ALL";
  const initialOverdue = searchParams.get("overdue") === "true";

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

  // Sync state if URL query params change
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const overdueParam = searchParams.get("overdue") === "true";
    if (statusParam && (TASK_STATUSES as readonly string[]).includes(statusParam)) {
      setFilters((prev) => ({ ...prev, status: statusParam as TaskStatus }));
    }
    if (overdueParam) {
      setFilters((prev) => ({ ...prev, overdue: true }));
    }
  }, [searchParams]);

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
        <h2 className="text-xl font-bold text-foreground">Workspace not found</h2>
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
      data: { priority: newPriority },
      silent: false,
    });
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate(task.id);
  };

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto py-2 px-1 sm:px-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
            <CheckSquare className="size-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                My Tasks
              </h1>
              <Badge variant="outline" className="text-[11px] font-semibold">
                {totalCount} {totalCount === 1 ? "task" : "tasks"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link
                href={`/dashboard/${workspaceSlug}`}
                className="font-medium hover:underline text-foreground"
              >
                {currentWorkspace.name}
              </Link>
              <ChevronRight className="size-3 opacity-60" />
              <span>Assigned to you across all projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 py-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title, description, or project..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-9 pr-8 text-xs h-9 rounded-xl bg-card border-border/70"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="w-36">
              <Select
                value={filters.status}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (val as TaskStatus | "ALL") || "ALL",
                  }))
                }
              >
                <SelectTrigger className="h-8 text-xs rounded-xl bg-card border-border/70">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <span className="text-xs">All Statuses</span>
                  </SelectItem>
                  {TASK_STATUSES.map((st) => {
                    const cfg = TASK_STATUS_CONFIG[st];
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={st} value={st}>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon className={cn("size-3", cfg.color)} />
                          <span>{cfg.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-36">
              <Select
                value={filters.priority}
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: (val as TaskPriority | "ALL") || "ALL",
                  }))
                }
              >
                <SelectTrigger className="h-8 text-xs rounded-xl bg-card border-border/70">
                  <SelectValue placeholder="Filter priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <span className="text-xs">All Priorities</span>
                  </SelectItem>
                  {TASK_PRIORITIES.map((pr) => {
                    const cfg = TASK_PRIORITY_CONFIG[pr];
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={pr} value={pr}>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon className={cn("size-3", cfg.color)} />
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
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  overdue: !prev.overdue,
                }))
              }
              className={cn(
                "h-8 px-2.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors",
                filters.overdue
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertCircle className="size-3 text-rose-500" />
              <span>Overdue Only</span>
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
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

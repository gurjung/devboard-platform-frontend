"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  FolderKanban,
  Loader2,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProject } from "@/features/projects/hooks/use-project";
import { useAuth } from "@/features/auth/context/auth-context";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceRole } from "@/features/workspace/types";
import {
  type Task,
  type TaskStatus,
  type TaskPriority,
  type TaskFilters,
  type TaskView,
  useTasks,
  useUpdateTask,
  useDeleteTask,
  ViewSelector,
  TaskFilterBar,
  TaskTableView,
  TaskKanbanView,
  TaskCalendarView,
  CreateTaskDialog,
  EditTaskDialog,
} from "@/features/tasks";
import { en } from "@/locales/en";

interface ProjectPageProps {
  params: Promise<{
    workspaceSlug: string;
    projectSlug: string;
  }>;
}

export default function ProjectHomePage({ params }: ProjectPageProps) {
  const { workspaceSlug, projectSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Active View State (synced with ?view= URL query)
  const initialView = (searchParams.get("view") as TaskView) || "table";
  const [currentView, setCurrentView] = useState<TaskView>(
    ["table", "kanban", "calendar"].includes(initialView)
      ? initialView
      : "table"
  );

  useEffect(() => {
    const v = searchParams.get("view") as TaskView;
    if (v && ["table", "kanban", "calendar"].includes(v)) {
      setCurrentView(v);
    }
  }, [searchParams]);

  // Filters State
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    status: "ALL",
    priority: "ALL",
    assigneeId: "ALL",
    overdue: false,
  });

  // Dialogs State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>("BACKLOG");
  const [createDefaultDueDate, setCreateDefaultDueDate] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Queries & Data
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const currentWorkspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  const {
    project,
    isLoading: isProjectLoading,
    isError,
  } = useProject(currentWorkspace?.id, projectSlug);

  const {
    tasks,
    totalCount,
    isLoading: isTasksLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useTasks({
    workspaceId: currentWorkspace?.id,
    projectId: project?.id,
    filters,
  });

  const updateTaskMutation = useUpdateTask(currentWorkspace?.id, project?.id);
  const deleteTaskMutation = useDeleteTask(currentWorkspace?.id, project?.id);

  const isLoading = isWorkspacesLoading || isProjectLoading;
  const role = (currentWorkspace?.role || "MEMBER").toUpperCase() as WorkspaceRole;
  const canManage = role === "OWNER" || role === "ADMIN";

  const handleOpenCreateWithStatus = (status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateDefaultDueDate(undefined);
    setIsCreateOpen(true);
  };

  const handleOpenCreateWithDueDate = (dueDate: string) => {
    setCreateDefaultStatus("BACKLOG");
    setCreateDefaultDueDate(dueDate);
    setIsCreateOpen(true);
  };

  const handleOpenGenericCreate = () => {
    setCreateDefaultStatus("BACKLOG");
    setCreateDefaultDueDate(undefined);
    setIsCreateOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsEditOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      taskId,
      data: { status: newStatus },
      silent: false,
    });
  };

  const handlePriorityChange = (taskId: string, newPriority: TaskPriority) => {
    updateTaskMutation.mutate({
      taskId,
      data: { priority: newPriority },
      silent: false,
    });
  };

  const handleDeleteTask = (task: Task) => {
    deleteTaskMutation.mutate(task.id);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FolderKanban className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Project not found</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          The project you are looking for does not exist or you don't have access to it.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 text-xs cursor-pointer"
          onClick={() => router.push(`/dashboard/${workspaceSlug}`)}
        >
          Back to Workspace Overview
        </Button>
      </div>
    );
  }

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim().length > 0) ||
      (filters.status && filters.status !== "ALL") ||
      (filters.priority && filters.priority !== "ALL") ||
      (filters.assigneeId && filters.assigneeId !== "ALL") ||
      filters.overdue
  );

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto py-2 px-1 sm:px-2">
      {/* Project Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3.5">
          <ProjectAvatar
            name={project.name}
            image={project.logo}
            className="size-12 rounded-xl border border-border shadow-xs"
            fallbackClassName="text-sm font-bold"
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                Project
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link
                href={`/dashboard/${workspaceSlug}`}
                className="font-medium hover:underline text-foreground"
              >
                {currentWorkspace?.name}
              </Link>
              <ChevronRight className="size-3 opacity-60" />
              <span>{project.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View Selector Tabs */}
          <ViewSelector
            currentView={currentView}
            onViewChange={setCurrentView}
          />

          {/* Project Settings Link */}
          {canManage && (
            <Link
              href={`/dashboard/${workspaceSlug}/projects/${project.slug}/settings`}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 flex items-center gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
                title="Project Settings"
              >
                <Settings className="size-3.5" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <TaskFilterBar
        workspaceId={currentWorkspace!.id}
        filters={filters}
        onFiltersChange={setFilters}
        onOpenCreateDialog={handleOpenGenericCreate}
        totalCount={totalCount}
      />

      {/* Main View Area */}
      <div className="mt-1">
        {currentView === "table" && (
          <TaskTableView
            tasks={tasks}
            isLoading={isTasksLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onFetchNextPage={fetchNextPage}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onDeleteClick={handleDeleteTask}
            onOpenCreateDialog={handleOpenGenericCreate}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {currentView === "kanban" && (
          <TaskKanbanView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
            onOpenCreateWithStatus={handleOpenCreateWithStatus}
          />
        )}

        {currentView === "calendar" && (
          <TaskCalendarView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onOpenCreateWithDueDate={handleOpenCreateWithDueDate}
          />
        )}
      </div>

      {/* Dialogs */}
      {currentWorkspace && project && (
        <>
          <CreateTaskDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            workspaceId={currentWorkspace.id}
            projectId={project.id}
            defaultStatus={createDefaultStatus}
            defaultDueDate={createDefaultDueDate}
          />

          <EditTaskDialog
            task={editingTask}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            workspaceId={currentWorkspace.id}
            projectId={project.id}
            userRole={role}
            currentUserId={user?.id}
          />
        </>
      )}
    </div>
  );
}

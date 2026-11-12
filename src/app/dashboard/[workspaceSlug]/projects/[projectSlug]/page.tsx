"use client";

import React, { use, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  FolderKanban,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProject } from "@/features/projects/hooks/use-project";
import { useProjectRoom } from "@/features/projects/hooks/use-project-room";
import { useAuth } from "@/features/auth/context/auth-context";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceRole } from "@/features/workspace/types";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskFilters,
  TaskView,
} from "@/features/tasks/types";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { useUpdateTask } from "@/features/tasks/hooks/use-update-task";
import { useDeleteTask } from "@/features/tasks/hooks/use-delete-task";
import { useTaskRealtimeSync } from "@/features/tasks/hooks/use-task-realtime-sync";
import { ViewSelector } from "@/features/tasks/components/view-selector";
import { TaskFilterBar } from "@/features/tasks/components/task-filter-bar";
import { TaskTableView } from "@/features/tasks/components/task-table-view";
import { TourSpotlightWrapper } from "@/features/simulation/components/tour-spotlight-wrapper";

const TaskKanbanView = dynamic(
  () =>
    import("@/features/tasks/components/task-kanban-view").then(
      (mod) => mod.TaskKanbanView
    ),
  { ssr: false }
);

const TaskCalendarView = dynamic(
  () =>
    import("@/features/tasks/components/task-calendar-view").then(
      (mod) => mod.TaskCalendarView
    ),
  { ssr: false }
);

const CreateTaskDialog = dynamic(
  () =>
    import("@/features/tasks/components/create-task-dialog").then(
      (mod) => mod.CreateTaskDialog
    ),
  { ssr: false }
);

const EditTaskDialog = dynamic(
  () =>
    import("@/features/tasks/components/edit-task-dialog").then(
      (mod) => mod.EditTaskDialog
    ),
  { ssr: false }
);

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

  // Derive active view directly from ?view= URL query so tabs, deep links, and tours stay single-sourced
  const paramView = searchParams.get("view") as TaskView | null;
  const currentView: TaskView =
    paramView && ["table", "kanban", "calendar"].includes(paramView)
      ? paramView
      : "table";

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

  // Real-time synchronization & active room presence
  useTaskRealtimeSync({
    workspaceId: currentWorkspace?.id,
    projectId: project?.id,
  });
  const { onlineUsers, isConnected: isWsConnected } = useProjectRoom(project?.id);

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
        <h1 className="text-xl font-bold text-foreground">Project not found</h1>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          The project you are looking for does not exist or you don&apos;t have access to it.
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
    <div className="flex flex-col gap-4 w-full max-w-[1600px] mx-auto py-1 px-1 sm:px-2">
      {/* Project Header Banner */}
      <TourSpotlightWrapper id="project-header">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <ProjectAvatar
              name={project.name}
              image={project.logo}
              className="size-10 rounded-lg border border-border/50 shadow-2xs shrink-0"
              fallbackClassName="text-xs font-semibold"
            />
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">
                  {project.name}
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-medium tracking-wider rounded-md px-1.5 py-0 h-5 text-muted-foreground border-border/70"
                >
                  Project
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Link
                  href={`/dashboard/${workspaceSlug}`}
                  className="font-medium hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {currentWorkspace?.name}
                </Link>
                <ChevronRight className="size-3 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="truncate">{project.name}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Live Presence / WebSocket Status */}
            {isWsConnected && (
              <div
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium tabular-nums"
                title={`${onlineUsers.length} collaborator${onlineUsers.length === 1 ? "" : "s"} currently online`}
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="hidden sm:inline whitespace-nowrap">
                  {onlineUsers.length > 0
                    ? `${onlineUsers.length} online`
                    : "Live"}
                </span>
              </div>
            )}

            {/* View Selector Tabs */}
            <ViewSelector
              currentView={currentView}
              onViewChange={() => {}}
            />

            {/* Project Settings Link */}
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    href={`/dashboard/${workspaceSlug}/projects/${project.slug}/settings`}
                  />
                }
                className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-lg"
                aria-label="Project Settings"
              >
                <Settings className="size-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            )}
          </div>
        </div>
      </TourSpotlightWrapper>

      {/* Filter Toolbar */}
      <TourSpotlightWrapper id="task-filter-bar">
        <TaskFilterBar
          workspaceId={currentWorkspace!.id}
          filters={filters}
          onFiltersChange={setFilters}
          onOpenCreateDialog={handleOpenGenericCreate}
          totalCount={totalCount}
        />
      </TourSpotlightWrapper>

      {/* Main View Area */}
      <div
        id={`view-panel-${currentView}`}
        role="tabpanel"
        aria-labelledby={`view-tab-${currentView}`}
        tabIndex={0}
        className="mt-1 outline-none focus-visible:outline-2 focus-visible:outline-ring rounded-xl"
      >
        {currentView === "table" && (
          <TourSpotlightWrapper id="task-table-view">
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
          </TourSpotlightWrapper>
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
          <TourSpotlightWrapper id="task-calendar-view">
            <TaskCalendarView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onOpenCreateWithDueDate={handleOpenCreateWithDueDate}
            />
          </TourSpotlightWrapper>
        )}
      </div>

      {/* Dialogs */}
      {currentWorkspace && project && (
        <>
          {isCreateOpen && (
            <CreateTaskDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              workspaceId={currentWorkspace.id}
              projectId={project.id}
              defaultStatus={createDefaultStatus}
              defaultDueDate={createDefaultDueDate}
            />
          )}

          {editingTask && (
            <EditTaskDialog
              task={editingTask}
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              workspaceId={currentWorkspace.id}
              projectId={project.id}
              userRole={role}
              currentUserId={user?.id}
            />
          )}
        </>
      )}
    </div>
  );
}

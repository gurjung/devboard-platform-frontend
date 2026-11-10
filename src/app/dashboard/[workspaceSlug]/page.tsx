"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2,
  Settings,
  Users,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useWorkspaceStats } from "@/features/workspace/hooks/use-workspace-stats";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-members";
import { WorkspaceStatsRow } from "@/features/workspace/components/overview/workspace-stats-row";
import { TourSpotlightWrapper } from "@/features/simulation/components/tour-spotlight-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceRole } from "@/features/workspace/constants";
import type { WorkspaceRole as WorkspaceRoleType } from "@/features/workspace/types";
import type { Project } from "@/features/projects/types";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskAssigneeAvatar } from "@/features/tasks/components/task-assignee-avatar";
import { EditTaskDialog } from "@/features/tasks/components/edit-task-dialog";
import { getShortTaskKey } from "@/features/tasks/constants";
import type { Task } from "@/features/tasks/types";
import { useAuth } from "@/features/auth/context/auth-context";
import { en } from "@/locales/en";
import { cn } from "@/lib/utils";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const { user } = useAuth();

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  const workspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  const { data: statsData, isLoading: isStatsLoading } = useWorkspaceStats(
    workspace?.id
  );

  const { data: members = [] } = useWorkspaceMembers(
    workspace?.id || ""
  );

  if (isWorkspacesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h1 className="text-xl font-bold text-foreground">Workspace not found</h1>
        <p className="text-xs text-muted-foreground mt-1">
          The requested workspace could not be found.
        </p>
      </div>
    );
  }

  const role = workspace.role?.toUpperCase();
  const canManage = role === WorkspaceRole.OWNER || role === WorkspaceRole.ADMIN;

  const stats = {
    totalProjects:
      statsData?.totalProjects ??
      statsData?.counts?.totalProjects ??
      statsData?.projectsCount ??
      0,
    totalTasks:
      statsData?.totalTasks ??
      statsData?.counts?.totalTasks ??
      statsData?.tasksCount ??
      0,
    myAssignedTasks:
      statsData?.myAssignedTasks ??
      statsData?.counts?.assignedTasks ??
      statsData?.assignedTasksCount ??
      0,
    completedTasks:
      statsData?.completedTasks ??
      statsData?.counts?.completedTasks ??
      statsData?.completedTasksCount ??
      0,
    overdueTasks:
      statsData?.overdueTasks ??
      statsData?.counts?.overdueTasks ??
      statsData?.overdueTasksCount ??
      0,
  };

  const recentTasks: Task[] = statsData?.recentTasks || [];
  const projectsList = statsData?.projects || [];

  return (
    <div className="flex flex-col gap-6 pb-8 w-full max-w-[1600px] mx-auto py-1">
      {/* Workspace Header */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar className="size-11 rounded-xl ring-1 ring-border/70 shrink-0">
            {workspace.logo ? (
              <AvatarImage
                src={workspace.logo}
                alt={workspace.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="text-sm font-semibold rounded-xl bg-primary/15 text-brand-text border border-primary/20">
              {workspace.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl truncate">
                {workspace.name}
              </h1>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/70 uppercase tracking-wider shrink-0">
                {role || "MEMBER"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Workspace overview, projects, metrics, and team collaboration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/dashboard/${workspaceSlug}/members`} />}
            className="gap-1.5 rounded-lg h-8 text-xs font-medium"
          >
            <Users className="size-3.5" />
            <span>Members</span>
          </Button>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/dashboard/${workspaceSlug}/settings`} />}
              className="gap-1.5 rounded-lg h-8 text-xs font-medium"
            >
              <Settings className="size-3.5" />
              <span>Settings</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <section aria-label="Workspace Statistics">
        <TourSpotlightWrapper id="workspace-stats">
          {isStatsLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <WorkspaceStatsRow workspaceSlug={workspaceSlug} stats={stats} />
          )}
        </TourSpotlightWrapper>
      </section>

      {/* Main Content Grid: Recent Tasks & Projects / Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 cols wide): Recent Tasks */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="rounded-xl border border-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="size-4 text-brand-text" aria-hidden="true" />
                    <span>Recent Tasks</span>
                  </h2>
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest activity and task updates across your workspace.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={`/dashboard/${workspaceSlug}/my-tasks`} />}
                className="text-xs gap-1 h-7.5 rounded-lg"
              >
                <span>My Tasks</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentTasks.length > 0 ? (
                <div
                  tabIndex={0}
                  role="region"
                  aria-label="Recent tasks"
                  className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2"
                >
                  <table className="w-full min-w-[640px] text-left text-xs border-separate border-spacing-0">
                    <caption className="sr-only">
                      Recent task updates across workspace projects
                    </caption>
                    <thead className="bg-muted/50 text-muted-foreground font-medium select-none">
                      <tr>
                        <th
                          scope="col"
                          className="py-2 px-3.5 w-32 border-y border-border/50 font-medium"
                        >
                          {en.tasks.tableHeaders.status}
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-3.5 min-w-[200px] border-y border-border/50 font-medium"
                        >
                          {en.tasks.tableHeaders.task}
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-3.5 w-36 border-y border-border/50 font-medium"
                        >
                          Project
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-3.5 w-28 border-y border-border/50 font-medium"
                        >
                          {en.tasks.tableHeaders.priority}
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-3.5 w-32 border-y border-border/50 font-medium"
                        >
                          {en.tasks.tableHeaders.dueDate}
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-3.5 w-36 border-y border-border/50 font-medium"
                        >
                          {en.tasks.tableHeaders.assignee}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child_td]:border-b-0">
                      {recentTasks.map((task) => {
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
                            onClick={() => setSelectedTask(task)}
                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                          >
                            {/* Status */}
                            <td className="py-2.5 px-3.5 border-b border-border/40">
                              <TaskStatusBadge
                                status={task.status}
                                size="sm"
                              />
                            </td>

                            {/* Task Title */}
                            <td className="py-2.5 px-3.5 max-w-xs border-b border-border/40">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-[10px] font-medium text-muted-foreground tabular-nums shrink-0">
                                  {getShortTaskKey(task.id)}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task);
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
                            </td>

                            {/* Project */}
                            <td className="py-2.5 px-3.5 border-b border-border/40">
                              {task.project ? (
                                <Link
                                  href={`/dashboard/${workspaceSlug}/projects/${task.project.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-text transition-colors truncate max-w-[140px]"
                                  title={task.project.name}
                                >
                                  <FolderKanban className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                  <span className="truncate">{task.project.name}</span>
                                </Link>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">—</span>
                              )}
                            </td>

                            {/* Priority */}
                            <td className="py-2.5 px-3.5 border-b border-border/40">
                              <TaskPriorityBadge
                                priority={task.priority}
                                size="sm"
                              />
                            </td>

                            {/* Due Date */}
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
                                  {isOverdue && (
                                    <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                                  )}
                                  <span>{formattedDate}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">—</span>
                              )}
                            </td>

                            {/* Assignee */}
                            <td className="py-2.5 px-3.5 border-b border-border/40">
                              <TaskAssigneeAvatar
                                assignee={task.assignee}
                                size="sm"
                                showName
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground p-6">
                  <CheckCircle2 className="size-8 text-muted-foreground mb-2" aria-hidden="true" />
                  <p className="text-xs font-medium text-foreground">No tasks created yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Create tasks within your projects to see recent activity here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Projects & Team Members */}
        <div className="space-y-5">
          {/* Projects Card */}
          <Card className="rounded-xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <FolderKanban className="size-4 text-brand-text" aria-hidden="true" />
                    <span>Projects</span>
                  </h2>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active projects in this workspace.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-[11px] rounded-md px-2 py-0.5 border-border/70 tabular-nums"
              >
                {projectsList.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {projectsList.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {projectsList.map((p: Project & { _count?: { tasks?: number } }) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/${workspaceSlug}/projects/${p.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-input hover:border-border hover:bg-muted/35 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-md bg-primary/10 text-brand-text flex items-center justify-center text-xs font-semibold shrink-0 border border-primary/15">
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-foreground group-hover:text-brand-text transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {p._count?.tasks ?? 0} tasks
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No projects created yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team Members & Avatar Stack Card */}
          <Card className="rounded-xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="size-4 text-brand-text" aria-hidden="true" />
                    <span>Team Members</span>
                  </h2>
                </CardTitle>
                <CardDescription className="text-xs">
                  Collaborators in {workspace.name}.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={`/dashboard/${workspaceSlug}/members`} />}
                className="text-xs gap-1 h-7 rounded-lg"
              >
                <span>View All</span>
                <ArrowRight className="size-3" />
              </Button>
            </CardHeader>
            <CardContent>
              {/* Avatar Stack */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex -space-x-2 overflow-hidden">
                  {members.slice(0, 5).map((m) => {
                    const name = m.user?.name || m.user?.email || "User";
                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <Avatar
                        key={m.id}
                        size="sm"
                        className="inline-block ring-2 ring-background size-8"
                        title={`${name} (${m.role})`}
                      >
                        {m.user?.image && (
                          <AvatarImage src={m.user.image} alt={name} />
                        )}
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-brand-text">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {members.length > 5 && (
                    <div className="flex items-center justify-center size-8 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-background tabular-nums">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground tabular-nums">
                    {members.length}
                  </span>{" "}
                  {members.length === 1 ? "member" : "members"} collaborating
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskDialog
          task={selectedTask}
          open={Boolean(selectedTask)}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          workspaceId={workspace.id}
          projectId={selectedTask.projectId || selectedTask.project?.id || ""}
          userRole={workspace.role as WorkspaceRoleType}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

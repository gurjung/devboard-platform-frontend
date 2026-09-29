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
  Plus,
  Calendar as CalendarIcon,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useWorkspaceStats } from "@/features/workspace/hooks/use-workspace-stats";
import { useWorkspaceMembers } from "@/features/workspace/hooks/use-workspace-members";
import { WorkspaceStatsRow } from "@/features/workspace/components/overview/workspace-stats-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceRole } from "@/features/workspace/constants";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskAssigneeAvatar } from "@/features/tasks/components/task-assignee-avatar";
import { EditTaskDialog } from "@/features/tasks/components/edit-task-dialog";
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

  const { data: members = [], isLoading: isMembersLoading } = useWorkspaceMembers(
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
        <h2 className="text-xl font-bold text-foreground">Workspace not found</h2>
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
    <div className="flex flex-col gap-6 sm:gap-8 pb-10 w-full max-w-[1600px] mx-auto py-1">
      {/* Workspace Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 rounded-2xl ring-1 ring-border/50">
            {workspace.logo ? (
              <AvatarImage
                src={workspace.logo}
                alt={workspace.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="text-lg font-bold rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
              {workspace.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {workspace.name}
              </h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                {role || "MEMBER"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Workspace overview, projects, metrics, and team collaboration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/dashboard/${workspaceSlug}/members`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer rounded-xl h-9"
            >
              <Users className="size-4" />
              <span>Members</span>
            </Button>
          </Link>
          {canManage && (
            <Link href={`/dashboard/${workspaceSlug}/settings`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 cursor-pointer rounded-xl h-9"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <section aria-label="Workspace Statistics">
        {isStatsLoading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <WorkspaceStatsRow workspaceSlug={workspaceSlug} stats={stats} />
        )}
      </section>

      {/* Main Content Grid: Recent Tasks & Projects / Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide): Recent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span>Recent Tasks</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest activity and task updates across your workspace.
                </CardDescription>
              </div>
              <Link href={`/dashboard/${workspaceSlug}/my-tasks`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 h-8 rounded-xl cursor-pointer"
                >
                  <span>My Tasks</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-y border-border/60 text-muted-foreground font-semibold select-none">
                      <tr>
                        <th className="py-2.5 px-3.5 w-32">{en.tasks.tableHeaders.status}</th>
                        <th className="py-2.5 px-3.5 min-w-[180px]">{en.tasks.tableHeaders.task}</th>
                        <th className="py-2.5 px-3.5 w-36">Project</th>
                        <th className="py-2.5 px-3.5 w-28">{en.tasks.tableHeaders.priority}</th>
                        <th className="py-2.5 px-3.5 w-32">{en.tasks.tableHeaders.dueDate}</th>
                        <th className="py-2.5 px-3.5 w-36">{en.tasks.tableHeaders.assignee}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
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
                            <td className="py-2.5 px-3.5">
                              <TaskStatusBadge
                                status={task.status}
                                size="sm"
                              />
                            </td>

                            {/* Task Title */}
                            <td className="py-2.5 px-3.5 max-w-xs">
                              <span
                                className={cn(
                                  "font-semibold text-foreground text-xs line-clamp-1 truncate block group-hover:text-primary transition-colors",
                                  task.status === "DONE" &&
                                    "line-through text-muted-foreground"
                                )}
                                title={task.title}
                              >
                                {task.title}
                              </span>
                            </td>

                            {/* Project */}
                            <td className="py-2.5 px-3.5">
                              {task.project ? (
                                <Link
                                  href={`/dashboard/${workspaceSlug}/projects/${task.project.slug}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-[140px]"
                                  title={task.project.name}
                                >
                                  <FolderKanban className="size-3.5 shrink-0 opacity-60" />
                                  <span className="truncate">{task.project.name}</span>
                                </Link>
                              ) : (
                                <span className="text-muted-foreground/60 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Priority */}
                            <td className="py-2.5 px-3.5">
                              <TaskPriorityBadge
                                priority={task.priority}
                                size="sm"
                              />
                            </td>

                            {/* Due Date */}
                            <td className="py-2.5 px-3.5">
                              {formattedDate ? (
                                <div
                                  className={cn(
                                    "inline-flex items-center gap-1.5 text-xs font-medium",
                                    isOverdue
                                      ? "text-rose-600 dark:text-rose-400 font-semibold"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {isOverdue && (
                                    <AlertCircle className="size-3.5 text-rose-500 shrink-0" />
                                  )}
                                  <span>{formattedDate}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/60 text-[11px]">—</span>
                              )}
                            </td>

                            {/* Assignee */}
                            <td className="py-2.5 px-3.5">
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
                  <CheckCircle2 className="size-8 opacity-40 mb-2" />
                  <p className="text-xs font-medium">No tasks created yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Create tasks within your projects to see recent activity here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Projects & Team Members */}
        <div className="space-y-6">
          {/* Projects Card */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FolderKanban className="size-4 text-primary" />
                  <span>Projects</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active projects in this workspace.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px]">
                {projectsList.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {projectsList.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {projectsList.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/${workspaceSlug}/projects/${p.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 hover:border-border hover:bg-muted/30 transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {p._count?.tasks ?? 0} tasks
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
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
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <span>Team Members</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Collaborators in {workspace.name}.
                </CardDescription>
              </div>
              <Link href={`/dashboard/${workspaceSlug}/members`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 h-7 rounded-lg cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="size-3" />
                </Button>
              </Link>
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
                        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {members.length > 5 && (
                    <div className="flex items-center justify-center size-8 rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-background">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
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
          userRole={workspace.role as any}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
}

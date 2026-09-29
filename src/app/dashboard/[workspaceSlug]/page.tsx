"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, Settings, Users, ArrowRight } from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useWorkspaceStats } from "@/features/workspace/hooks/use-workspace-stats";
import { WorkspaceStatsRow } from "@/features/workspace/components/overview/workspace-stats-row";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceRole } from "@/features/workspace/constants";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  const workspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  const { data: statsData, isLoading: isStatsLoading } = useWorkspaceStats(
    workspace?.id
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
    totalProjects: statsData?.totalProjects ?? statsData?.projectsCount ?? 0,
    totalTasks: statsData?.totalTasks ?? statsData?.tasksCount ?? 0,
    myAssignedTasks: statsData?.myAssignedTasks ?? statsData?.assignedTasksCount ?? 0,
    completedTasks: statsData?.completedTasks ?? statsData?.completedTasksCount ?? 0,
    overdueTasks: statsData?.overdueTasks ?? statsData?.overdueTasksCount ?? 0,
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 rounded-2xl ring-1 ring-border/50">
            {workspace.logo ? (
              <AvatarImage src={workspace.logo} alt={workspace.name} className="object-cover" />
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
            <Button variant="outline" size="sm" className="gap-2 cursor-pointer rounded-xl h-9">
              <Users className="size-4" />
              Members
            </Button>
          </Link>
          {canManage && (
            <Link href={`/dashboard/${workspaceSlug}/settings`}>
              <Button variant="outline" size="sm" className="gap-2 cursor-pointer rounded-xl h-9">
                <Settings className="size-4" />
                Settings
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

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Team Members</span>
              <Users className="size-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription className="text-xs">
              Collaborate and manage team permissions in this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/${workspaceSlug}/members`}>
              <Button variant="secondary" size="sm" className="w-full justify-between cursor-pointer rounded-xl">
                <span>View and Manage Members</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Workspace Settings</span>
              <Settings className="size-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription className="text-xs">
              Manage workspace identity, logo, and administrative controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/${workspaceSlug}/settings`}>
              <Button variant="secondary" size="sm" className="w-full justify-between cursor-pointer rounded-xl">
                <span>Configure Settings</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

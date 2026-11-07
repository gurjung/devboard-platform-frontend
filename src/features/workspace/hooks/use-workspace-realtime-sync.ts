"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useSocket } from "@/components/providers/socket-provider";
import { useAuth } from "@/features/auth/context/auth-context";

interface UseWorkspaceRealtimeSyncProps {
  workspaceId?: string;
  workspaceSlug?: string;
}

export function useWorkspaceRealtimeSync({
  workspaceId,
  workspaceSlug,
}: UseWorkspaceRealtimeSyncProps) {
  const { socket, joinWorkspace, leaveWorkspace } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!socket || !workspaceId) return;

    // Join workspace room
    joinWorkspace(workspaceId);

    // 1. Project Created Listener
    const handleProjectCreated = ({
      project,
      actorId,
    }: {
      project: any;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });

      if (actorId !== user?.id) {
        toast.info(`New project created: "${project.name}"`);
      }
    };

    // 2. Project Updated Listener
    const handleProjectUpdated = ({
      project,
      actorId,
    }: {
      project: any;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["project", workspaceId] });

      if (actorId !== user?.id && pathname.includes(project.slug)) {
        toast.info(`Project "${project.name}" settings updated`);
      }
    };

    // 3. Project Deleted Listener
    const handleProjectDeleted = ({
      projectId,
      actorId,
    }: {
      projectId: string;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });

      // If user is currently inside the deleted project, redirect them to workspace root
      if (pathname.includes("/projects/")) {
        toast.warning("The current project was deleted by an administrator.");
        router.push(workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard");
      }
    };

    // 4. Member Updated Listener (Role promotion/demotion)
    const handleMemberUpdated = ({
      member,
      actorId,
    }: {
      member: any;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });

      if (member.userId === user?.id && actorId !== user?.id) {
        toast.info(`Your role was updated to ${member.role}`);
      }
    };

    // 5. Member Removed Listener
    const handleMemberRemoved = ({
      memberId,
      actorId,
    }: {
      memberId: string;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      if (memberId === user?.id) {
        toast.error("You have been removed from this workspace.");
        router.push("/dashboard");
      }
    };

    // 6. Workspace Updated Listener
    const handleWorkspaceUpdated = ({
      workspace,
      actorId,
    }: {
      workspace: any;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });

      if (actorId !== user?.id) {
        toast.info(`Workspace updated: "${workspace.name}"`);
      }
    };

    // 7. Workspace Deleted Listener
    const handleWorkspaceDeleted = ({
      workspaceId: deletedWorkspaceId,
    }: {
      workspaceId: string;
      actorId: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      if (deletedWorkspaceId === workspaceId) {
        toast.warning("This workspace was deleted.");
        router.push("/dashboard");
      }
    };

    // 8. Reconnect Catch-up
    const handleReconnect = () => {
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-stats", workspaceId] });
    };

    socket.on("project:created", handleProjectCreated);
    socket.on("project:updated", handleProjectUpdated);
    socket.on("project:deleted", handleProjectDeleted);
    socket.on("member:updated", handleMemberUpdated);
    socket.on("member:removed", handleMemberRemoved);
    socket.on("workspace:updated", handleWorkspaceUpdated);
    socket.on("workspace:deleted", handleWorkspaceDeleted);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("project:created", handleProjectCreated);
      socket.off("project:updated", handleProjectUpdated);
      socket.off("project:deleted", handleProjectDeleted);
      socket.off("member:updated", handleMemberUpdated);
      socket.off("member:removed", handleMemberRemoved);
      socket.off("workspace:updated", handleWorkspaceUpdated);
      socket.off("workspace:deleted", handleWorkspaceDeleted);
      socket.off("connect", handleReconnect);
      leaveWorkspace(workspaceId);
    };
  }, [
    socket,
    workspaceId,
    workspaceSlug,
    user?.id,
    pathname,
    queryClient,
    router,
    joinWorkspace,
    leaveWorkspace,
  ]);
}


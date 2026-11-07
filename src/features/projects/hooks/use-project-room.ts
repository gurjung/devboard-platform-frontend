"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import type { PresenceUser } from "@/lib/socket";

export function useProjectRoom(projectId: string | undefined) {
  const { socket, isConnected, joinProject, leaveProject } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!projectId || !socket) return;

    joinProject(projectId);

    const handlePresence = (data: { projectId: string; users: PresenceUser[] }) => {
      if (data.projectId === projectId) {
        setOnlineUsers(data.users || []);
      }
    };

    socket.on("project:presence", handlePresence);

    return () => {
      socket.off("project:presence", handlePresence);
      leaveProject(projectId);
      setOnlineUsers([]);
    };
  }, [projectId, socket, joinProject, leaveProject]);

  return {
    isConnected,
    onlineUsers,
  };
}


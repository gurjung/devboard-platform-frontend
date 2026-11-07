"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSocket,
  disconnectSocket,
  type TypedSocket,
} from "@/lib/socket";
import { useAuth } from "@/features/auth/context/auth-context";
import { isDemoMode } from "@/features/simulation/mock-demo-data";
import type { NotificationsResponse } from "@/features/notifications/types";

interface SocketContextType {
  socket: TypedSocket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: (workspaceId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinProject: () => {},
  leaveProject: () => {},
  joinWorkspace: () => {},
  leaveWorkspace: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const activeRoomsRef = useRef<{
    projects: Set<string>;
    workspaces: Set<string>;
  }>({
    projects: new Set(),
    workspaces: new Set(),
  });

  useEffect(() => {
    // If not authenticated or in simulation demo mode without real backend, don't connect
    if (!isAuthenticated || !user || isDemoMode()) {
      setIsConnected(false);
      disconnectSocket();
      setSocket(null);
      return;
    }

    const s = getSocket();
    setSocket(s);

    const handleConnect = () => {
      setIsConnected(true);

      // Re-join any previously tracked active rooms on reconnect
      activeRoomsRef.current.projects.forEach((projectId) => {
        s.emit("join:project", { projectId });
      });
      activeRoomsRef.current.workspaces.forEach((workspaceId) => {
        s.emit("join:workspace", { workspaceId });
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleTaskAssigned = ({
      task,
      assignedBy,
    }: {
      task: any;
      assignedBy: { userId: string; email: string };
    }) => {
      // Invalidate personal assigned task queries
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    };

    const handleNewNotification = ({
      notification,
    }: {
      notification: any;
    }) => {
      // Invalidate personal task list if task event
      if (
        notification.type === "TASK_ASSIGNED" ||
        notification.type === "TASK_STATUS_CHANGED"
      ) {
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      }

      // Prepend to TanStack Query notifications cache
      queryClient.setQueriesData<NotificationsResponse>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old) return old;
          if (old.notifications.some((n) => n.id === notification.id)) return old;

          return {
            ...old,
            unreadCount: (old.unreadCount || 0) + 1,
            totalCount: (old.totalCount || 0) + 1,
            notifications: [notification, ...old.notifications],
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
        refetchType: "none",
      });

      // Show actionable toast
      toast.info(notification.title, {
        description: notification.message,
        action: notification.link
          ? {
              label: "View",
              onClick: () => router.push(notification.link!),
            }
          : undefined,
      });
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("task:assigned", handleTaskAssigned);
    s.on("notification:new", handleNewNotification);

    if (!s.connected) {
      s.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("task:assigned", handleTaskAssigned);
      s.off("notification:new", handleNewNotification);
    };
  }, [isAuthenticated, user, queryClient, router]);

  const joinProject = useCallback(
    (projectId: string) => {
      if (!projectId) return;
      activeRoomsRef.current.projects.add(projectId);
      if (socket && socket.connected) {
        socket.emit("join:project", { projectId });
      }
    },
    [socket]
  );

  const leaveProject = useCallback(
    (projectId: string) => {
      if (!projectId) return;
      activeRoomsRef.current.projects.delete(projectId);
      if (socket && socket.connected) {
        socket.emit("leave:project", { projectId });
      }
    },
    [socket]
  );

  const joinWorkspace = useCallback(
    (workspaceId: string) => {
      if (!workspaceId) return;
      activeRoomsRef.current.workspaces.add(workspaceId);
      if (socket && socket.connected) {
        socket.emit("join:workspace", { workspaceId });
      }
    },
    [socket]
  );

  const leaveWorkspace = useCallback(
    (workspaceId: string) => {
      if (!workspaceId) return;
      activeRoomsRef.current.workspaces.delete(workspaceId);
      if (socket && socket.connected) {
        socket.emit("leave:workspace", { workspaceId });
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinProject,
        leaveProject,
        joinWorkspace,
        leaveWorkspace,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);


"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  getSocket,
  disconnectSocket,
  type TypedSocket,
} from "@/lib/socket";
import { useAuth } from "@/features/auth/context/auth-context";
import { isDemoMode } from "@/features/simulation/mock-demo-data";

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
  const { isAuthenticated, user } = useAuth();
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

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);

    if (!s.connected) {
      s.connect();
    } else {
      setIsConnected(true);
    }

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
    };
  }, [isAuthenticated, user]);

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


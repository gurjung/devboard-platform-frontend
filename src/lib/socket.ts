import { io, Socket } from "socket.io-client";
import { getAccessToken, refreshAuthToken } from "./api-client";
import type { Task } from "@/features/tasks/types";

export interface PresenceUser {
  userId: string;
  name: string;
  email: string;
}

export interface ServerToClientEvents {
  "task:created": (data: { task: Task; actorId: string }) => void;
  "task:updated": (data: { task: Task; actorId: string }) => void;
  "task:deleted": (data: { taskId: string; actorId: string }) => void;
  "project:presence": (data: { projectId: string; users: PresenceUser[] }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  "join:project": (data: { projectId: string }) => void;
  "leave:project": (data: { projectId: string }) => void;
  "join:workspace": (data: { workspaceId: string }) => void;
  "leave:workspace": (data: { workspaceId: string }) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;
let isRefreshingAuth = false;

export const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  return "https://devboard-platform-backend.onrender.com";
};

export const getSocket = (): TypedSocket => {
  if (typeof window === "undefined") {
    // Return dummy or throw on server-side
    return null as unknown as TypedSocket;
  }

  if (!socketInstance) {
    const wsUrl = getSocketUrl();

    socketInstance = io(wsUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: (cb) => {
        const token = getAccessToken();
        cb({ token });
      },
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Auto-refresh token on auth error
    socketInstance.on("connect_error", async (err) => {
      const isAuthErr =
        err.message.includes("Authentication error") ||
        err.message.includes("Unauthorized") ||
        err.message.includes("jwt");

      if (isAuthErr && !isRefreshingAuth) {
        isRefreshingAuth = true;
        try {
          const newToken = await refreshAuthToken();
          if (newToken && socketInstance) {
            socketInstance.auth = { token: newToken };
            socketInstance.connect();
          }
        } catch (refreshErr) {
          console.warn("WebSocket re-authentication failed:", refreshErr);
        } finally {
          isRefreshingAuth = false;
        }
      }
    });
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};


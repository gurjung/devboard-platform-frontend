import type { Task, TasksResponse } from "../tasks/types";
import type { User } from "../auth/types";
import type { Workspace } from "../workspace/types";
import type { Project } from "../projects/types";

export const DEMO_USER: User = {
  id: "demo-user-1",
  name: "Alex Rivera (Demo Lead)",
  email: "alex.rivera@devboard.io",
  image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
};

export const DEMO_WORKSPACE: Workspace = {
  id: "ws-demo-corp",
  name: "DevBoard Core Engineering",
  slug: "devboard-engineering",
  role: "OWNER",
  logo: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_PROJECTS: Project[] = [
  {
    id: "proj-platform-core",
    name: "Platform Core Infrastructure",
    slug: "platform-core",
    workspaceId: "ws-demo-corp",
    createdById: "demo-user-1",
    logo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-mobile-app",
    name: "Mobile App Redesign",
    slug: "mobile-app",
    workspaceId: "ws-demo-corp",
    createdById: "demo-user-1",
    logo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEMO_MEMBERS = [
  {
    id: "member-1",
    userId: "demo-user-1",
    workspaceId: "ws-demo-corp",
    role: "OWNER",
    user: DEMO_USER,
  },
  {
    id: "member-2",
    userId: "user-2",
    workspaceId: "ws-demo-corp",
    role: "ADMIN",
    user: {
      id: "user-2",
      name: "Sarah Chen",
      email: "sarah.chen@devboard.io",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
  },
  {
    id: "member-3",
    userId: "user-3",
    workspaceId: "ws-demo-corp",
    role: "MEMBER",
    user: {
      id: "user-3",
      name: "Marcus Vance",
      email: "marcus.v@devboard.io",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
  },
];

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: "task-demo-1",
    title: "Configure SAML 2.0 Single Sign-On (SSO)",
    description: "Connect Okta and Azure Active Directory identity federation endpoints.",
    status: "TODO",
    priority: "URGENT",
    projectId: "proj-platform-core",
    assigneeId: "demo-user-1",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_USER,
  },
  {
    id: "task-demo-2",
    title: "Implement Redis In-Memory Cache Layer",
    description: "Cache frequently queried workspace metrics to minimize database scans.",
    status: "TODO",
    priority: "HIGH",
    projectId: "proj-platform-core",
    assigneeId: "user-2",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_MEMBERS[1].user,
  },
  {
    id: "task-demo-3",
    title: "Migrate to Tailwind CSS v4 OKLCH Palettes",
    description: "Align color spaces across dark and light themes for perceptual uniformity.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    projectId: "proj-platform-core",
    assigneeId: "demo-user-1",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_USER,
  },
  {
    id: "task-demo-4",
    title: "Refactor 401 Silent Token Refresh Concurrency Queue",
    description: "Pause parallel 401s during rotation and replay original requests.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    projectId: "proj-platform-core",
    assigneeId: "user-3",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_MEMBERS[2].user,
  },
  {
    id: "task-demo-5",
    title: "Drag-and-Drop Kanban Stage Transitions",
    description: "Support fluid dnd-kit column shifts with instant optimistic updates.",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    projectId: "proj-platform-core",
    assigneeId: "user-2",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_MEMBERS[1].user,
  },
  {
    id: "task-demo-6",
    title: "PostgreSQL Connection Pool Tuning",
    description: "Adjust max pool size and statement timeout for burst traffic tolerance.",
    status: "DONE",
    priority: "HIGH",
    projectId: "proj-platform-core",
    assigneeId: "demo-user-1",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_USER,
  },
  {
    id: "task-demo-7",
    title: "Automated Chaos Engineering Interceptor",
    description: "Inject 500, 429, 401, and offline faults for self-healing verification.",
    status: "DONE",
    priority: "URGENT",
    projectId: "proj-platform-core",
    assigneeId: "demo-user-1",
    createdById: "demo-user-1",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: DEMO_USER,
  },
];

let demoTasks: Task[] = [...INITIAL_DEMO_TASKS];
let isDemoActive = false;
const demoListeners = new Set<() => void>();

const DEMO_STORAGE_KEY = "devboard_simulation_demo_mode";

export const subscribeDemoMode = (onStoreChange: () => void): (() => void) => {
  demoListeners.add(onStoreChange);
  return () => {
    demoListeners.delete(onStoreChange);
  };
};

export const isDemoMode = (): boolean => {
  if (isDemoActive) return true;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored === "true") {
        isDemoActive = true;
        return true;
      }
    } catch {}
  }
  return false;
};

export const setDemoMode = (enabled: boolean): void => {
  isDemoActive = enabled;
  if (typeof window !== "undefined") {
    try {
      if (enabled) {
        localStorage.setItem(DEMO_STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(DEMO_STORAGE_KEY);
        demoTasks = [...INITIAL_DEMO_TASKS];
      }
    } catch {}
  }
  demoListeners.forEach((listener) => {
    try {
      listener();
    } catch {}
  });
};

export const getDemoTasks = (): Task[] => [...demoTasks];

export const updateDemoTask = (id: string, updates: Partial<Task>): Task | null => {
  const idx = demoTasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    demoTasks[idx] = {
      ...demoTasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return demoTasks[idx];
  }
  return null;
};

export const addDemoTask = (newTask: Partial<Task>): Task => {
  const id = newTask.id || `task-demo-${Date.now()}`;
  const existingIdx = demoTasks.findIndex((t) => t.id === id);
  const created: Task = {
    id,
    title: newTask.title || "New Sprint Deliverable",
    description: newTask.description || null,
    status: newTask.status || "TODO",
    priority: newTask.priority || "MEDIUM",
    projectId: newTask.projectId || "proj-platform-core",
    assigneeId: newTask.assigneeId || "demo-user-1",
    createdById: "demo-user-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: newTask.assignee || DEMO_USER,
  };
  if (existingIdx !== -1) {
    demoTasks[existingIdx] = created;
  } else {
    demoTasks.unshift(created);
  }
  return created;
};

export const deleteDemoTask = (id: string): boolean => {
  const beforeCount = demoTasks.length;
  demoTasks = demoTasks.filter((t) => t.id !== id);
  return demoTasks.length < beforeCount;
};

/**
 * Handles incoming client requests when demo mode is active
 */
export function handleDemoRequest<T>(
  endpoint: string,
  method = "GET",
  body?: unknown
): { handled: boolean; data?: T } {
  if (!isDemoMode()) {
    return { handled: false };
  }

  const cleanEndpoint = endpoint.split("?")[0];

  // Auth Endpoints
  if (cleanEndpoint.endsWith("/auth/me") || cleanEndpoint === "/auth/me") {
    return { handled: true, data: { user: DEMO_USER, data: DEMO_USER } as T };
  }

  // Workspaces List
  if (cleanEndpoint === "/workspaces" || cleanEndpoint.endsWith("/workspaces")) {
    if (method === "GET") {
      return { handled: true, data: [DEMO_WORKSPACE] as T };
    }
  }

  // Workspace and nested entity routes
  if (cleanEndpoint.includes("/workspaces")) {
    if (cleanEndpoint.endsWith("/members")) {
      return { handled: true, data: DEMO_MEMBERS as T };
    }

    if (cleanEndpoint.endsWith("/stats")) {
      const completed = demoTasks.filter((t) => t.status === "DONE").length;
      return {
        handled: true,
        data: {
          totalProjects: DEMO_PROJECTS.length,
          totalTasks: demoTasks.length,
          completedTasks: completed,
          myAssignedTasks: demoTasks.filter((t) => t.assigneeId === DEMO_USER.id).length,
          overdueTasks: 0,
        } as T,
      };
    }

    // Tasks inside project
    if (cleanEndpoint.includes("/tasks")) {
      const parts = cleanEndpoint.split("/tasks");
      const taskId = parts[1]?.replace(/^\/+/, "");

      if (taskId) {
        if (method === "PATCH") {
          const updated = updateDemoTask(taskId, (body as Partial<Task>) || {});
          return {
            handled: true,
            data: (updated || { id: taskId, ...((body as Partial<Task>) || {}) }) as T,
          };
        }
        if (method === "DELETE") {
          deleteDemoTask(taskId);
          return { handled: true, data: { id: taskId } as T };
        }
        const task = demoTasks.find((t) => t.id === taskId);
        return { handled: true, data: (task || demoTasks[0]) as T };
      }

      if (method === "POST") {
        const created = addDemoTask((body as Partial<Task>) || {});
        return { handled: true, data: created as T };
      }

      const response: TasksResponse = {
        tasks: [...demoTasks],
        totalCount: demoTasks.length,
        nextCursor: null,
        hasMore: false,
      };
      return { handled: true, data: response as T };
    }

    if (cleanEndpoint.endsWith("/projects")) {
      return { handled: true, data: DEMO_PROJECTS as T };
    }

    if (cleanEndpoint.includes("/projects/")) {
      const parts = cleanEndpoint.split("/projects/");
      const projectSlugOrId = parts[1]?.split("/")[0];
      const found = DEMO_PROJECTS.find((p) => p.slug === projectSlugOrId || p.id === projectSlugOrId);
      return { handled: true, data: (found || DEMO_PROJECTS[0]) as T };
    }

    return { handled: true, data: DEMO_WORKSPACE as T };
  }

  // Cross-project My Tasks
  if (cleanEndpoint.includes("/my-tasks")) {
    const myTasks = demoTasks.filter((t) => t.assigneeId === DEMO_USER.id);
    const response: TasksResponse = {
      tasks: myTasks,
      totalCount: myTasks.length,
      nextCursor: null,
      hasMore: false,
    };
    return { handled: true, data: response as T };
  }

  return { handled: false };
}

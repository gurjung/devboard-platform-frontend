import { isPast, isToday } from "date-fns";
import type { Task, TasksResponse } from "../tasks/types";
import type { User } from "../auth/types";
import type { Workspace, WorkspaceMember, WorkspaceRole } from "../workspace/types";
import type { Project } from "../projects/types";
import type { Notification, NotificationsResponse } from "../notifications/types";
import type {
  AcceptInviteResponse,
  InvitePreview,
  InviteRole,
  WorkspaceInvite,
} from "../invites/types";

export const DEMO_USER: User = {
  id: "demo-user-1",
  name: "Alex Rivera (Demo Lead)",
  email: "alex.rivera@devboard.io",
  image:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
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

export const DEMO_MEMBERS: WorkspaceMember[] = [
  {
    id: "member-1",
    userId: "demo-user-1",
    workspaceId: "ws-demo-corp",
    role: "OWNER",
    user: DEMO_USER,
    joinedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
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
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    },
    joinedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
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
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

const HOUR = 3600000;
const DAY = HOUR * 24;

function createInitialDemoTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: "task-demo-1",
      title: "Configure SAML 2.0 Single Sign-On (SSO)",
      description:
        "Connect Okta and Azure Active Directory identity federation endpoints.",
      status: "TODO",
      priority: "URGENT",
      dueDate: new Date(now + DAY * 2).toISOString(),
      projectId: "proj-platform-core",
      assigneeId: "demo-user-1",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 24).toISOString(),
      updatedAt: new Date(now - HOUR * 2).toISOString(),
      assignee: DEMO_USER,
    },
    {
      id: "task-demo-2",
      title: "Implement Redis In-Memory Cache Layer",
      description:
        "Cache frequently queried workspace metrics to minimize database scans.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(now - DAY * 2).toISOString(),
      projectId: "proj-platform-core",
      assigneeId: "user-2",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 18).toISOString(),
      updatedAt: new Date(now - HOUR * 5).toISOString(),
      assignee: DEMO_MEMBERS[1].user,
    },
    {
      id: "task-demo-3",
      title: "Migrate to Tailwind CSS v4 OKLCH Palettes",
      description:
        "Align color spaces across dark and light themes for perceptual uniformity.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(now + DAY * 4).toISOString(),
      projectId: "proj-platform-core",
      assigneeId: "demo-user-1",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 12).toISOString(),
      updatedAt: new Date(now - HOUR * 1).toISOString(),
      assignee: DEMO_USER,
    },
    {
      id: "task-demo-4",
      title: "Refactor 401 Silent Token Refresh Concurrency Queue",
      description:
        "Pause parallel 401s during rotation and replay original requests.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(now + DAY).toISOString(),
      projectId: "proj-platform-core",
      assigneeId: "user-3",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 8).toISOString(),
      updatedAt: new Date(now - HOUR * 3).toISOString(),
      assignee: DEMO_MEMBERS[2].user,
    },
    {
      id: "task-demo-5",
      title: "Drag-and-Drop Kanban Stage Transitions",
      description:
        "Support fluid dnd-kit column shifts with instant optimistic updates.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      dueDate: new Date(now - DAY).toISOString(),
      projectId: "proj-platform-core",
      assigneeId: "user-2",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 4).toISOString(),
      updatedAt: new Date(now - HOUR * 4).toISOString(),
      assignee: DEMO_MEMBERS[1].user,
    },
    {
      id: "task-demo-6",
      title: "PostgreSQL Connection Pool Tuning",
      description:
        "Adjust max pool size and statement timeout for burst traffic tolerance.",
      status: "DONE",
      priority: "HIGH",
      dueDate: new Date(now - DAY * 3).toISOString(),
      projectId: "proj-platform-core",
      assigneeId: "demo-user-1",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 48).toISOString(),
      updatedAt: new Date(now - HOUR * 10).toISOString(),
      assignee: DEMO_USER,
    },
    {
      id: "task-demo-7",
      title: "Automated Chaos Engineering Interceptor",
      description:
        "Inject 500, 429, 401, and offline faults for self-healing verification.",
      status: "DONE",
      priority: "URGENT",
      projectId: "proj-platform-core",
      assigneeId: "demo-user-1",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 72).toISOString(),
      updatedAt: new Date(now - HOUR * 16).toISOString(),
      assignee: DEMO_USER,
    },
    {
      id: "task-demo-8",
      title: "Responsive Bottom Sheet Task Inspector",
      description:
        "Optimize slide-over sheet gestures and focus trapping for mobile viewports.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(now + DAY * 3).toISOString(),
      projectId: "proj-mobile-app",
      assigneeId: "demo-user-1",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 20).toISOString(),
      updatedAt: new Date(now - HOUR * 6).toISOString(),
      assignee: DEMO_USER,
    },
    {
      id: "task-demo-9",
      title: "Offline Push Notification Queue Sync",
      description:
        "Persist unread notification acknowledgments locally while offline.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: new Date(now + DAY * 5).toISOString(),
      projectId: "proj-mobile-app",
      assigneeId: "user-2",
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 14).toISOString(),
      updatedAt: new Date(now - HOUR * 7).toISOString(),
      assignee: DEMO_MEMBERS[1].user,
    },
    {
      id: "task-demo-10",
      title: "Audit Touch Targets & WCAG AA Contrast Tokens",
      description:
        "Verify 44x44pt minimum hit areas across mobile navigation controls.",
      status: "BACKLOG",
      priority: "LOW",
      projectId: "proj-mobile-app",
      assigneeId: null,
      createdById: "demo-user-1",
      createdAt: new Date(now - HOUR * 30).toISOString(),
      updatedAt: new Date(now - HOUR * 20).toISOString(),
      assignee: null,
    },
  ];
}

function createInitialDemoNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "notif-demo-1",
      userId: DEMO_USER.id,
      workspaceId: DEMO_WORKSPACE.id,
      type: "TASK_ASSIGNED",
      title: "Task Assigned: Configure SAML 2.0 SSO",
      message: "Sarah Chen assigned you an urgent Platform Core deliverable.",
      link: "/dashboard/devboard-engineering/projects/platform-core?view=kanban",
      isRead: false,
      actorId: "user-2",
      createdAt: new Date(now - 1000 * 60 * 14).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 14).toISOString(),
      actor: {
        id: "user-2",
        name: "Sarah Chen",
        email: "sarah.chen@devboard.io",
      },
    },
    {
      id: "notif-demo-2",
      userId: DEMO_USER.id,
      workspaceId: DEMO_WORKSPACE.id,
      type: "TASK_STATUS_CHANGED",
      title: "Stage Updated to In Review",
      message:
        "Drag-and-Drop Kanban Stage Transitions moved to IN_REVIEW by Sarah Chen.",
      link: "/dashboard/devboard-engineering/projects/platform-core?view=kanban",
      isRead: false,
      actorId: "user-2",
      createdAt: new Date(now - HOUR * 2).toISOString(),
      updatedAt: new Date(now - HOUR * 2).toISOString(),
      actor: {
        id: "user-2",
        name: "Sarah Chen",
        email: "sarah.chen@devboard.io",
      },
    },
    {
      id: "notif-demo-3",
      userId: DEMO_USER.id,
      workspaceId: DEMO_WORKSPACE.id,
      type: "PROJECT_CREATED",
      title: "Project Initialized: Mobile App Redesign",
      message:
        "Mobile App Redesign workspace project was provisioned with 3 seeded deliverables.",
      link: "/dashboard/devboard-engineering/projects/mobile-app?view=kanban",
      isRead: true,
      actorId: DEMO_USER.id,
      createdAt: new Date(now - DAY).toISOString(),
      updatedAt: new Date(now - DAY).toISOString(),
      actor: {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
      },
    },
  ];
}

function createInitialDemoInvites(): Record<string, WorkspaceInvite> {
  return {
    "demo-invite-token-okta-azure": {
      id: "inv-demo-123",
      workspaceId: DEMO_WORKSPACE.id,
      email: "sarah.connor@enterprise.io",
      role: "MEMBER",
      token: "demo-invite-token-okta-azure",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      createdAt: new Date().toISOString(),
      workspace: {
        id: DEMO_WORKSPACE.id,
        name: DEMO_WORKSPACE.name,
        slug: DEMO_WORKSPACE.slug,
        logo: DEMO_WORKSPACE.logo,
      },
      invitedBy: {
        id: DEMO_USER.id,
        name: "Alex Rivera",
        email: DEMO_USER.email,
      },
    },
  };
}

let demoWorkspaces: Workspace[] = [{ ...DEMO_WORKSPACE }];
let demoMembers: WorkspaceMember[] = DEMO_MEMBERS.map((m) => ({
  ...m,
  user: { ...m.user },
}));
let demoProjects: Project[] = DEMO_PROJECTS.map((p) => ({ ...p }));
let demoTasks: Task[] = createInitialDemoTasks();
let demoNotifications: Notification[] = createInitialDemoNotifications();
let demoInvites: Record<string, WorkspaceInvite> = createInitialDemoInvites();
let isDemoActive = false;
const demoListeners = new Set<() => void>();

const DEMO_STORAGE_KEY = "devboard_simulation_demo_mode";

function resetDemoStores() {
  demoWorkspaces = [{ ...DEMO_WORKSPACE }];
  demoMembers = DEMO_MEMBERS.map((m) => ({
    ...m,
    user: { ...m.user },
  }));
  demoProjects = DEMO_PROJECTS.map((p) => ({ ...p }));
  demoTasks = createInitialDemoTasks();
  demoNotifications = createInitialDemoNotifications();
  demoInvites = createInitialDemoInvites();
}

function slugify(value: string, fallbackPrefix: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `${fallbackPrefix}-${Date.now()}`;
}

function parseDemoBody<TBody extends Record<string, unknown>>(body: unknown): TBody {
  if (!body) return {} as TBody;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === "object") {
        return parsed as TBody;
      }
    } catch {
      return {} as TBody;
    }
    return {} as TBody;
  }
  if (typeof body === "object") {
    return body as TBody;
  }
  return {} as TBody;
}

function resolveMemberUser(userId?: string | null): User | null {
  if (!userId) return null;
  const member = demoMembers.find(
    (m) => m.userId === userId || m.user.id === userId
  );
  return member ? member.user : null;
}

function hydrateTask(task: Task): Task {
  const project = demoProjects.find((p) => p.id === task.projectId);
  const resolvedAssignee =
    task.assigneeId === null
      ? null
      : task.assigneeId
      ? resolveMemberUser(task.assigneeId) || task.assignee || null
      : null;

  return {
    ...task,
    assignee: resolvedAssignee,
    createdBy: task.createdBy || DEMO_USER,
    project: project
      ? {
          id: project.id,
          name: project.name,
          slug: project.slug,
        }
      : task.project,
  };
}

function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "DONE") return false;
  try {
    const due = new Date(task.dueDate);
    if (Number.isNaN(due.getTime())) return false;
    return isPast(due) && !isToday(due);
  } catch {
    return false;
  }
}

function applyTaskQueryFilters(
  tasks: Task[],
  searchParams: URLSearchParams
): Task[] {
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assigneeId = searchParams.get("assigneeId");
  const dueDate = searchParams.get("dueDate");
  const overdue = searchParams.get("overdue");

  return tasks.filter((task) => {
    if (status && status !== "ALL" && task.status !== status) {
      return false;
    }
    if (priority && priority !== "ALL" && task.priority !== priority) {
      return false;
    }
    if (assigneeId && assigneeId !== "ALL") {
      if (assigneeId.toLowerCase() === "unassigned") {
        if (task.assigneeId) return false;
      } else if (task.assigneeId !== assigneeId) {
        return false;
      }
    }
    if (dueDate) {
      if (!task.dueDate || task.dueDate.slice(0, 10) !== dueDate.slice(0, 10)) {
        return false;
      }
    }
    if (overdue === "true" && !isTaskOverdue(task)) {
      return false;
    }
    return true;
  });
}

function findDemoWorkspace(idOrSlug: string): Workspace | undefined {
  return demoWorkspaces.find((w) => w.id === idOrSlug || w.slug === idOrSlug);
}

function findDemoProject(
  workspaceId: string | undefined,
  idOrSlug: string
): Project | undefined {
  return demoProjects.find(
    (p) =>
      (p.id === idOrSlug || p.slug === idOrSlug) &&
      (!workspaceId || p.workspaceId === workspaceId)
  );
}

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
  if (!enabled) {
    resetDemoStores();
  }
  if (typeof window !== "undefined") {
    try {
      if (enabled) {
        localStorage.setItem(DEMO_STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      }
    } catch {}
  }
  demoListeners.forEach((listener) => {
    try {
      listener();
    } catch {}
  });
};

export const getDemoTasks = (): Task[] => demoTasks.map(hydrateTask);

export const updateDemoTask = (
  id: string,
  updates: Partial<Task>
): Task | null => {
  const idx = demoTasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const existing = demoTasks[idx];
  let nextAssignee = existing.assignee;
  let nextAssigneeId = existing.assigneeId;

  if ("assigneeId" in updates) {
    nextAssigneeId = updates.assigneeId ?? null;
    nextAssignee = nextAssigneeId
      ? resolveMemberUser(nextAssigneeId) || updates.assignee || null
      : null;
  } else if ("assignee" in updates) {
    nextAssignee = updates.assignee ?? null;
  }

  demoTasks[idx] = {
    ...existing,
    ...updates,
    assigneeId: nextAssigneeId,
    assignee: nextAssignee,
    updatedAt: new Date().toISOString(),
  };

  return hydrateTask(demoTasks[idx]);
};

export const addDemoTask = (newTask: Partial<Task>): Task => {
  const id = newTask.id || `task-demo-${Date.now()}`;
  const existingIdx = demoTasks.findIndex((t) => t.id === id);
  const resolvedAssigneeId =
    newTask.assigneeId !== undefined ? newTask.assigneeId : DEMO_USER.id;
  const resolvedAssignee = resolvedAssigneeId
    ? resolveMemberUser(resolvedAssigneeId) || newTask.assignee || DEMO_USER
    : null;

  const created: Task = {
    id,
    title: newTask.title || "New Sprint Deliverable",
    description: newTask.description ?? null,
    status: newTask.status || "TODO",
    priority: newTask.priority || "MEDIUM",
    dueDate: newTask.dueDate ?? null,
    projectId: newTask.projectId || demoProjects[0]?.id || "proj-platform-core",
    assigneeId: resolvedAssigneeId,
    createdById: newTask.createdById || DEMO_USER.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignee: resolvedAssignee,
  };

  if (existingIdx !== -1) {
    demoTasks[existingIdx] = created;
  } else {
    demoTasks.unshift(created);
  }
  return hydrateTask(created);
};

export const deleteDemoTask = (id: string): boolean => {
  const beforeCount = demoTasks.length;
  demoTasks = demoTasks.filter((t) => t.id !== id);
  return demoTasks.length < beforeCount;
};

export const getDemoProjects = (): Project[] => [...demoProjects];

export const addDemoProject = (newProject: Partial<Project>): Project => {
  const id = newProject.id || `proj-demo-${Date.now()}`;
  const workspaceId = newProject.workspaceId || DEMO_WORKSPACE.id;
  const baseSlug =
    newProject.slug || slugify(newProject.name || "", "project");
  const slugExists = demoProjects.some(
    (p) => p.slug === baseSlug && p.workspaceId === workspaceId && p.id !== id
  );
  const slug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const existingIdx = demoProjects.findIndex(
    (p) => (p.id === id || p.slug === slug) && p.workspaceId === workspaceId
  );
  const created: Project = {
    id,
    name: newProject.name || "Microservices Gateway",
    slug,
    workspaceId,
    createdById: DEMO_USER.id,
    logo: newProject.logo || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    demoProjects[existingIdx] = created;
  } else {
    demoProjects.push(created);
  }
  return created;
};

export const updateDemoProject = (
  idOrSlug: string,
  updates: Partial<Project>,
  workspaceId?: string
): Project | null => {
  const idx = demoProjects.findIndex(
    (p) =>
      (p.id === idOrSlug || p.slug === idOrSlug) &&
      (!workspaceId || p.workspaceId === workspaceId)
  );
  if (idx !== -1) {
    demoProjects[idx] = {
      ...demoProjects[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return demoProjects[idx];
  }
  return null;
};

export const deleteDemoProject = (
  idOrSlug: string,
  workspaceId?: string
): boolean => {
  const targets = demoProjects.filter(
    (p) =>
      (p.id === idOrSlug || p.slug === idOrSlug) &&
      (!workspaceId || p.workspaceId === workspaceId)
  );
  if (targets.length === 0) return false;
  const targetIds = new Set(targets.map((t) => t.id));
  demoProjects = demoProjects.filter((p) => !targetIds.has(p.id));
  demoTasks = demoTasks.filter((t) => !targetIds.has(t.projectId));
  return true;
};

function addDemoWorkspace(input: Partial<Workspace>): Workspace {
  const id = input.id || `ws-demo-${Date.now()}`;
  const baseSlug = input.slug || slugify(input.name || "", "workspace");
  const slugConflict = demoWorkspaces.some((w) => w.slug === baseSlug);
  const slug = slugConflict
    ? `${baseSlug}-${Date.now().toString().slice(-4)}`
    : baseSlug;

  const created: Workspace = {
    id,
    name: input.name || "New Demo Workspace",
    slug,
    role: "OWNER",
    logo: input.logo ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  demoWorkspaces.push(created);
  demoMembers.push({
    id: `member-demo-${Date.now()}`,
    userId: DEMO_USER.id,
    workspaceId: id,
    role: "OWNER",
    user: DEMO_USER,
    joinedAt: new Date().toISOString(),
  });
  return created;
}

function updateDemoWorkspace(
  idOrSlug: string,
  updates: Partial<Workspace>
): Workspace | null {
  const idx = demoWorkspaces.findIndex(
    (w) => w.id === idOrSlug || w.slug === idOrSlug
  );
  if (idx === -1) return null;
  demoWorkspaces[idx] = {
    ...demoWorkspaces[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return demoWorkspaces[idx];
}

function deleteDemoWorkspace(idOrSlug: string): boolean {
  const target = findDemoWorkspace(idOrSlug);
  if (!target) return false;
  demoWorkspaces = demoWorkspaces.filter((w) => w.id !== target.id);
  const removedProjectIds = new Set(
    demoProjects.filter((p) => p.workspaceId === target.id).map((p) => p.id)
  );
  demoProjects = demoProjects.filter((p) => p.workspaceId !== target.id);
  demoTasks = demoTasks.filter((t) => !removedProjectIds.has(t.projectId));
  demoMembers = demoMembers.filter((m) => m.workspaceId !== target.id);
  return true;
}

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

  const [rawCleanEndpoint, queryString = ""] = endpoint.split("?");
  const cleanEndpoint = rawCleanEndpoint.replace(/\/+$/, "") || "/";
  const searchParams = new URLSearchParams(queryString);
  const upperMethod = method.toUpperCase();
  const parsedBody = parseDemoBody<Record<string, unknown>>(body);

  // Auth Endpoints
  if (cleanEndpoint === "/auth/me" || cleanEndpoint.endsWith("/auth/me")) {
    return { handled: true, data: { user: DEMO_USER, data: DEMO_USER } as T };
  }

  // Notifications Endpoints
  if (
    cleanEndpoint === "/notifications" ||
    cleanEndpoint.startsWith("/notifications/")
  ) {
    if (cleanEndpoint === "/notifications/read-all" && upperMethod === "PATCH") {
      const nowIso = new Date().toISOString();
      demoNotifications = demoNotifications.map((n) => ({
        ...n,
        isRead: true,
        updatedAt: nowIso,
      }));
      return {
        handled: true,
        data: { count: demoNotifications.length } as T,
      };
    }

    if (cleanEndpoint.startsWith("/notifications/")) {
      const rest = cleanEndpoint.slice("/notifications/".length);
      const [notificationId, action] = rest.split("/");

      if (action === "read" && upperMethod === "PATCH") {
        const idx = demoNotifications.findIndex((n) => n.id === notificationId);
        if (idx !== -1) {
          demoNotifications[idx] = {
            ...demoNotifications[idx],
            isRead: true,
            updatedAt: new Date().toISOString(),
          };
          return { handled: true, data: demoNotifications[idx] as T };
        }
        return {
          handled: true,
          data: { id: notificationId, isRead: true } as T,
        };
      }

      if (!action && upperMethod === "DELETE") {
        demoNotifications = demoNotifications.filter(
          (n) => n.id !== notificationId
        );
        return { handled: true, data: { id: notificationId } as T };
      }
    }

    // GET /notifications
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const parsedPageSize = Number.parseInt(
      searchParams.get("pageSize") || "30",
      10
    );
    const pageSize = Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 30;

    const filtered = unreadOnly
      ? demoNotifications.filter((n) => !n.isRead)
      : demoNotifications;
    const sliced = filtered.slice(0, pageSize);
    const unreadCount = demoNotifications.filter((n) => !n.isRead).length;

    const response: NotificationsResponse = {
      notifications: sliced,
      unreadCount,
      totalCount: filtered.length,
      hasMore: filtered.length > sliced.length,
      nextCursor: null,
    };
    return { handled: true, data: response as T };
  }

  // Public /invites/:token routes
  if (cleanEndpoint.startsWith("/invites/")) {
    const rest = cleanEndpoint.slice("/invites/".length);
    const [token, action] = rest.split("/");
    const fallbackWorkspace = demoWorkspaces[0] || DEMO_WORKSPACE;
    const existingInvite = demoInvites[token];

    if (action === "accept" && upperMethod === "POST") {
      const targetWorkspace = existingInvite?.workspace || {
        id: fallbackWorkspace.id,
        name: fallbackWorkspace.name,
        slug: fallbackWorkspace.slug,
        logo: fallbackWorkspace.logo,
      };
      if (existingInvite) {
        demoInvites[token] = { ...existingInvite, status: "ACCEPTED" };
      }
      const acceptRes: AcceptInviteResponse = {
        workspace: targetWorkspace,
        role: existingInvite?.role || "MEMBER",
        alreadyMember: false,
      };
      return { handled: true, data: acceptRes as T };
    }

    if (existingInvite) {
      const preview: InvitePreview = {
        id: existingInvite.id,
        email: existingInvite.email,
        role: existingInvite.role,
        status: existingInvite.status,
        expiresAt: existingInvite.expiresAt,
        isExpired: new Date(existingInvite.expiresAt) < new Date(),
        workspace: existingInvite.workspace,
        invitedBy: existingInvite.invitedBy,
      };
      return { handled: true, data: preview as T };
    }

    const fallbackPreview: InvitePreview = {
      id: `inv-demo-${token || "123"}`,
      email: "sarah.connor@enterprise.io",
      role: "MEMBER",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      isExpired: false,
      workspace: {
        id: fallbackWorkspace.id,
        name: fallbackWorkspace.name,
        slug: fallbackWorkspace.slug,
        logo: fallbackWorkspace.logo,
      },
      invitedBy: {
        id: DEMO_USER.id,
        name: "Alex Rivera",
        email: DEMO_USER.email,
      },
    };
    return { handled: true, data: fallbackPreview as T };
  }

  // Simulation fallback routes (when chaos interceptor is disarmed)
  if (cleanEndpoint.startsWith("/simulation")) {
    return { handled: true, data: { ok: true } as T };
  }

  // Workspaces List & Create
  if (cleanEndpoint === "/workspaces") {
    if (upperMethod === "POST") {
      const created = addDemoWorkspace(parsedBody as Partial<Workspace>);
      return { handled: true, data: created as T };
    }
    return { handled: true, data: [...demoWorkspaces] as T };
  }

  // Workspace and nested entity routes: /workspaces/:workspaceIdOrSlug/...
  if (cleanEndpoint.startsWith("/workspaces/")) {
    const rest = cleanEndpoint.slice("/workspaces/".length);
    const segments = rest.split("/").filter(Boolean);
    const [workspaceIdOrSlug, resource, resourceId, subResource, subResourceId] =
      segments;

    const workspace = findDemoWorkspace(workspaceIdOrSlug);
    const resolvedWorkspaceId = workspace?.id || workspaceIdOrSlug;

    // 1. Cross-project My Tasks: /workspaces/:wsId/my-tasks
    if (resource === "my-tasks") {
      const wsProjectIds = new Set(
        demoProjects
          .filter((p) => p.workspaceId === resolvedWorkspaceId)
          .map((p) => p.id)
      );
      const assigned = demoTasks.filter(
        (t) => wsProjectIds.has(t.projectId) && t.assigneeId === DEMO_USER.id
      );
      const filtered = applyTaskQueryFilters(assigned, searchParams).map(
        hydrateTask
      );
      const response: TasksResponse = {
        tasks: filtered,
        totalCount: filtered.length,
        nextCursor: null,
        hasMore: false,
      };
      return { handled: true, data: response as T };
    }

    // 2. Workspace Stats: /workspaces/:wsId/stats
    if (resource === "stats") {
      const wsProjects = demoProjects.filter(
        (p) => p.workspaceId === resolvedWorkspaceId
      );
      const wsProjectIds = new Set(wsProjects.map((p) => p.id));
      const wsTasks = demoTasks
        .filter((t) => wsProjectIds.has(t.projectId))
        .map(hydrateTask);

      const completedTasks = wsTasks.filter((t) => t.status === "DONE").length;
      const myAssignedTasks = wsTasks.filter(
        (t) => t.assigneeId === DEMO_USER.id
      ).length;
      const overdueTasks = wsTasks.filter(isTaskOverdue).length;

      const recentTasks = [...wsTasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        )
        .slice(0, 8);

      const projectsWithCounts = wsProjects.map((p) => ({
        ...p,
        _count: {
          tasks: wsTasks.filter((t) => t.projectId === p.id).length,
        },
      }));

      return {
        handled: true,
        data: {
          totalProjects: wsProjects.length,
          totalTasks: wsTasks.length,
          completedTasks,
          myAssignedTasks,
          overdueTasks,
          recentTasks,
          projects: projectsWithCounts,
        } as T,
      };
    }

    // 3. Members: /workspaces/:wsId/members(/:memberId)
    if (resource === "members") {
      if (resourceId) {
        if (upperMethod === "PATCH") {
          const nextRole = parsedBody.role as WorkspaceRole | undefined;
          const targetIdx = demoMembers.findIndex(
            (m) =>
              m.workspaceId === resolvedWorkspaceId &&
              (m.id === resourceId || m.userId === resourceId)
          );
          if (targetIdx !== -1 && nextRole) {
            if (nextRole === "OWNER") {
              demoMembers = demoMembers.map((m) =>
                m.workspaceId === resolvedWorkspaceId && m.role === "OWNER"
                  ? { ...m, role: "ADMIN" }
                  : m
              );
            }
            demoMembers[targetIdx] = {
              ...demoMembers[targetIdx],
              role: nextRole,
            };
            const demoUserMember = demoMembers.find(
              (m) =>
                m.workspaceId === resolvedWorkspaceId &&
                m.userId === DEMO_USER.id
            );
            if (demoUserMember) {
              updateDemoWorkspace(resolvedWorkspaceId, {
                role: demoUserMember.role,
              });
            }
            return { handled: true, data: demoMembers[targetIdx] as T };
          }
          return {
            handled: true,
            data: { id: resourceId, role: nextRole } as T,
          };
        }

        if (upperMethod === "DELETE") {
          demoMembers = demoMembers.filter(
            (m) =>
              !(
                m.workspaceId === resolvedWorkspaceId &&
                (m.id === resourceId || m.userId === resourceId)
              )
          );
          return { handled: true, data: { id: resourceId } as T };
        }
      }

      const membersForWorkspace = demoMembers.filter(
        (m) => m.workspaceId === resolvedWorkspaceId
      );
      return { handled: true, data: membersForWorkspace as T };
    }

    // 4. Invites: /workspaces/:wsId/invites
    if (resource === "invites") {
      const targetWs = workspace || demoWorkspaces[0] || DEMO_WORKSPACE;
      const email =
        (typeof parsedBody.email === "string" && parsedBody.email) ||
        "sarah.connor@enterprise.io";
      const role =
        parsedBody.role === "ADMIN" || parsedBody.role === "MEMBER"
          ? (parsedBody.role as InviteRole)
          : "MEMBER";
      const token = `demo-invite-${Date.now()}`;
      const inviteData: WorkspaceInvite = {
        id: `inv-demo-${Date.now()}`,
        workspaceId: targetWs.id,
        email,
        role,
        token,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        createdAt: new Date().toISOString(),
        workspace: {
          id: targetWs.id,
          name: targetWs.name,
          slug: targetWs.slug,
          logo: targetWs.logo,
        },
        invitedBy: {
          id: DEMO_USER.id,
          name: "Alex Rivera",
          email: DEMO_USER.email,
        },
      };
      demoInvites[token] = inviteData;
      return { handled: true, data: inviteData as T };
    }

    // 5. Projects & Project Tasks: /workspaces/:wsId/projects(...)
    if (resource === "projects") {
      if (!resourceId) {
        if (upperMethod === "POST") {
          const created = addDemoProject({
            ...(parsedBody as Partial<Project>),
            workspaceId: resolvedWorkspaceId,
          });
          return { handled: true, data: created as T };
        }
        const wsProjects = demoProjects.filter(
          (p) => p.workspaceId === resolvedWorkspaceId
        );
        return { handled: true, data: wsProjects as T };
      }

      const project = findDemoProject(resolvedWorkspaceId, resourceId);
      const resolvedProjectId = project?.id || resourceId;

      if (subResource === "tasks") {
        if (subResourceId) {
          if (upperMethod === "PATCH") {
            const updated = updateDemoTask(
              subResourceId,
              parsedBody as Partial<Task>
            );
            return {
              handled: true,
              data: (updated || {
                id: subResourceId,
                ...(parsedBody as Partial<Task>),
              }) as T,
            };
          }
          if (upperMethod === "DELETE") {
            deleteDemoTask(subResourceId);
            return { handled: true, data: { id: subResourceId } as T };
          }
          const foundTask = demoTasks.find((t) => t.id === subResourceId);
          return {
            handled: true,
            data: (foundTask ? hydrateTask(foundTask) : null) as T,
          };
        }

        if (upperMethod === "POST") {
          const created = addDemoTask({
            ...(parsedBody as Partial<Task>),
            projectId: resolvedProjectId,
          });
          return { handled: true, data: created as T };
        }

        const projectTasks = demoTasks.filter(
          (t) => t.projectId === resolvedProjectId
        );
        const filtered = applyTaskQueryFilters(projectTasks, searchParams).map(
          hydrateTask
        );
        const response: TasksResponse = {
          tasks: filtered,
          totalCount: filtered.length,
          nextCursor: null,
          hasMore: false,
        };
        return { handled: true, data: response as T };
      }

      // Single project operations: GET/PATCH/DELETE /workspaces/:wsId/projects/:projId
      if (upperMethod === "PATCH") {
        const updated = updateDemoProject(
          resourceId,
          parsedBody as Partial<Project>,
          resolvedWorkspaceId
        );
        return {
          handled: true,
          data: (updated || {
            id: resourceId,
            ...(parsedBody as Partial<Project>),
          }) as T,
        };
      }

      if (upperMethod === "DELETE") {
        deleteDemoProject(resourceId, resolvedWorkspaceId);
        return { handled: true, data: { id: resourceId } as T };
      }

      return {
        handled: true,
        data: (project ||
          demoProjects.find((p) => p.workspaceId === resolvedWorkspaceId) ||
          demoProjects[0]) as T,
      };
    }

    // 6. Single Workspace root operations: /workspaces/:wsIdOrSlug
    if (!resource) {
      if (upperMethod === "PATCH") {
        const updated = updateDemoWorkspace(
          workspaceIdOrSlug,
          parsedBody as Partial<Workspace>
        );
        return {
          handled: true,
          data: (updated || {
            ...DEMO_WORKSPACE,
            ...(parsedBody as Partial<Workspace>),
          }) as T,
        };
      }

      if (upperMethod === "DELETE") {
        deleteDemoWorkspace(workspaceIdOrSlug);
        return { handled: true, data: { id: resolvedWorkspaceId } as T };
      }

      return {
        handled: true,
        data: (workspace || demoWorkspaces[0] || DEMO_WORKSPACE) as T,
      };
    }
  }

  return { handled: false };
}

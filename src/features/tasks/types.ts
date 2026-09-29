export type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskView = "table" | "kanban" | "calendar";

export interface TaskUserSummary {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: TaskUserSummary | null;
  createdBy?: TaskUserSummary | null;
  project?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
  assigneeId?: string | "ALL" | "UNASSIGNED";
  dueDate?: string;
  overdue?: boolean;
  search?: string;
}

export interface TasksResponse {
  tasks: Task[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

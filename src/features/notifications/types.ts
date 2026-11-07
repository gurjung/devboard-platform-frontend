export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "MEMBER_ROLE_UPDATED"
  | "PROJECT_CREATED";

export interface NotificationActor {
  id: string;
  name: string | null;
  email: string;
}

export interface Notification {
  id: string;
  userId: string;
  workspaceId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  actorId?: string | null;
  createdAt: string;
  updatedAt: string;
  actor?: NotificationActor | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string | null;
}

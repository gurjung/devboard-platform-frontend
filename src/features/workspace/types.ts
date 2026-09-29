export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  role?: WorkspaceRole;
}

export interface WorkspaceMember {
  id: string;
  workspaceId?: string;
  userId?: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  createdAt?: string;
  joinedAt?: string;
}

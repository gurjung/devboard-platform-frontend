export interface Project {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export interface CreateProjectInput {
  name: string;
  logo?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  logo?: string | null;
}

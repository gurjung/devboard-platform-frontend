export type InviteRole = "ADMIN" | "MEMBER";

export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  email: string;
  role: InviteRole;
  token: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt?: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvitePreview {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  expiresAt: string;
  isExpired?: boolean;
  workspace: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AcceptInviteResponse {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  role: InviteRole;
  alreadyMember?: boolean;
}

export interface CreateInviteInput {
  email: string;
  role: InviteRole;
}

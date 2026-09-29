export const WORKSPACE_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;

export const WorkspaceRole = WORKSPACE_ROLES;

export type WorkspaceRoleType =
  (typeof WORKSPACE_ROLES)[keyof typeof WORKSPACE_ROLES];

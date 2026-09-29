"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { WorkspaceForm } from "@/features/workspace/components/settings/workspace-form";
import { WorkspaceRole } from "@/features/workspace/constants";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { en } from "@/locales/en";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params?.workspaceSlug as string;

  const { data: workspaces, isLoading } = useWorkspaces();

  const workspace = workspaces?.find(
    (w) => w.slug === workspaceSlug || w.id === workspaceSlug
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold text-foreground">
          Workspace not found
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          The requested workspace could not be found.
        </p>
      </div>
    );
  }

  const role = workspace.role?.toUpperCase();
  const isAuthorized = role === WorkspaceRole.OWNER || role === WorkspaceRole.ADMIN;

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold text-foreground">
          {en.workspace.settingsPage.accessDeniedTitle}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {en.workspace.settingsPage.accessDeniedDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          {en.workspace.settingsPage.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {en.workspace.settingsPage.description}
        </p>
      </div>

      <WorkspaceForm
        mode="edit"
        initialValues={{
          id: workspace.id,
          name: workspace.name,
          logo: workspace.logo,
        }}
        onSuccess={(updated) => {
          if (updated?.slug && updated.slug !== workspaceSlug) {
            router.push(`/dashboard/${updated.slug}/settings`);
          }
        }}
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { WorkspaceForm } from "@/features/workspace/components/settings/workspace-form";

export default function DashboardPage() {
  const router = useRouter();
  const { data: workspaces, isLoading } = useWorkspaces();

  useEffect(() => {
    if (!isLoading && workspaces && workspaces.length > 0) {
      router.replace(`/dashboard/${workspaces[0].slug}`);
    }
  }, [workspaces, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (workspaces && workspaces.length > 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <WorkspaceForm mode="create" />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";

export default function MyTasksRedirectPage() {
  const router = useRouter();
  const { data: workspaces, isLoading } = useWorkspaces();

  useEffect(() => {
    if (!isLoading && workspaces && workspaces.length > 0) {
      router.replace(`/dashboard/${workspaces[0].slug}/my-tasks`);
    } else if (!isLoading && (!workspaces || workspaces.length === 0)) {
      router.replace("/dashboard");
    }
  }, [workspaces, isLoading, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

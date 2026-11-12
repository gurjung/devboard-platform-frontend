"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import { en } from "@/locales/en";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectAvatar } from "./project-avatar";
import { useProjects } from "../hooks/use-projects";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";

const CreateProjectDialog = dynamic(
  () =>
    import("./create-project-dialog").then((mod) => mod.CreateProjectDialog),
  { ssr: false }
);

export function ProjectSwitcher() {
  const router = useRouter();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;
  const [createOpen, setCreateOpen] = React.useState(false);
  const [hasOpenedCreate, setHasOpenedCreate] = React.useState(false);

  const { data: workspaces } = useWorkspaces();
  const currentWorkspace = React.useMemo(() => {
    if (!workspaces || workspaces.length === 0) return null;
    return (
      workspaces.find((w) => w.slug === workspaceSlug || w.id === workspaceSlug) ||
      workspaces[0]
    );
  }, [workspaces, workspaceSlug]);

  const { data: projects, isLoading } = useProjects(currentWorkspace?.id);

  const currentProject = React.useMemo(() => {
    if (!projects || projects.length === 0) return null;
    return projects.find((p) => p.slug === projectSlug);
  }, [projects, projectSlug]);

  const canCreate =
    currentWorkspace?.role === "OWNER" || currentWorkspace?.role === "ADMIN";

  const handleValueChange = (slug: string | null) => {
    if (slug && slug !== projectSlug && currentWorkspace?.slug) {
      router.push(`/dashboard/${currentWorkspace.slug}/projects/${slug}`);
    }
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="flex items-center justify-between px-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {en.project.switcher.sectionTitle}
        </p>
        {canCreate && (
          <>
            <button
              type="button"
              onClick={() => {
                setHasOpenedCreate(true);
                setCreateOpen(true);
              }}
              className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-ring outline-none"
              aria-label={en.project.switcher.createTooltip}
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
            {hasOpenedCreate && (
              <CreateProjectDialog
                workspaceId={currentWorkspace.id}
                workspaceSlug={currentWorkspace.slug}
                open={createOpen}
                onOpenChange={setCreateOpen}
              />
            )}
          </>
        )}
      </div>

      <Select
        value={currentProject?.slug || ""}
        onValueChange={handleValueChange}
        disabled={isLoading || !projects || projects.length === 0}
      >
        <SelectTrigger
          aria-label={en.project.switcher.sectionTitle}
          className="h-11 w-full px-2.5 py-2 bg-background hover:bg-accent/60 border border-input shadow-2xs transition-all duration-200 rounded-xl focus:ring-2 focus:ring-ring/30 hover:border-border"
        >
          <SelectValue
            placeholder={
              isLoading
                ? en.project.switcher.loadingPlaceholder
                : en.project.switcher.selectPlaceholder
            }
          >
            {currentProject ? (
              <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                <ProjectAvatar
                  name={currentProject.name}
                  image={currentProject.logo}
                  className="size-6 rounded-md ring-1 ring-border/50 shrink-0"
                  fallbackClassName="text-[10px]"
                />
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="truncate text-xs font-semibold text-foreground tracking-tight">
                    {currentProject.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Project
                  </span>
                </div>
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="size-4 text-muted-foreground" aria-hidden="true" />
                <span>{en.project.switcher.selectPlaceholder}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="size-4 text-muted-foreground" aria-hidden="true" />
                <span>{en.project.switcher.noProjects}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          alignItemWithTrigger={false}
          className="w-(--anchor-width) min-w-56 p-1 rounded-xl shadow-xl border-border"
        >
          <SelectGroup>
            {projects?.map((project) => (
              <SelectItem
                key={project.id}
                value={project.slug}
                className="py-2 px-2.5 rounded-lg cursor-pointer transition-colors focus:bg-accent"
              >
                <div className="flex items-center gap-2.5 w-full min-w-0">
                  <ProjectAvatar
                    name={project.name}
                    image={project.logo}
                    className="size-6 rounded-md ring-1 ring-border/40 shrink-0"
                    fallbackClassName="text-[10px]"
                  />
                  <div className="flex flex-col min-w-0 flex-1 leading-tight">
                    <span className="truncate text-xs font-medium text-foreground">
                      {project.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Project
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";
import { FolderKanban } from "lucide-react";
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
import { CreateProjectDialog } from "./create-project-dialog";
import { useProjects } from "../hooks/use-projects";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";

export function ProjectSwitcher() {
  const router = useRouter();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;

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
          <CreateProjectDialog
            workspaceId={currentWorkspace.id}
            workspaceSlug={currentWorkspace.slug}
          >
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:opacity-75 transition cursor-pointer outline-none"
              title={en.project.switcher.createTooltip}
              aria-label={en.project.switcher.createTooltip}
            >
              <RiAddCircleFill className="size-5" />
            </button>
          </CreateProjectDialog>
        )}
      </div>

      <Select
        value={currentProject?.slug || ""}
        onValueChange={handleValueChange}
        disabled={isLoading || !projects || projects.length === 0}
      >
        <SelectTrigger className="h-11 w-full px-2.5 py-2 bg-background hover:bg-accent/60 border border-border/80 shadow-2xs transition-all duration-200 rounded-xl focus:ring-2 focus:ring-primary/20 hover:border-border">
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
                  <span className="text-[10px] text-muted-foreground/80 font-medium">
                    Project
                  </span>
                </div>
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="size-4 opacity-70" />
                <span>{en.project.switcher.selectPlaceholder}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="size-4 opacity-50" />
                <span>{en.project.switcher.noProjects}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          alignItemWithTrigger={false}
          className="w-(--anchor-width) min-w-56 p-1 rounded-xl shadow-xl border-border/80"
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
                    <span className="text-[10px] text-muted-foreground/80 font-normal">
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

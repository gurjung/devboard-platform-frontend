"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { en } from "@/locales/en";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaces } from "../../hooks/use-workspaces";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();
  const activeSlug = params?.workspaceSlug as string | undefined;

  const { data: workspaces, isLoading } = useWorkspaces();

  const currentWorkspace = React.useMemo(() => {
    if (!workspaces || workspaces.length === 0) return null;
    return workspaces.find((w) => w.slug === activeSlug) || workspaces[0];
  }, [workspaces, activeSlug]);

  const handleValueChange = (slug: string | null) => {
    if (slug && slug !== activeSlug) {
      router.push(`/dashboard/${slug}`);
    }
  };

  return (
    <div className="flex flex-col gap-y-1.5 w-full">
      <div className="flex items-center justify-between px-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {en.workspace.switcher.sectionTitle}
        </p>
        <CreateWorkspaceDialog>
          <button
            type="button"
            className="size-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-ring outline-none"
            aria-label={en.workspace.switcher.createTooltip}
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        </CreateWorkspaceDialog>
      </div>

      <Select
        value={currentWorkspace?.slug || ""}
        onValueChange={handleValueChange}
        disabled={isLoading || !workspaces || workspaces.length === 0}
      >
        <SelectTrigger
          aria-label={en.workspace.switcher.sectionTitle}
          className="h-10 w-full px-2 py-1.5 bg-background/60 dark:bg-card/80 hover:bg-sidebar-accent border border-input shadow-2xs transition-colors rounded-lg focus:ring-2 focus:ring-ring/30"
        >
          <SelectValue
            placeholder={
              isLoading
                ? en.workspace.switcher.loadingPlaceholder
                : en.workspace.switcher.selectPlaceholder
            }
          >
            {currentWorkspace ? (
              <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
                <Avatar className="h-6 w-6 rounded-md ring-1 ring-border shrink-0">
                  {currentWorkspace.logo ? (
                    <AvatarImage
                      src={currentWorkspace.logo}
                      alt={currentWorkspace.name}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-semibold rounded-md bg-primary/15 text-brand-text border border-primary/25">
                    {currentWorkspace.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="truncate text-xs font-medium text-foreground">
                    {currentWorkspace.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {currentWorkspace.role?.toLowerCase() ||
                      en.workspace.switcher.defaultRole}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{en.workspace.switcher.noWorkspaces}</span>
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
            {workspaces?.map((workspace) => (
              <SelectItem
                key={workspace.id}
                value={workspace.slug}
                className="py-1.5 px-2 rounded-md cursor-pointer transition-colors focus:bg-accent"
              >
                <div className="flex items-center gap-2.5 w-full min-w-0">
                  <Avatar className="h-6 w-6 rounded-md ring-1 ring-border shrink-0">
                    {workspace.logo ? (
                      <AvatarImage
                        src={workspace.logo}
                        alt={workspace.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-[10px] font-semibold rounded-md bg-primary/15 text-brand-text border border-primary/25">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1 leading-tight">
                    <span className="truncate text-xs font-medium text-foreground">
                      {workspace.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize font-normal">
                      {workspace.role?.toLowerCase() ||
                        en.workspace.switcher.defaultRole}
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

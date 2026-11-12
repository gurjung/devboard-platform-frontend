"use client";

import * as React from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  CheckCircle2,
  Users,
  Settings,
  FolderKanban,
  Building2,
  Sun,
  Moon,
  Laptop,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useProjects } from "@/features/projects/hooks/use-projects";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { setTheme } = useTheme();

  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;

  const { data: workspaces = [] } = useWorkspaces();
  const currentWorkspace = React.useMemo(
    () =>
      workspaces.find(
        (w) => w.slug === workspaceSlug || w.id === workspaceSlug
      ),
    [workspaces, workspaceSlug]
  );

  const { data: projects = [] } = useProjects(currentWorkspace?.id);

  const runAction = React.useCallback(
    (action: () => void) => {
      onOpenChange(false);
      action();
    },
    [onOpenChange]
  );

  const activeWorkspaceSlug = currentWorkspace?.slug || workspaceSlug;
  const isInProject = Boolean(activeWorkspaceSlug && projectSlug);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Menu"
      description="Quickly jump to workspaces, projects, views, and settings."
      className="sm:max-w-lg"
    >
      <Command className="border-0">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No matching commands or pages found.</CommandEmpty>

          {activeWorkspaceSlug && (
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() =>
                  runAction(() => router.push(`/dashboard/${activeWorkspaceSlug}`))
                }
              >
                <Home className="size-4 text-muted-foreground" />
                <span>Workspace Overview</span>
                <CommandShortcut>Home</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runAction(() =>
                    router.push(`/dashboard/${activeWorkspaceSlug}/my-tasks`)
                  )
                }
              >
                <CheckCircle2 className="size-4 text-muted-foreground" />
                <span>My Assigned Tasks</span>
                <CommandShortcut>Tasks</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runAction(() =>
                    router.push(`/dashboard/${activeWorkspaceSlug}/members`)
                  )
                }
              >
                <Users className="size-4 text-muted-foreground" />
                <span>Workspace Members</span>
                <CommandShortcut>Team</CommandShortcut>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  runAction(() =>
                    router.push(`/dashboard/${activeWorkspaceSlug}/settings`)
                  )
                }
              >
                <Settings className="size-4 text-muted-foreground" />
                <span>Workspace Settings</span>
              </CommandItem>
            </CommandGroup>
          )}

          {isInProject && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Project Views">
                <CommandItem
                  onSelect={() =>
                    runAction(() => router.replace(`${pathname}?view=table`))
                  }
                >
                  <TableIcon className="size-4 text-muted-foreground" />
                  <span>Switch to Table View</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runAction(() => router.replace(`${pathname}?view=kanban`))
                  }
                >
                  <KanbanIcon className="size-4 text-muted-foreground" />
                  <span>Switch to Kanban Board</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runAction(() => router.replace(`${pathname}?view=calendar`))
                  }
                >
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <span>Switch to Calendar View</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {projects.length > 0 && activeWorkspaceSlug && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project ${project.name} ${project.slug}`}
                    onSelect={() =>
                      runAction(() =>
                        router.push(
                          `/dashboard/${activeWorkspaceSlug}/projects/${project.slug}`
                        )
                      )
                    }
                  >
                    <FolderKanban className="size-4 text-muted-foreground" />
                    <span className="truncate">{project.name}</span>
                    {project.slug === projectSlug && (
                      <CommandShortcut>Active</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {workspaces.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Workspaces">
                {workspaces.map((ws) => (
                  <CommandItem
                    key={ws.id}
                    value={`workspace ${ws.name} ${ws.slug}`}
                    onSelect={() =>
                      runAction(() => router.push(`/dashboard/${ws.slug}`))
                    }
                  >
                    <Building2 className="size-4 text-muted-foreground" />
                    <span className="truncate">{ws.name}</span>
                    {ws.id === currentWorkspace?.id && (
                      <CommandShortcut>Current</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Appearance">
            <CommandItem onSelect={() => runAction(() => setTheme("dark"))}>
              <Moon className="size-4 text-muted-foreground" />
              <span>Theme: Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runAction(() => setTheme("light"))}>
              <Sun className="size-4 text-muted-foreground" />
              <span>Theme: Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runAction(() => setTheme("system"))}>
              <Laptop className="size-4 text-muted-foreground" />
              <span>Theme: System Default</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}


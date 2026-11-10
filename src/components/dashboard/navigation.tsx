"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Home, CheckCircle2, Settings, Users } from "lucide-react";
import { en } from "@/locales/en";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onNavigate?: () => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;

  const routes = [
    {
      label: en.dashboard.navigation.home,
      href: workspaceSlug ? `/dashboard/${workspaceSlug}` : "/dashboard",
      icon: Home,
    },
    {
      label: en.dashboard.navigation.myTasks,
      href: workspaceSlug
        ? `/dashboard/${workspaceSlug}/my-tasks`
        : "/dashboard/my-tasks",
      icon: CheckCircle2,
    },
    {
      label: en.dashboard.navigation.settings,
      href: workspaceSlug
        ? `/dashboard/${workspaceSlug}/settings`
        : "/dashboard/settings",
      icon: Settings,
    },
    {
      label: en.dashboard.navigation.members,
      href: workspaceSlug
        ? `/dashboard/${workspaceSlug}/members`
        : "/dashboard/members",
      icon: Users,
    },
  ];

  return (
    <nav aria-label="Workspace sections" className="flex flex-col">
      <ul className="flex flex-col gap-0.5">
        {routes.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== `/dashboard/${workspaceSlug}` &&
              pathname.startsWith(item.href) &&
              !pathname.includes("/projects/"));

          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (isActive) {
                    e.preventDefault();
                  }
                  onNavigate?.();
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/55"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-brand-text" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

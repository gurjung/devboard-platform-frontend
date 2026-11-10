"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { en } from "@/locales/en";
import { useAuth } from "@/features/auth/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface UserButtonProps {
  user?: User | null;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  if (email?.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return en.dashboard.navbar.avatarFallback || "U";
}

export function UserButton({ user: propUser }: UserButtonProps) {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;

  const initials = getInitials(user?.name, user?.email);

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative size-8 rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="User menu"
      >
        <Avatar className="size-8 cursor-pointer">
          {user?.image && (
            <AvatarImage src={user.image} alt={user.name || "User"} />
          )}
          <AvatarFallback className="text-xs font-semibold bg-primary/15 text-brand-text cursor-pointer">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-3 rounded-xl">
        <div className="flex flex-col items-center justify-center text-center py-1">
          <Avatar className="size-11 mb-2">
            {user?.image && (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            )}
            <AvatarFallback className="text-sm font-semibold bg-primary/15 text-brand-text">
              {initials}
            </AvatarFallback>
          </Avatar>
          {user?.name && (
            <p className="text-xs font-semibold leading-tight text-foreground">
              {user.name}
            </p>
          )}
          {user?.email && (
            <p className="text-[11px] text-muted-foreground truncate max-w-full mt-0.5">
              {user.email}
            </p>
          )}
        </div>
        <DropdownMenuSeparator className="my-2.5" />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer justify-center text-center w-full text-xs rounded-md"
        >
          <LogOut className="size-3.5 mr-2" />
          <span>{en.dashboard.navbar.logOut}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

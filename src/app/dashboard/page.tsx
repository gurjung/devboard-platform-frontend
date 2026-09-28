"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 text-center">
        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UserIcon className="size-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
          <p className="text-xs text-muted-foreground/80 mt-2 font-mono">
            User ID: {user?.id}
          </p>
        </div>
        <div className="pt-4 border-t border-border flex justify-center">
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

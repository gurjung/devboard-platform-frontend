import { en } from "@/locales/en";

interface MembersListErrorProps {
  message?: string;
}

export function MembersListError({ message }: MembersListErrorProps) {
  const displayMessage = message || en.workspace.members.errorDefault;
  return (
    <div
      role="alert"
      className="text-center py-12 bg-card border border-border/50 rounded-xl p-6 max-w-sm mx-auto"
    >
      <p className="text-xs font-semibold text-destructive-text">
        {en.workspace.members.errorTitle}
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
        {displayMessage}
      </p>
    </div>
  );
}

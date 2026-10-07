import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { refreshStore } from "@/services/prospect-store";
export function WorkspaceGate({
  ready,
  error,
  children,
}: {
  ready: boolean;
  error: string | null;
  children: ReactNode;
}) {
  if (!ready)
    return (
      <p role="status" className="py-12 text-sm text-muted-foreground">
        Opening your workspace…
      </p>
    );
  if (error)
    return (
      <div className="space-y-4 py-12">
        <p role="alert" className="max-w-xl text-sm text-destructive">
          {error}
        </p>
        <Button onClick={refreshStore} variant="outline">
          Retry opening workspace
        </Button>
      </div>
    );
  return children;
}

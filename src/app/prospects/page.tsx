import type { Metadata } from "next";
import { UsersRound } from "lucide-react";
import { WorkspacePlaceholder } from "@/features/workspaces/workspace-placeholder";

export const metadata: Metadata = { title: "Prospects" };
export default function Page() {
  return (
    <WorkspacePlaceholder
      title="Prospects"
      icon={UsersRound}
      description="Understand the person, the desired outcome, and the reason to start a conversation."
      nextCapabilities={[
        "Capture context using the six intelligence lenses.",
        "Separate confirmed evidence from assumptions.",
        "Identify who to contact and a concrete reason to reach out.",
      ]}
    />
  );
}

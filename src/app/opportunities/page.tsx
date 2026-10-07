import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { WorkspacePlaceholder } from "@/features/workspaces/workspace-placeholder";

export const metadata: Metadata = { title: "Opportunities" };
export default function Page() {
  return (
    <WorkspacePlaceholder
      title="Opportunities"
      icon={TrendingUp}
      description="Follow where money is moving and connect it to an outcome Sekairos can help deliver."
      nextCapabilities={[
        "Connect prospect context to an economic opportunity.",
        "Define an offer that addresses FRICTION and validates SEKAIROS FIT.",
        "Track the next action, owner, and timing decision.",
      ]}
    />
  );
}

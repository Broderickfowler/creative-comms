import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { WorkspacePlaceholder } from "@/features/workspaces/workspace-placeholder";

export const metadata: Metadata = { title: "Playbooks" };
export default function Page() {
  return (
    <WorkspacePlaceholder
      title="Playbooks"
      icon={BookOpen}
      description="Turn context into a relevant offer, a clear message, and a repeatable next step."
      nextCapabilities={[
        "Develop offers grounded in DESIRE and SEKAIROS FIT.",
        "Prepare conversations that reflect the prospect's actual context.",
        "Define purposeful follow-up and record what happens next.",
      ]}
    />
  );
}

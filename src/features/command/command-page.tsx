"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProspects } from "@/features/prospects/use-prospects";
import { WorkspaceGate } from "@/features/prospects/components/workspace-gate";
import {
  rankProspects,
  followUpsDue,
  pipelineCounts,
  localDate,
} from "@/features/prospects/domain/priorities";
import { FollowUpsDue } from "./components/follow-ups-due";
import { PriorityCard } from "./components/priority-card";
export function CommandPage() {
  const store = useProspects();
  const open = store.prospects.filter(
    (p) => p.status !== "Won" && p.status !== "Lost",
  );
  const priorities = rankProspects(open);
  const today = localDate();
  const counts = pipelineCounts(store.prospects, today);
  const due = followUpsDue(store.prospects, today);
  const metrics = [
    {
      label: "Today's Revenue Priorities",
      value: counts.priorities,
      key: "priorities",
    },
    { label: "Follow-Ups Due", value: counts.followUps, key: "follow-ups" },
    { label: "Demo Requests", value: counts.demos, key: "demos" },
    { label: "Meeting Requests", value: counts.meetings, key: "meetings" },
    { label: "Proposals", value: counts.proposals, key: "proposals" },
  ];
  return (
    <WorkspaceGate {...store}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">COMMAND · THE NEXT REVENUE MOVE</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            TODAY&apos;S REVENUE PRIORITIES
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">
            Ranked by Opportunity Score, then follow-up urgency, then current
            status. Won and Lost prospects remain in Prospects.
          </p>
        </div>
        <Button asChild>
          <Link href="/prospects/new">
            <Plus className="size-4" />
            Create prospect
          </Link>
        </Button>
      </div>
      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            data-testid={`pipeline-${metric.key}`}
            className="rounded-xl border bg-white p-5"
          >
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Saved in this browser · Fictional examples are labeled · Recommendations
        do not send messages.
      </p>
      <FollowUpsDue prospects={due} today={today} />
      <h2 className="mb-4 text-lg font-semibold">Revenue priorities</h2>
      <div className="space-y-4">
        {priorities.map((p, index) => (
          <PriorityCard key={p.id} prospect={p} index={index} />
        ))}
      </div>
      {priorities.length === 0 && (
        <div className="rounded-xl border border-dashed p-8">
          <h2 className="text-lg font-semibold">Start with one prospect</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a prospect and add intelligence to bring the next revenue
            move into focus.
          </p>
          <Button asChild className="mt-5">
            <Link href="/prospects/new">Create prospect</Link>
          </Button>
        </div>
      )}
    </WorkspaceGate>
  );
}

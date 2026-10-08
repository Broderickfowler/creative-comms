"use client";
import Link from "next/link";
import { NextRevenueAction } from "@/features/outreach/components/next-revenue-action";
import { FollowUpEditor } from "@/features/outreach/components/follow-up-editor";
import { OutreachActivityList } from "@/features/outreach/components/outreach-activity";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, NotebookPen, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProspect } from "@/services/prospect-store";
import { useProspects } from "./use-prospects";
import { WorkspaceGate } from "./components/workspace-gate";
import { MissingProspect } from "./components/missing-prospect";
import { IntelligenceEditor } from "./components/intelligence-editor";
import { ScoreBadge } from "./components/score-badge";
import { CallHistory } from "./components/call-history";
import { recommendedNextAction } from "./domain/call-outcome";
import { followUpLabel } from "./domain/priorities";
const displayFields = [
  "website",
  "email",
  "phone",
  "industry",
  "location",
  "source",
] as const;
export function ProspectDetail({ id }: { id: string }) {
  const store = useProspects();
  const prospect = store.prospects.find((p) => p.id === id);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  function remove() {
    if (
      !prospect ||
      !window.confirm(
        `Delete ${prospect.companyName} and its intelligence, call prep, call history, and outreach activity from this browser? This cannot be undone.`,
      )
    )
      return;
    try {
      deleteProspect(id);
      router.push("/prospects");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prospect was not deleted");
    }
  }
  if (!prospect)
    return (
      <WorkspaceGate {...store}>
        <MissingProspect />
      </WorkspaceGate>
    );
  const p = prospect;
  return (
    <WorkspaceGate {...store}>
      <Link
        href="/prospects"
        className="mb-5 inline-flex items-center gap-2 text-xs text-primary"
      >
        <ArrowLeft className="size-3" />
        All prospects
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">PROSPECT INTELLIGENCE</p>
          <h1 className="mt-2 break-words text-3xl font-semibold">
            {p.companyName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {[p.contactFirstName, p.contactLastName]
              .filter(Boolean)
              .join(" ") || "Contact not recorded"}{" "}
            · {p.contactRole || "Role not recorded"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" data-testid="prospect-status">
              {p.status}
            </Badge>
            <Badge variant="secondary">{p.icp}</Badge>
            {p.isFictional && (
              <Badge variant="secondary">Fictional example</Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/prospects/${id}/call-prep`}>
              <Phone className="size-4" />
              Call Prep
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/prospects/${id}/debrief`}>
              <NotebookPen className="size-4" />
              Log a call
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/prospects/${id}/brief`}>Opportunity Brief</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/prospects/${id}/edit`}>
              <Pencil className="size-4" />
              Edit prospect
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Delete prospect"
            onClick={remove}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-destructive">
          {error}
        </p>
      )}
      <div className="mb-6 grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Opportunity Score
          </p>
          <ScoreBadge scores={p.intelligence.scores} />
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            RECOMMENDED NEXT ACTION
          </p>
          <p data-testid="next-action" className="font-semibold text-primary">
            {recommendedNextAction(p)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {followUpLabel(p)}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Estimated opportunity value
          </p>
          <p className="font-semibold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 2,
            }).format(p.estimatedOpportunityValue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Hypothesis, not confirmed revenue
          </p>
        </div>
      </div>
      <NextRevenueAction prospect={p} assets={store.assets} />
      <FollowUpEditor key={id} prospect={p} />
      <details className="mb-6 rounded-xl border bg-white p-5">
        <summary className="cursor-pointer text-sm font-medium">
          Contact details & prospect notes
        </summary>
        <dl className="mt-4 grid gap-4 text-xs sm:grid-cols-3">
          {displayFields.map((key) => (
            <div key={key}>
              <dt className="capitalize text-muted-foreground">{key}</dt>
              <dd className="mt-1 break-words">{p[key] || "Not recorded"}</dd>
            </div>
          ))}
          <div className="sm:col-span-3">
            <dt className="text-muted-foreground">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap">
              {p.notes || "Not recorded"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{new Date(p.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{new Date(p.updatedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">ID</dt>
            <dd className="break-all">{p.id}</dd>
          </div>
        </dl>
      </details>
      <IntelligenceEditor key={id} id={id} initial={p.intelligence} />
      <CallHistory calls={p.calls} />
      <OutreachActivityList prospect={p} />
    </WorkspaceGate>
  );
}

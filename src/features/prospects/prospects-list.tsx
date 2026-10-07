"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextField, SelectField } from "@/components/forms/fields";
import { useProspects } from "./use-prospects";
import { WorkspaceGate } from "./components/workspace-gate";
import { ScoreBadge } from "./components/score-badge";
import { rankProspects } from "./domain/priorities";
import { ICP_VALUES, PROSPECT_STATUSES } from "@/types/prospect";
export function ProspectsList() {
  const store = useProspects();
  const [query, setQuery] = useState("");
  const [icp, setIcp] = useState("All ICPs");
  const [status, setStatus] = useState("All statuses");
  const prospects = rankProspects(store.prospects).filter(
    (p) =>
      (icp === "All ICPs" || p.icp === icp) &&
      (status === "All statuses" || p.status === status) &&
      `${p.companyName} ${p.contactFirstName} ${p.contactLastName} ${p.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <WorkspaceGate {...store}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">PEOPLE & CONTEXT</p>
          <h1 className="mt-2 text-3xl font-semibold">Prospects</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Saved in this browser. Fictional examples are labeled.
          </p>
        </div>
        <Button asChild>
          <Link href="/prospects/new">
            <Plus className="size-4" />
            Create prospect
          </Link>
        </Button>
      </div>
      <div className="mb-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3">
        <TextField label="Search prospects" value={query} onChange={setQuery} />
        <SelectField
          label="Filter by ICP"
          value={icp}
          onChange={setIcp}
          options={["All ICPs", ...ICP_VALUES]}
        />
        <SelectField
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={["All statuses", ...PROSPECT_STATUSES]}
        />
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {prospects.length} of {store.prospects.length} prospects
      </p>
      <div className="space-y-3">
        {prospects.map((p) => (
          <article
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-5 rounded-xl border bg-white p-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/prospects/${p.id}`}
                  className="text-base font-semibold text-primary hover:underline"
                >
                  {p.companyName}
                </Link>
                {p.isFictional && (
                  <Badge variant="secondary">Fictional example</Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {[p.contactFirstName, p.contactLastName]
                  .filter(Boolean)
                  .join(" ") || "Contact not recorded"}{" "}
                · {p.icp}
              </p>
              <Badge variant="outline" className="mt-3">
                {p.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <ScoreBadge scores={p.intelligence.scores} />
              <Button asChild variant="outline" size="sm">
                <Link href={`/prospects/${p.id}`}>
                  Open prospect <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
      {prospects.length === 0 && (
        <div className="rounded-xl border border-dashed p-8">
          <h2 className="font-semibold">No prospects match this view</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Adjust the filters or create your first prospect.
          </p>
        </div>
      )}
    </WorkspaceGate>
  );
}

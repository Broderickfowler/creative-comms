"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Printer, Pencil, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveFeedback } from "@/components/forms/fields";
import { useProspects } from "@/features/prospects/use-prospects";
import { WorkspaceGate } from "@/features/prospects/components/workspace-gate";
import { MissingProspect } from "@/features/prospects/components/missing-prospect";
import { resetOpportunityBrief } from "@/services/prospect-store";
import { matchSalesAssets } from "@/features/sales-assets/domain/matching";
import { resolveOpportunityBrief } from "./domain/brief";
import { BriefDocument } from "./components/brief-document";
import { BriefEditor } from "./components/brief-editor";
export function BriefPage({
  id,
  printRequested = false,
}: {
  id: string;
  printRequested?: boolean;
}) {
  const store = useProspects(),
    p = store.prospects.find((p) => p.id === id);
  const [editing, setEditing] = useState(false),
    [error, setError] = useState<string | null>(null),
    [feedback, setFeedback] = useState<string | null>(null);
  const printed = useRef(false);
  useEffect(() => {
    if (!printRequested || !store.ready || store.error || !p || printed.current)
      return;
    const frame = requestAnimationFrame(() => {
      if (!printed.current) {
        printed.current = true;
        window.print();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [printRequested, store.ready, store.error, p]);
  if (!p)
    return (
      <WorkspaceGate {...store}>
        <MissingProspect />
      </WorkspaceGate>
    );
  const match = matchSalesAssets(p, store.assets),
    fields = resolveOpportunityBrief(p);
  function reset() {
    try {
      resetOpportunityBrief(id);
      setEditing(false);
      setError(null);
      setFeedback("Brief reset to generated version.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Brief was not reset.");
    }
  }
  return (
    <WorkspaceGate {...store}>
      <div className="brief-controls mb-6 space-y-4" data-print-internal>
        <Link
          href={`/prospects/${id}/outreach`}
          className="inline-flex items-center gap-2 text-xs text-primary"
        >
          <ArrowLeft className="size-3" />
          Back to Outreach
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">PROSPECT-SPECIFIC COLLATERAL</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {p.brief
                ? "Saved customizations · defaults stay connected to intelligence"
                : "Generated from recorded intelligence"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => window.print()}>
              <Printer className="size-4" />
              Print / Save as PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(!editing);
                setFeedback(null);
              }}
            >
              <Pencil className="size-4" />
              {editing ? "Close editor" : "Edit brief"}
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              <RotateCcw className="size-4" />
              Reset to generated version
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Save as PDF from your browser, then attach the PDF when sending. Long
          custom content may use additional pages.
        </p>
        <SaveFeedback error={error} message={feedback} />
      </div>
      {editing && (
        <BriefEditor key={id} prospect={p} onDone={() => setEditing(false)} />
      )}
      <BriefDocument prospect={p} fields={fields} match={match} />
    </WorkspaceGate>
  );
}

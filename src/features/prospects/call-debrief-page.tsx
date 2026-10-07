"use client";
import { useProspects } from "./use-prospects";
import { WorkspaceGate } from "./components/workspace-gate";
import { MissingProspect } from "./components/missing-prospect";
import { ProspectHeading } from "./components/prospect-heading";
import { DebriefForm } from "./components/debrief-form";
export function CallDebriefPage({ id }: { id: string }) {
  const store = useProspects();
  const p = store.prospects.find((p) => p.id === id);
  return (
    <WorkspaceGate {...store}>
      {p ? (
        <>
          <ProspectHeading prospect={p} title="Call Debrief" />
          <DebriefForm key={id} prospect={p} />
        </>
      ) : (
        <MissingProspect />
      )}
    </WorkspaceGate>
  );
}

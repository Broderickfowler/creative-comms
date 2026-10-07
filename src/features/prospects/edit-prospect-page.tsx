"use client";
import { useProspects } from "./use-prospects";
import { WorkspaceGate } from "./components/workspace-gate";
import { ProspectForm } from "./components/prospect-form";
import { ProspectHeading } from "./components/prospect-heading";
import { MissingProspect } from "./components/missing-prospect";
export function EditProspectPage({ id }: { id: string }) {
  const store = useProspects();
  const p = store.prospects.find((p) => p.id === id);
  return (
    <WorkspaceGate {...store}>
      {p ? (
        <>
          <ProspectHeading prospect={p} title="Edit prospect" />
          <ProspectForm key={id} initial={p} />
        </>
      ) : (
        <MissingProspect />
      )}
    </WorkspaceGate>
  );
}

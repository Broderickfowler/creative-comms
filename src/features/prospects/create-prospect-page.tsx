"use client";
import { useProspects } from "./use-prospects";
import { WorkspaceGate } from "./components/workspace-gate";
import { ProspectForm } from "./components/prospect-form";
export function CreateProspectPage() {
  const store = useProspects();
  return (
    <WorkspaceGate {...store}>
      <div className="mb-7">
        <p className="eyebrow">START WITH THE PROSPECT</p>
        <h1 className="mt-2 text-3xl font-semibold">Create prospect</h1>
      </div>
      <ProspectForm />
    </WorkspaceGate>
  );
}

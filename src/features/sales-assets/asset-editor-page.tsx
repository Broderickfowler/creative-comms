"use client";
import Link from "next/link";
import { useProspects } from "@/features/prospects/use-prospects";
import { WorkspaceGate } from "@/features/prospects/components/workspace-gate";
import { Button } from "@/components/ui/button";
import { AssetForm } from "./components/asset-form";
export function AssetEditorPage({ id }: { id?: string }) {
  const store = useProspects();
  const asset = store.assets.find((a) => a.id === id);
  return (
    <WorkspaceGate {...store}>
      {id && !asset ? (
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Sales asset not found</h1>
          <p className="text-sm text-muted-foreground">
            It may have been deleted or saved in another browser.
          </p>
          <Button asChild>
            <Link href="/sales-assets">Sales Assets</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="eyebrow">SALES ASSET LIBRARY</p>
          <h1 className="mb-7 mt-2 text-3xl font-semibold">
            {id ? "Edit asset" : "Create asset"}
          </h1>
          <AssetForm key={id ?? "new"} initial={asset} />
        </>
      )}
    </WorkspaceGate>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField, SaveFeedback } from "@/components/forms/fields";
import { ASSET_TYPES, ASSET_ICPS, type SalesAsset } from "@/types/sales-asset";
import { useProspects } from "@/features/prospects/use-prospects";
import { WorkspaceGate } from "@/features/prospects/components/workspace-gate";
import { deleteSalesAsset } from "@/services/prospect-store";
import { AssetCard } from "./components/asset-card";
export function SalesAssetsPage() {
  const store = useProspects();
  const [icp, setIcp] = useState("All ICPs"),
    [type, setType] = useState("All types"),
    [offer, setOffer] = useState("All offers");
  const [error, setError] = useState<string | null>(null);
  const offers = [
    ...new Set(store.assets.map((a) => a.offer).filter(Boolean)),
  ].sort();
  const assets = store.assets
    .filter(
      (a) =>
        (icp === "All ICPs" || a.icp === icp) &&
        (type === "All types" || a.type === type) &&
        (offer === "All offers" || a.offer === offer),
    )
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  function remove(a: SalesAsset) {
    if (
      !window.confirm(
        `Delete ${a.name}? It will no longer be recommended. Existing messages and brief edits will be preserved.`,
      )
    )
      return;
    try {
      deleteSalesAsset(a.id);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Asset was not deleted.");
    }
  }
  return (
    <WorkspaceGate {...store}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">READY FOR THE NEXT CONVERSATION</p>
          <h1 className="mt-2 text-3xl font-semibold">Sales Assets</h1>
          <p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">
            Demos, offers, and collateral matched to the prospect&apos;s
            context. Active assets are eligible for matching; example URLs need
            replacement.
          </p>
        </div>
        <Button asChild>
          <Link href="/sales-assets/new">
            <Plus className="size-4" />
            Create asset
          </Link>
        </Button>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Filter assets by ICP"
          value={icp}
          onChange={setIcp}
          options={["All ICPs", ...ASSET_ICPS]}
        />
        <SelectField
          label="Filter assets by type"
          value={type}
          onChange={setType}
          options={["All types", ...ASSET_TYPES]}
        />
        <SelectField
          label="Filter assets by offer"
          value={offer}
          onChange={setOffer}
          options={[
            "All offers",
            ...offers,
            ...(!offers.includes(offer) && offer !== "All offers"
              ? [offer]
              : []),
          ]}
        />
      </div>
      <SaveFeedback error={error} message={null} />
      <p
        className="mb-4 text-xs text-muted-foreground"
        data-testid="asset-count"
      >
        {assets.length} of {store.assets.length} assets · Saved in this browser
      </p>
      {assets.length ? (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} onDelete={remove} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8">
          <h2 className="text-lg font-semibold">No matching assets</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Change the filters or create material for this ICP and offer.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setIcp("All ICPs");
              setType("All types");
              setOffer("All offers");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </WorkspaceGate>
  );
}

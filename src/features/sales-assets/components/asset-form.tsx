"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FormSection,
  TextField,
  SelectField,
  SaveFeedback,
} from "@/components/forms/fields";
import {
  ASSET_TYPES,
  ASSET_ICPS,
  ASSET_STATUSES,
  type SalesAsset,
  type SalesAssetFields,
} from "@/types/sales-asset";
import { blankAsset, offerOptions } from "../domain/assets";
import { addSalesAsset, updateSalesAsset } from "@/services/prospect-store";
export function AssetForm({ initial }: { initial?: SalesAsset }) {
  const router = useRouter();
  const [fields, setFields] = useState<SalesAssetFields>(initial ?? blankAsset);
  const [error, setError] = useState<string | null>(null);
  function change<K extends keyof SalesAssetFields>(
    key: K,
    value: SalesAssetFields[K],
  ) {
    setFields((v) => ({ ...v, [key]: value }));
    setError(null);
  }
  return (
    <form
      className="max-w-4xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          if (initial) updateSalesAsset(initial.id, fields);
          else addSalesAsset(fields);
          router.push("/sales-assets");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Asset was not saved.");
        }
      }}
    >
      <FormSection
        title="Sales material"
        description="Store a link to existing material. Replace example URLs with the actual collateral before sending."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Asset name"
            value={fields.name}
            required
            onChange={(v) => change("name", v)}
          />
          <TextField
            label="Asset URL"
            value={fields.url}
            type="url"
            required
            onChange={(v) => change("url", v)}
            hint="Use an http:// or https:// URL. No uploads."
          />
          <SelectField
            label="Asset type"
            value={fields.type}
            options={ASSET_TYPES}
            onChange={(v) => change("type", v as SalesAssetFields["type"])}
          />
          <SelectField
            label="Asset ICP"
            value={fields.icp}
            options={ASSET_ICPS}
            onChange={(v) => change("icp", v as SalesAssetFields["icp"])}
          />
          <TextField
            label="Offer"
            value={fields.offer}
            onChange={(v) => change("offer", v)}
            hint="Use the exact Sekairos offer name to strengthen matching, or leave blank for general material."
          />
          <SelectField
            label="Asset status"
            value={fields.status}
            options={ASSET_STATUSES}
            onChange={(v) => change("status", v as SalesAssetFields["status"])}
          />
        </div>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Sekairos offer names</summary>
          <ul className="mt-3 grid list-inside list-disc gap-2 sm:grid-cols-2">
            {offerOptions.map((offer) => (
              <li key={offer}>{offer}</li>
            ))}
          </ul>
        </details>
      </FormSection>
      <FormSection title="Matching context">
        <TextField
          label="Description"
          multiline
          value={fields.description}
          onChange={(v) => change("description", v)}
        />
        <TextField
          label="Use when"
          multiline
          value={fields.useWhen}
          onChange={(v) => change("useWhen", v)}
          hint="Describe the outcome, friction, or request this material addresses."
        />
      </FormSection>
      <SaveFeedback error={error} message={null} />
      <div className="flex gap-3">
        <Button type="submit">{initial ? "Save asset" : "Create asset"}</Button>
        <Button asChild variant="outline">
          <Link href="/sales-assets">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

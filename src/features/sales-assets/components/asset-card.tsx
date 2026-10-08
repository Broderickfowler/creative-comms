import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { SalesAsset } from "@/types/sales-asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function AssetCard({
  asset: a,
  onDelete,
}: {
  asset: SalesAsset;
  onDelete: (asset: SalesAsset) => void;
}) {
  return (
    <article
      data-testid="asset-card"
      className="flex flex-col rounded-xl border bg-white p-5"
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{a.type}</Badge>
        <Badge variant="secondary">{a.status}</Badge>
        {a.isExample && <Badge variant="outline">Example asset</Badge>}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{a.name}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {a.icp} · {a.offer || "No specific offer"}
      </p>
      <p className="mt-4 text-sm leading-6">
        {a.description || "No description recorded."}
      </p>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        <strong>Use when:</strong> {a.useWhen || "Add matching context."}
      </p>
      <p className="my-4 break-all text-xs text-primary">{a.url}</p>
      {a.isExample && (
        <p className="mb-4 text-xs text-amber-800">
          Example URL — replace with real material before sending.
        </p>
      )}
      <div className="mt-auto flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={a.url} target="_blank" rel="noopener noreferrer">
            Open Asset <ExternalLink className="size-3.5" />
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/sales-assets/${a.id}/edit`}>
            <Pencil className="size-3.5" />
            Edit asset
          </Link>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onDelete(a)}
          aria-label={`Delete ${a.name}`}
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
    </article>
  );
}

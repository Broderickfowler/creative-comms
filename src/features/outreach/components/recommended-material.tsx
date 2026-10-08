"use client";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Copy, FileText, Printer } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import type { SalesAsset } from "@/types/sales-asset";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveFeedback } from "@/components/forms/fields";
import { copyToClipboard } from "@/services/clipboard";
import { matchSalesAssets } from "@/features/sales-assets/domain/matching";
export function RecommendedMaterial({
  prospect: p,
  assets,
}: {
  prospect: Prospect;
  assets: SalesAsset[];
}) {
  const match = matchSalesAssets(p, assets);
  const [feedback, setFeedback] = useState<string | null>(null),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false);
  async function copyUrl(asset: SalesAsset) {
    setError(null);
    setFeedback(null);
    setBusy(true);
    try {
      await copyToClipboard(asset.url);
      setFeedback(`${asset.name} asset link copied.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Asset link was not copied.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      data-testid="recommended-material"
      className="mb-6 space-y-5 rounded-xl border bg-white p-5"
    >
      <div>
        <h2 className="eyebrow">RECOMMENDED MATERIAL</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {match.reason}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div data-testid="primary-asset">
          {match.primary ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{match.primary.name}</h3>
                {match.primary.isExample && (
                  <Badge variant="outline">Example asset</Badge>
                )}
              </div>
              <p className="mt-2 text-xs leading-5">
                {match.primary.description}
              </p>
              <p className="mt-2 break-all text-xs text-primary">
                {match.primary.url}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a
                    href={match.primary.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Asset <ExternalLink className="size-3.5" />
                  </a>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void copyUrl(match.primary!)}
                >
                  <Copy className="size-3.5" />
                  Copy Asset Link
                </Button>
              </div>
              {match.primary.isExample && (
                <p className="mt-3 text-xs text-amber-800">
                  Example URL — replace it in Sales Assets before sending real
                  collateral.
                </p>
              )}
            </>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href="/sales-assets/new">Create matching asset</Link>
            </Button>
          )}
        </div>
        <div>
          <h3 className="eyebrow">RECOMMENDED OPPORTUNITY BRIEF</h3>
          <p className="mt-2 text-sm">
            A prospect-specific executive summary for {p.companyName}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/prospects/${p.id}/brief`}>
                <FileText className="size-3.5" />
                Open Opportunity Brief
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/prospects/${p.id}/brief?print=1`}>
                <Printer className="size-3.5" />
                Print / Save PDF
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Print the brief to PDF and attach it when sending. No message is
            delivered automatically.
          </p>
        </div>
      </div>
      {match.secondary && (
        <details className="border-t pt-4">
          <summary className="cursor-pointer text-xs font-medium">
            Secondary Asset · {match.secondary.name}
          </summary>
          <p className="mt-3 text-xs leading-5">
            {match.secondary.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a
                href={match.secondary.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Secondary Asset
              </a>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => void copyUrl(match.secondary!)}
            >
              Copy Secondary Link
            </Button>
          </div>
          {match.secondary.isExample && (
            <p className="mt-3 text-xs text-amber-800">
              Example URL — replace before sending.
            </p>
          )}
        </details>
      )}
      <SaveFeedback error={error} message={feedback} />
    </section>
  );
}

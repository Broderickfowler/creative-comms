import Link from "next/link";
import { Send } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import type { SalesAsset } from "@/types/sales-asset";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/features/prospects/components/score-badge";
import { matchSalesAssets } from "@/features/sales-assets/domain/matching";
import {
  materialToSend,
  materialRequest,
  materialAction,
} from "@/features/sales-assets/domain/materials";
export function MaterialToSend({
  prospects,
  assets,
}: {
  prospects: Prospect[];
  assets: SalesAsset[];
}) {
  const pending = materialToSend(prospects);
  return (
    <section className="mb-8" aria-labelledby="material-to-send-heading">
      <h2
        id="material-to-send-heading"
        className="mb-4 flex items-center gap-2 text-lg font-semibold"
      >
        <Send className="size-4 text-primary" />
        MATERIAL TO SEND{" "}
        <Badge variant="secondary" data-testid="material-count">
          {pending.length}
        </Badge>
      </h2>
      {!pending.length ? (
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No unsent demo, information, or proposal requests. Log the next call
          outcome to keep warm requests visible.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => {
            const match = matchSalesAssets(p, assets),
              request = materialRequest(p)!;
            return (
              <article
                key={p.id}
                data-testid="material-card"
                className="rounded-xl border border-primary/25 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/prospects/${p.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {p.companyName}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{request}</Badge>
                      {p.isFictional && (
                        <Badge variant="secondary">Fictional example</Badge>
                      )}
                    </div>
                  </div>
                  <ScoreBadge scores={p.intelligence.scores} />
                </div>
                <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Recommended Asset</p>
                    <p className="mt-1 font-medium">
                      {match.primary?.name ?? "No matching active asset"}
                      {match.primary?.isExample && " · example URL"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Action</p>
                    <p className="mt-1 font-semibold text-primary">
                      {materialAction(request, match)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/prospects/${p.id}/outreach`}>
                      Open Send Pack
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/prospects/${p.id}/brief`}>
                      Open Opportunity Brief
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import { Clock3 } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  followUpDate,
  followUpLabel,
} from "@/features/prospects/domain/priorities";
export function FollowUpsDue({
  prospects,
  today,
}: {
  prospects: Prospect[];
  today: string;
}) {
  return (
    <section className="mb-8" aria-labelledby="follow-ups-due-heading">
      <h2
        id="follow-ups-due-heading"
        className="mb-4 flex items-center gap-2 text-lg font-semibold"
      >
        <Clock3 className="size-4 text-primary" />
        FOLLOW-UPS DUE <Badge variant="secondary">{prospects.length}</Badge>
      </h2>
      {!prospects.length ? (
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No follow-ups due today. Set the next date and reason on a prospect.
        </p>
      ) : (
        <div className="space-y-3">
          {prospects.map((p) => (
            <article
              key={p.id}
              data-testid="follow-up-card"
              className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 ${followUpDate(p)! < today ? "border-amber-300 bg-amber-50" : "bg-white"}`}
            >
              <div>
                <Link
                  href={`/prospects/${p.id}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {p.companyName}
                </Link>
                <p className="mt-1 text-xs font-semibold">
                  {followUpLabel(p, today)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {p.followUpReason ||
                    "Follow up on the recorded call outcome."}
                </p>
                {p.isFictional && (
                  <Badge variant="outline" className="mt-2">
                    Fictional example
                  </Badge>
                )}
              </div>
              <Button asChild size="sm">
                <Link href={`/prospects/${p.id}/outreach`}>Open Send Pack</Link>
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

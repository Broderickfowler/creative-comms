import Link from "next/link";
import { ArrowUpRight, Phone } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/features/prospects/components/score-badge";
import { recommendedNextAction } from "@/features/prospects/domain/call-outcome";
import { followUpLabel } from "@/features/prospects/domain/priorities";
export function PriorityCard({
  prospect: p,
  index,
}: {
  prospect: Prospect;
  index: number;
}) {
  return (
    <article
      data-testid="priority-card"
      className="rounded-xl border bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="mt-1 font-mono text-xs text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <Link
              href={`/prospects/${p.id}`}
              className="text-lg font-semibold text-primary hover:underline"
            >
              {p.companyName}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {[p.contactFirstName, p.contactLastName]
                .filter(Boolean)
                .join(" ") || "Contact not recorded"}{" "}
              · {p.icp}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{p.status}</Badge>
              {p.isFictional && (
                <Badge variant="secondary">Fictional example</Badge>
              )}
            </div>
          </div>
        </div>
        <ScoreBadge scores={p.intelligence.scores} />
      </div>
      <dl className="mt-5 grid gap-5 border-t pt-5 text-xs md:grid-cols-3">
        <div>
          <dt className="font-semibold text-muted-foreground">
            Desired Outcome
          </dt>
          <dd className="mt-2 whitespace-pre-wrap break-words leading-5">
            {p.intelligence.desiredOutcome ||
              "Research the desired outcome before outreach."}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">Money Signal</dt>
          <dd className="mt-2 whitespace-pre-wrap break-words leading-5">
            {p.intelligence.moneySignal ||
              "Not recorded — verify the economic context."}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-muted-foreground">
            Recommended Next Action
          </dt>
          <dd className="mt-2 text-sm font-semibold text-primary">
            {recommendedNextAction(p)}
          </dd>
          <dd className="mt-1 text-muted-foreground">{followUpLabel(p)}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href={`/prospects/${p.id}/call-prep`}>
            <Phone className="size-3.5" />
            Call Prep
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/prospects/${p.id}/outreach`}>Open Send Pack</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/prospects/${p.id}`}>
            Open prospect <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

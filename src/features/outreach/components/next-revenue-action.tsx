"use client";
import Link from "next/link";
import { ArrowUpRight, Copy, Check } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import { Button } from "@/components/ui/button";
import { SaveFeedback } from "@/components/forms/fields";
import { generateOutreachPack } from "../domain/messages";
import { useOutreachActions } from "../use-outreach-actions";
export function NextRevenueAction({ prospect: p }: { prospect: Prospect }) {
  const pack = generateOutreachPack(p);
  const actions = useOutreachActions(p);
  return (
    <section
      data-testid="next-revenue-action"
      className="mb-6 space-y-4 rounded-xl border border-primary/25 bg-secondary p-5"
    >
      <div>
        <h2 className="eyebrow">NEXT REVENUE ACTION</h2>
        <p
          className="mt-2 text-xl font-semibold text-primary"
          data-testid="revenue-action-label"
        >
          {pack.nextRevenueAction}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {pack.kind} · {pack.offer.name}
        </p>
      </div>
      {pack.messages.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/prospects/${p.id}/outreach`}>
                Open Send Pack <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={actions.busy}
              onClick={() => void actions.copy(pack.primaryEmail)}
            >
              <Copy className="size-3.5" />
              Copy Email
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={actions.busy}
              onClick={() => void actions.copy("WhatsApp Message")}
            >
              Copy WhatsApp
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={actions.busy}
              onClick={() => void actions.copy("LinkedIn DM")}
            >
              Copy DM
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={actions.busy}
              onClick={() => actions.markSent(pack.primaryEmail)}
            >
              <Check className="size-3.5" />
              Mark Sent
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Mark Sent records the {pack.primaryEmail} after you send it
            yourself. Copying prepares a draft; it does not deliver it.
          </p>
        </>
      ) : (
        <p className="text-sm">{pack.cta}</p>
      )}
      <SaveFeedback error={actions.error} message={actions.feedback} />
    </section>
  );
}

"use client";
import { useProspects } from "@/features/prospects/use-prospects";
import { WorkspaceGate } from "@/features/prospects/components/workspace-gate";
import { MissingProspect } from "@/features/prospects/components/missing-prospect";
import { ProspectHeading } from "@/features/prospects/components/prospect-heading";
import { generateOutreachPack, currentCallId } from "./domain/messages";
import { NextRevenueAction } from "./components/next-revenue-action";
import { MessageEditor } from "./components/message-editor";
import { FollowUpEditor } from "./components/follow-up-editor";
import { OutreachActivityList } from "./components/outreach-activity";
export function OutreachPage({ id }: { id: string }) {
  const store = useProspects();
  const p = store.prospects.find((p) => p.id === id);
  if (!p)
    return (
      <WorkspaceGate {...store}>
        <MissingProspect />
      </WorkspaceGate>
    );
  const pack = generateOutreachPack(p);
  const primary = [pack.primaryEmail, "WhatsApp Message", "LinkedIn DM"];
  const ready = pack.messages.filter((m) => primary.includes(m.messageType));
  const other = pack.messages.filter((m) => !primary.includes(m.messageType));
  return (
    <WorkspaceGate {...store}>
      <ProspectHeading prospect={p} title="Outreach" />
      <NextRevenueAction prospect={p} />
      <section
        className="mb-6 space-y-5 rounded-xl border bg-white p-5"
        data-testid="send-pack"
      >
        <h2 className="text-xl font-semibold">{pack.kind}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow">RECOMMENDED OFFER</h3>
            <p className="mt-2 font-semibold" data-testid="recommended-offer">
              {pack.offer.name}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {pack.offer.reason}
            </p>
          </div>
          <div>
            <h3 className="eyebrow">RECOMMENDED DEMO</h3>
            <p
              className="mt-2 text-sm leading-6"
              data-testid="recommended-demo"
            >
              {pack.recommendedDemo}
            </p>
          </div>
          <div>
            <h3 className="eyebrow">RECOMMENDED CTA</h3>
            <p className="mt-2 text-sm leading-6">{pack.cta}</p>
          </div>
          <div>
            <h3 className="eyebrow">VERIFICATION NEEDED</h3>
            <p className="mt-2 text-sm leading-6">
              {p.intelligence.verificationNeeded ||
                "Confirm desired outcome, owner, budget, and scope before making claims."}
            </p>
          </div>
        </div>
        {pack.messages.length > 0 && (
          <p className="text-xs leading-5 text-muted-foreground">
            Drafts use recorded context. Review claims and add the actual demo
            link or attachment before manually sending a demo. A recommended
            demo is an outline, not an attached asset.
          </p>
        )}
      </section>
      {pack.messages.length > 0 && (
        <>
          <div className="mb-6 grid items-start gap-4 lg:grid-cols-2">
            {ready
              .sort(
                (a, b) =>
                  primary.indexOf(a.messageType) -
                  primary.indexOf(b.messageType),
              )
              .map((m) => (
                <MessageEditor
                  key={`${m.messageType}:${currentCallId(p)}`}
                  prospect={p}
                  generated={m}
                />
              ))}
          </div>
          <details className="mb-6 rounded-xl border bg-white p-5">
            <summary className="cursor-pointer font-semibold">
              Other channel drafts & follow-ups ({other.length})
            </summary>
            <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
              {other.map((m) => (
                <MessageEditor
                  key={`${m.messageType}:${currentCallId(p)}`}
                  prospect={p}
                  generated={m}
                />
              ))}
            </div>
          </details>
        </>
      )}
      <FollowUpEditor key={id} prospect={p} />
      <OutreachActivityList prospect={p} />
    </WorkspaceGate>
  );
}

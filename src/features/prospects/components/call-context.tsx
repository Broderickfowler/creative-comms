import type { Prospect } from "@/types/prospect";
import { ScoreBadge } from "./score-badge";
export function CallContext({ prospect: p }: { prospect: Prospect }) {
  return (
    <section
      aria-label="Call context"
      className="mb-6 rounded-xl border bg-white p-5"
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Company</p>
          <p className="mt-1 font-medium">{p.companyName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Contact · Role</p>
          <p className="mt-1 text-sm">
            {[p.contactFirstName, p.contactLastName]
              .filter(Boolean)
              .join(" ") || "Not recorded"}
          </p>
          <p className="text-xs text-muted-foreground">
            {p.contactRole || "Role not recorded"}
          </p>
        </div>
        <div className="xl:col-span-2">
          <p className="mb-1 text-xs text-muted-foreground">
            Opportunity Score
          </p>
          <ScoreBadge scores={p.intelligence.scores} />
        </div>
      </div>
      <dl className="mt-5 grid gap-5 border-t pt-5 text-sm sm:grid-cols-3">
        {[
          { label: "Desired Outcome", value: p.intelligence.desiredOutcome },
          { label: "Money Signal", value: p.intelligence.moneySignal },
          {
            label: "Sekairos Opportunity",
            value: p.intelligence.sekairosOpportunity,
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-semibold text-primary">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
              {value || "Not recorded — verify on the call."}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

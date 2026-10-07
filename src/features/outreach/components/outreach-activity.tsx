import type { Prospect } from "@/types/prospect";
import { Badge } from "@/components/ui/badge";
export function OutreachActivityList({ prospect: p }: { prospect: Prospect }) {
  return (
    <section
      className="mt-6 rounded-xl border bg-white p-5"
      data-testid="outreach-activity"
    >
      <h2 className="text-lg font-semibold">Outreach Activity</h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Last Outreach At:{" "}
        <span data-testid="last-outreach-at">
          {p.lastOutreachAt
            ? new Date(p.lastOutreachAt).toLocaleString()
            : "No outreach marked sent"}
        </span>
      </p>
      {!p.outreachActivities.length && (
        <p className="mt-4 text-sm text-muted-foreground">
          Edit or copy a message to create an activity record.
        </p>
      )}
      <div className="mt-4 space-y-3">
        {[...p.outreachActivities].reverse().map((a) => (
          <details
            key={a.id}
            className="rounded-lg border p-3"
            data-testid="activity-record"
          >
            <summary className="cursor-pointer text-sm">
              <Badge variant="outline">{a.status}</Badge>{" "}
              <span className="ml-2">
                {a.messageType} · {a.channel}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(a.sentAt ?? a.createdAt).toLocaleString()}
              </span>
            </summary>
            <div className="mt-3 space-y-2 text-xs">
              <p>Created: {new Date(a.createdAt).toLocaleString()}</p>
              {a.sentAt && <p>Sent: {new Date(a.sentAt).toLocaleString()}</p>}
              {a.subject && <p className="font-semibold">{a.subject}</p>}
              <p className="whitespace-pre-wrap break-words leading-5">
                {a.messageBody}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

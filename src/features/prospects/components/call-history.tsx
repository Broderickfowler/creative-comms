import type { CallDebrief } from "@/types/prospect";
const flags = [
  "notInterested",
  "answered",
  "decisionMakerReached",
  "meaningfulConversation",
  "emailRequested",
  "demoRequested",
  "meetingRequested",
  "proposalRequested",
  "budgetMentioned",
  "followUpRequired",
] as const;
const textFields = [
  "currentProcess",
  "primaryProblem",
  "desiredOutcome",
  "moneySignal",
  "timing",
  "currentTechnology",
  "objection",
  "followUpDate",
  "nextAction",
  "notes",
] as const;
function label(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
export function CallHistory({ calls }: { calls: CallDebrief[] }) {
  return (
    <section className="mt-9">
      <h2 className="mb-4 text-xl font-semibold">Call history</h2>
      {calls.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No calls logged yet. Prepare the conversation, then record the
          outcome.
        </p>
      ) : (
        <div className="space-y-3">
          {[...calls].reverse().map((call) => (
            <details key={call.id} className="rounded-xl border bg-white p-5">
              <summary className="cursor-pointer text-sm font-medium">
                {new Date(call.createdAt).toLocaleString()} ·{" "}
                {call.recommendedNextAction}
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <dl className="space-y-2 text-xs">
                  {flags.map((key) => (
                    <div key={key} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{label(key)}</dt>
                      <dd>{call[key] ? "Yes" : "No"}</dd>
                    </div>
                  ))}
                </dl>
                <dl className="space-y-3 text-xs">
                  {textFields.map((key) => (
                    <div key={key}>
                      <dt className="font-medium">{label(key)}</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                        {call[key] || "Not recorded"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}

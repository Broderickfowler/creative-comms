import type { Prospect } from "@/types/prospect";
import type { OutreachActivity, OutreachMessage } from "@/types/outreach";
export function outreachStatusAfterSent(p: Prospect): Prospect["status"] {
  return [
    "Proposal",
    "Meeting Requested",
    "Meeting Booked",
    "Won",
    "Lost",
  ].includes(p.status)
    ? p.status
    : "Follow-Up";
}
export function applyOutreach(
  p: Prospect,
  message: OutreachMessage,
  status: OutreachActivity["status"],
  id: string,
  now: string,
): Prospect {
  if (p.status === "Lost" || p.status === "Won")
    throw new Error("Outreach is suppressed for this prospect.");
  const sourceCallId = p.calls.at(-1)?.id ?? null;
  const existing = p.outreachActivities.findLast(
    (a) =>
      a.sourceCallId === sourceCallId && a.messageType === message.messageType,
  );
  if (
    existing?.status === "Sent" &&
    status === "Sent" &&
    existing.subject === message.subject &&
    existing.messageBody === message.messageBody
  )
    return p;
  const reuse = existing?.status !== "Sent" ? existing : undefined;
  const activity: OutreachActivity = {
    ...message,
    id: reuse?.id ?? id,
    prospectId: p.id,
    sourceCallId,
    createdAt: reuse?.createdAt ?? now,
    sentAt: status === "Sent" ? now : null,
    status,
  };
  const activities = reuse
    ? p.outreachActivities.map((a) => (a.id === reuse.id ? activity : a))
    : [...p.outreachActivities, activity];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  return {
    ...p,
    outreachActivities: activities,
    updatedAt: now,
    ...(status === "Sent"
      ? {
          lastOutreachAt: now,
          status: outreachStatusAfterSent(p),
          nextFollowUpDate: p.nextFollowUpDate || tomorrowDate,
          followUpReason:
            p.followUpReason ||
            `Confirm receipt of ${message.messageType} and agree the next step.`,
        }
      : {}),
  };
}

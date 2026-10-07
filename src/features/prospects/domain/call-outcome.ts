import type {
  CallDebrief,
  DebriefFields,
  NextAction,
  Prospect,
  ProspectStatus,
} from "@/types/prospect";
import { opportunityScore } from "./scoring";

export function statusAfterCall(
  current: ProspectStatus,
  call: DebriefFields,
): ProspectStatus {
  if (current === "Won") return "Won";
  if (current === "Lost" || call.notInterested) return "Lost";
  if (call.proposalRequested) return "Proposal";
  if (call.meetingRequested) return "Meeting Requested";
  if (call.demoRequested) return "Demo Requested";
  const stronger: ProspectStatus[] = [
    "Demo Requested",
    "Meeting Requested",
    "Meeting Booked",
    "Proposal",
    "Won",
    "Lost",
  ];
  if (call.meaningfulConversation && !stronger.includes(current))
    return "Contacted";
  return current;
}
export function nextActionForCall(
  status: ProspectStatus,
  score: number,
  call?: DebriefFields,
): NextAction {
  if (status === "Lost" || call?.notInterested) return "Disqualify";
  if (status === "Won") return "Nurture";
  if (call?.proposalRequested || status === "Proposal")
    return "Create Proposal";
  if (
    call?.meetingRequested ||
    status === "Meeting Requested" ||
    status === "Meeting Booked"
  )
    return "Schedule Meeting";
  if (call?.demoRequested || status === "Demo Requested") return "Send Demo";
  if (call?.emailRequested) return "Send Email";
  if (call?.followUpRequired || (call && !call.answered))
    return "Call Tomorrow";
  return score >= 70 ? "Call Tomorrow" : "Nurture";
}
export function recommendedNextAction(prospect: Prospect): NextAction {
  const callId = prospect.calls.at(-1)?.id ?? null;
  const action = nextActionForCall(
    prospect.status,
    opportunityScore(prospect.intelligence.scores),
    prospect.calls.at(-1),
  );
  const fulfilled = prospect.outreachActivities.some(
    (a) =>
      a.sourceCallId === callId &&
      a.status === "Sent" &&
      ((action === "Send Demo" && a.messageType === "Demo Email") ||
        (action === "Send Email" &&
          a.messageType === "Post-Call Follow-Up Email")),
  );
  return fulfilled ? "Call Tomorrow" : action;
}
export function applyDebrief(
  prospect: Prospect,
  fields: DebriefFields,
  id: string,
  now: string,
): Prospect {
  const status = statusAfterCall(prospect.status, fields);
  const call: CallDebrief = {
    ...fields,
    followUpDate: fields.followUpRequired ? fields.followUpDate : "",
    id,
    createdAt: now,
    recommendedNextAction: nextActionForCall(
      status,
      opportunityScore(prospect.intelligence.scores),
      fields,
    ),
  };
  return {
    ...prospect,
    status,
    updatedAt: now,
    calls: [...prospect.calls, call],
    ...(fields.followUpRequired
      ? {
          nextFollowUpDate: fields.followUpDate,
          followUpReason: fields.nextAction || "Follow up on the call outcome.",
        }
      : {}),
    intelligence: {
      ...prospect.intelligence,
      desiredOutcome:
        fields.desiredOutcome.trim() || prospect.intelligence.desiredOutcome,
      moneySignal:
        fields.moneySignal.trim() || prospect.intelligence.moneySignal,
      timingSignal: fields.timing.trim() || prospect.intelligence.timingSignal,
      operationalFriction:
        fields.primaryProblem.trim() ||
        prospect.intelligence.operationalFriction,
    },
  };
}

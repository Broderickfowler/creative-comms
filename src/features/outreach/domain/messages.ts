import type { Prospect } from "@/types/prospect";
import type {
  MessageType,
  OutreachMessage,
  OutreachPack,
  PackKind,
} from "@/types/outreach";
import { recommendedOffer } from "./offers";
import { recommendedNextAction } from "@/features/prospects/domain/call-outcome";
export const currentCallId = (p: Prospect) => p.calls.at(-1)?.id ?? null;
export function outreachAllowed(p: Prospect) {
  return p.status !== "Lost" && p.status !== "Won";
}
export function savedMessage(
  p: Prospect,
  type: MessageType,
): OutreachMessage | null {
  const records = p.outreachActivities.filter(
    (a) => a.messageType === type && a.sourceCallId === currentCallId(p),
  );
  return records.at(-1) ?? null;
}
export function hasSent(p: Prospect, type: MessageType) {
  return p.outreachActivities.some(
    (a) =>
      a.messageType === type &&
      a.sourceCallId === currentCallId(p) &&
      a.status === "Sent",
  );
}
function compact(text: string) {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 170)
    .replace(/[.!?]+$/, "");
}
function outcome(p: Prospect): {
  kind: PackKind;
  primaryEmail: MessageType;
  cta: string;
  action: string;
} {
  const call = p.calls.at(-1);
  const action = recommendedNextAction(p);
  let kind: PackKind = "Initial Outreach",
    primaryEmail: MessageType = "Initial Email",
    cta =
      "Would a short conversation help confirm whether this is worth exploring?";
  if (call?.proposalRequested || p.status === "Proposal") {
    kind = "Proposal Acknowledgment";
    primaryEmail = "Post-Call Follow-Up Email";
    cta =
      "Can we confirm scope, owner, budget, and the decision process before I prepare a proposal?";
  } else if (
    call?.meetingRequested ||
    p.status === "Meeting Requested" ||
    p.status === "Meeting Booked"
  ) {
    kind = "Scheduling Response";
    primaryEmail = "Post-Call Follow-Up Email";
    cta = "What two times work for a short conversation, and who should join?";
  } else if (call?.demoRequested || p.status === "Demo Requested") {
    kind = "Demo Send Pack";
    primaryEmail = "Demo Email";
    cta =
      "Would you prefer a short walkthrough or a live demo focused on this workflow?";
  } else if (call?.emailRequested) {
    kind = "Information Send Pack";
    primaryEmail = "Post-Call Follow-Up Email";
    cta =
      "Is this the right priority, and who should join a short next conversation?";
  } else if (call?.meaningfulConversation) {
    kind = "Relevant Follow-Up";
    primaryEmail = "Post-Call Follow-Up Email";
    cta = "Is this the right next step to explore together?";
  }
  if (hasSent(p, primaryEmail)) {
    kind = "Follow-Up Pack";
    primaryEmail = hasSent(p, "Follow-Up Email 1")
      ? "Follow-Up Email 2"
      : "Follow-Up Email 1";
    cta = "Is this still a priority, or should I leave it here for now?";
  }
  return { kind, primaryEmail, cta, action };
}
export function generateOutreachPack(p: Prospect): OutreachPack {
  const offer = recommendedOffer(p);
  const base = outcome(p);
  const demo =
    p.callPrep?.demoToShow ||
    (p.icp === "Soccer Club / Academy"
      ? "A fictional parent inquiry moving from trial interest to an owned enrollment follow-up."
      : p.icp === "College Athletics"
        ? "A fictional sponsor inquiry moving through an accountable institutional handoff."
        : "A fictional customer inquiry moving from prospect context to an owned next action.");
  if (!outreachAllowed(p))
    return {
      kind: "Outreach Suppressed",
      primaryEmail: base.primaryEmail,
      nextRevenueAction:
        p.status === "Lost"
          ? "DISQUALIFY / STOP OUTREACH"
          : "CLOSED / NO OUTREACH",
      offer,
      recommendedDemo: demo,
      cta: "No persuasive follow-up is generated for closed or disqualified prospects.",
      messages: [],
    };
  const i = p.intelligence,
    call = p.calls.at(-1),
    name = p.contactFirstName.trim() || "there";
  const vision =
    compact(i.visionSignal || i.desiredOutcome) ||
    "a clearer path from interest to a next step";
  const friction = compact(call?.primaryProblem || i.operationalFriction);
  const desired = compact(call?.desiredOutcome || i.desiredOutcome);
  const focus = compact(i.sekairosOpportunity) || offer.name;
  const role = p.contactRole
    ? `Would this sit with you as ${compact(p.contactRole)}, or with someone else?`
    : "Who would own the next step?";
  const opening = `Hi ${name},`;
  const direction = `Is this still the direction for ${p.companyName}: ${vision}?`;
  const constraint = friction
    ? `Is this still the main friction: ${friction}? We could scope one practical change.`
    : "Which operational step is taking more effort than it should?";
  const impact = desired
    ? `The outcome to work toward: ${desired}. We could test whether one change frees capacity to support it.`
    : "The aim would be to free capacity for the work that matters, with the impact verified first.";
  const economics = i.moneySignal
    ? `Can we verify the economics behind this signal: ${compact(i.moneySignal)}?`
    : "We should confirm the value and scope before choosing an approach.";
  const timing = i.timingSignal
    ? `Does this still shape the timing: ${compact(i.timingSignal)}?`
    : "Is the timing right to explore this?";
  const recap = call?.meaningfulConversation
    ? "Thanks for the conversation."
    : "A short note on the possible next step:";
  const request =
    base.kind === "Proposal Acknowledgment"
      ? "I can prepare a proposal once we confirm the scope."
      : base.kind === "Scheduling Response"
        ? "Let's find a time to talk through the scope."
        : base.kind === "Information Send Pack"
          ? `The starting point I'd suggest is ${offer.name}.`
          : `A useful demo would focus on ${focus.charAt(0).toLowerCase() + focus.slice(1)}.`;
  const initial = [
    opening,
    direction,
    constraint,
    `${impact} ${role}`,
    "Would a brief conversation be useful?",
    "— Sekairos",
  ].join("\n\n");
  const post = [
    opening,
    recap,
    direction,
    request,
    constraint,
    `${impact} ${economics}`,
    base.cta,
    "— Sekairos",
  ].join("\n\n");
  const demoEmail = [
    opening,
    recap,
    direction,
    `A useful demo for ${p.companyName} would focus on ${focus.charAt(0).toLowerCase() + focus.slice(1)}.`,
    constraint,
    `${impact} ${economics}`,
    `${timing} ${role}`,
    "Would you prefer a short walkthrough or a live demo focused on this workflow?",
    "— Sekairos",
  ].join("\n\n");
  const short = `${opening} ${recap} ${desired ? `Is ${desired.charAt(0).toLowerCase() + desired.slice(1)} still the priority at ${p.companyName}?` : direction} ${base.cta}`;
  const messages: OutreachMessage[] = [
    {
      messageType: "Initial Email",
      channel: "Email",
      subject: `A practical next step for ${p.companyName}`,
      messageBody: initial,
    },
    {
      messageType: "Post-Call Follow-Up Email",
      channel: "Email",
      subject: `${base.kind === "Scheduling Response" ? "Finding a time" : base.kind === "Proposal Acknowledgment" ? "Confirming proposal scope" : "Next step"} · ${p.companyName}`,
      messageBody: post,
    },
    {
      messageType: "Demo Email",
      channel: "Email",
      subject: `A focused demo for ${p.companyName}`,
      messageBody: demoEmail,
    },
    {
      messageType: "Follow-Up Email 1",
      channel: "Email",
      subject: `Still a priority for ${p.companyName}?`,
      messageBody: [
        opening,
        direction,
        constraint,
        timing,
        "Is a short conversation useful, or should I leave this here for now?",
        "— Sekairos",
      ].join("\n\n"),
    },
    {
      messageType: "Follow-Up Email 2",
      channel: "Email",
      subject: `Close the loop · ${p.companyName}`,
      messageBody: [
        opening,
        `I'll close the loop on ${offer.name} for ${p.companyName}.`,
        desired
          ? `If ${desired.charAt(0).toLowerCase() + desired.slice(1)} becomes a priority, we can revisit the scope.`
          : "If the priority changes, we can revisit the scope.",
        "No need to respond if this is not relevant.",
        "— Sekairos",
      ].join("\n\n"),
    },
    {
      messageType: "WhatsApp Message",
      channel: "WhatsApp",
      subject: "",
      messageBody: short,
    },
    {
      messageType: "LinkedIn DM",
      channel: "LinkedIn",
      subject: "",
      messageBody: short,
    },
    {
      messageType: "Instagram / Facebook DM",
      channel: "Instagram / Facebook",
      subject: "",
      messageBody: short,
    },
    {
      messageType: "Voicemail",
      channel: "Phone",
      subject: "",
      messageBody: `Hi ${name}, this is Sekairos calling about ${p.companyName}. ${desired ? `I'd like to understand whether ${desired.charAt(0).toLowerCase() + desired.slice(1)} is a current priority.` : "I'd like to understand one operational priority."} ${role} We can use a short conversation to decide if there is a useful next step. No obligation.`,
    },
  ];
  return {
    kind: base.kind,
    primaryEmail: base.primaryEmail,
    nextRevenueAction:
      base.kind === "Follow-Up Pack"
        ? "FOLLOW UP"
        : base.kind === "Demo Send Pack"
          ? "SEND DEMO"
          : base.kind === "Information Send Pack"
            ? "SEND INFORMATION"
            : base.kind === "Scheduling Response"
              ? "PREPARE SCHEDULING RESPONSE"
              : base.kind === "Proposal Acknowledgment"
                ? "ACKNOWLEDGE PROPOSAL REQUEST"
                : base.action.toUpperCase(),
    offer,
    recommendedDemo: demo,
    cta: base.cta,
    messages,
  };
}
export function resolveMessage(
  p: Prospect,
  type: MessageType,
): OutreachMessage {
  const generated = generateOutreachPack(p).messages.find(
    (m) => m.messageType === type,
  );
  if (!generated) throw new Error("Outreach is suppressed for this prospect.");
  return savedMessage(p, type) ?? generated;
}
export function copyText(message: OutreachMessage) {
  return message.subject
    ? `Subject: ${message.subject}\n\n${message.messageBody}`
    : message.messageBody;
}

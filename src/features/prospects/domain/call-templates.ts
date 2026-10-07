import type { CallPrep, ICP, Prospect } from "@/types/prospect";
const templates: Record<
  ICP,
  Omit<CallPrep, "opener" | "reasonForCall"> & { focus: string }
> = {
  "Founder / Local Business": {
    focus: "a repeatable prospect and follow-up workflow",
    discoveryQuestions: [
      "How do new customers find you today?",
      "What happens between a new inquiry and a booked conversation?",
      "Where does follow-up slow down or get lost?",
      "What would one additional qualified customer be worth?",
      "Who would own a change, and when could you evaluate it?",
    ],
    likelyObjections:
      "We already have a CRM; we do not have time for another tool. Ask which step still creates manual work.",
    idealNextStep:
      "Agree on one bottleneck and schedule a short workflow demonstration.",
    claimsToAvoid:
      "Do not promise guaranteed revenue, conversion rates, or integrations that have not been verified.",
    demoToShow:
      "A short prospect-to-next-action walkthrough; validate relevance before promising a broader solution.",
  },
  "Soccer Club / Academy": {
    focus: "an enrollment and parent follow-up workflow",
    discoveryQuestions: [
      "How do parents inquire about tryouts or enrollment?",
      "How are trial sessions and follow-up tracked today?",
      "Where do interested families drop out of the process?",
      "What is the value of an additional enrolled player, and is budget available?",
      "When is your next intake window, and who approves process changes?",
    ],
    likelyObjections:
      "Our coaches are already stretched; parents prefer WhatsApp. Explore the existing communication habits before proposing a change.",
    idealNextStep:
      "Map one enrollment handoff with the academy decision maker and agree on a demonstration.",
    claimsToAvoid:
      "Do not promise enrollment growth, sports outcomes, safeguarding compliance, or access to player information.",
    demoToShow:
      "Use fictional parent-inquiry context to demonstrate follow-up ownership and timing; no student or player data.",
  },
  "College Athletics": {
    focus: "a clear partner-opportunity and operational handoff workflow",
    discoveryQuestions: [
      "Which revenue or partnership outcome is most important this season?",
      "How are sponsor inquiries and internal handoffs tracked?",
      "Which approval or follow-up step creates the most friction?",
      "Who controls the relevant budget, and what procurement steps apply?",
      "Which seasonal deadline matters, and who should join the next conversation?",
    ],
    likelyObjections:
      "Procurement is complex; we already use institutional systems. Ask where handoffs still fail without assuming replacement is possible.",
    idealNextStep:
      "Identify the authorized stakeholder and schedule a scoped discovery meeting.",
    claimsToAvoid:
      "Do not claim institutional approval, NCAA compliance, procurement clearance, integrations, or access to athlete records.",
    demoToShow:
      "A fictional sponsor-opportunity workflow focused on context, an owner, and the next action.",
  },
};
export function callTemplate(prospect: Prospect): CallPrep {
  const { focus, ...template } = templates[prospect.icp];
  const firstName = prospect.contactFirstName || "there";
  const desired =
    prospect.intelligence.desiredOutcome ||
    "understand your team's current priorities";
  return {
    ...structuredClone(template),
    opener: `Hi ${firstName}, I'm calling from Sekairos. I'm reaching out to ${prospect.companyName} to understand whether ${focus} could help you ${desired.charAt(0).toLowerCase() + desired.slice(1)}. Would you have 30 seconds to see if a conversation is relevant?`,
    reasonForCall:
      prospect.intelligence.sekairosOpportunity ||
      `Explore whether ${focus} addresses a real operational need at ${prospect.companyName}.`,
  };
}

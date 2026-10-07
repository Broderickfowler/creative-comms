export const outcomeFields = [
  { key: "answered", label: "Answered" },
  { key: "notInterested", label: "Not interested / Disqualified" },
  { key: "decisionMakerReached", label: "Decision Maker Reached" },
  { key: "meaningfulConversation", label: "Meaningful Conversation" },
  { key: "emailRequested", label: "Email Requested" },
  { key: "demoRequested", label: "Demo Requested" },
  { key: "meetingRequested", label: "Meeting Requested" },
  { key: "proposalRequested", label: "Proposal Requested" },
  { key: "budgetMentioned", label: "Budget Mentioned" },
  { key: "followUpRequired", label: "Follow-Up Required" },
] as const;
export const conversationFields = [
  { key: "currentProcess", label: "Current Process" },
  { key: "primaryProblem", label: "Primary Problem" },
  { key: "desiredOutcome", label: "Desired Outcome" },
  { key: "moneySignal", label: "Money Signal" },
  { key: "timing", label: "Timing" },
  { key: "currentTechnology", label: "Current Technology" },
  { key: "objection", label: "Objection" },
  { key: "nextAction", label: "Next Action" },
  { key: "notes", label: "Notes" },
] as const;

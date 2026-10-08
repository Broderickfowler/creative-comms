import type { SalesAsset } from "./sales-asset";
import type { BriefCustomization } from "./opportunity-brief";
import type { OutreachActivity } from "./outreach";
export const ICP_VALUES = [
  "Founder / Local Business",
  "Soccer Club / Academy",
  "College Athletics",
] as const;
export const PROSPECT_STATUSES = [
  "New",
  "Researching",
  "Qualified",
  "Call Now",
  "Contacted",
  "Demo Requested",
  "Follow-Up",
  "Meeting Requested",
  "Meeting Booked",
  "Proposal",
  "Won",
  "Lost",
  "Nurture",
] as const;
export type ICP = (typeof ICP_VALUES)[number];
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];
export type PriorityClassification =
  "CALL NOW" | "ACTIVE PURSUIT" | "NURTURE" | "LOW PRIORITY";
export const NEXT_ACTIONS = [
  "Send Demo",
  "Send Email",
  "Call Tomorrow",
  "Schedule Meeting",
  "Create Proposal",
  "Nurture",
  "Disqualify",
] as const;
export type NextAction = (typeof NEXT_ACTIONS)[number];
export interface Scores {
  desire: number;
  vision: number;
  money: number;
  friction: number;
  timing: number;
  sekairosFit: number;
}
export interface Intelligence {
  desiredOutcome: string;
  visionSignal: string;
  moneySignal: string;
  operationalFriction: string;
  timingSignal: string;
  sekairosOpportunity: string;
  verificationNeeded: string;
  scores: Scores;
}
export interface ProspectFields {
  companyName: string;
  website: string;
  contactFirstName: string;
  contactLastName: string;
  contactRole: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
  source: string;
  icp: ICP;
  status: ProspectStatus;
  notes: string;
  estimatedOpportunityValue: number;
}
export interface CallPrep {
  opener: string;
  reasonForCall: string;
  discoveryQuestions: [string, string, string, string, string];
  likelyObjections: string;
  idealNextStep: string;
  claimsToAvoid: string;
  demoToShow: string;
}
export interface DebriefFields {
  notInterested: boolean;
  answered: boolean;
  decisionMakerReached: boolean;
  meaningfulConversation: boolean;
  emailRequested: boolean;
  demoRequested: boolean;
  meetingRequested: boolean;
  proposalRequested: boolean;
  budgetMentioned: boolean;
  followUpRequired: boolean;
  currentProcess: string;
  primaryProblem: string;
  desiredOutcome: string;
  moneySignal: string;
  timing: string;
  currentTechnology: string;
  objection: string;
  followUpDate: string;
  nextAction: string;
  notes: string;
}
export interface CallDebrief extends DebriefFields {
  id: string;
  createdAt: string;
  recommendedNextAction: NextAction;
}
export interface Prospect extends ProspectFields {
  id: string;
  createdAt: string;
  updatedAt: string;
  isFictional: boolean;
  intelligence: Intelligence;
  callPrep: CallPrep | null;
  calls: CallDebrief[];
  brief: BriefCustomization | null;
  outreachActivities: OutreachActivity[];
  lastOutreachAt: string | null;
  nextFollowUpDate: string | null;
  followUpReason: string;
}
export interface Workspace {
  version: 3;
  prospects: Prospect[];
  assets: SalesAsset[];
}

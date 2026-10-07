export const MESSAGE_TYPES = [
  "Initial Email",
  "Post-Call Follow-Up Email",
  "Demo Email",
  "Follow-Up Email 1",
  "Follow-Up Email 2",
  "WhatsApp Message",
  "LinkedIn DM",
  "Instagram / Facebook DM",
  "Voicemail",
] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];
export const OUTREACH_CHANNELS = [
  "Email",
  "WhatsApp",
  "LinkedIn",
  "Instagram / Facebook",
  "Phone",
] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];
export interface OutreachMessage {
  messageType: MessageType;
  channel: OutreachChannel;
  subject: string;
  messageBody: string;
}
export interface OutreachActivity extends OutreachMessage {
  id: string;
  prospectId: string;
  createdAt: string;
  sentAt: string | null;
  status: "Draft" | "Prepared" | "Sent";
  sourceCallId: string | null;
}
export type PackKind =
  | "Demo Send Pack"
  | "Information Send Pack"
  | "Scheduling Response"
  | "Proposal Acknowledgment"
  | "Relevant Follow-Up"
  | "Initial Outreach"
  | "Follow-Up Pack"
  | "Outreach Suppressed";
export interface OfferRecommendation {
  name: string;
  reason: string;
}
export interface OutreachPack {
  kind: PackKind;
  primaryEmail: MessageType;
  nextRevenueAction: string;
  offer: OfferRecommendation;
  recommendedDemo: string;
  cta: string;
  messages: OutreachMessage[];
}

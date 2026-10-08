import { MESSAGE_TYPES, OUTREACH_CHANNELS } from "@/types/outreach";
import { z } from "zod";
import { ASSET_TYPES, ASSET_ICPS, ASSET_STATUSES } from "@/types/sales-asset";
import {
  validAssetUrl,
  isExampleUrl,
} from "@/features/sales-assets/domain/assets";
import { seedSalesAssets } from "@/data/seed-sales-assets";
import {
  ICP_VALUES,
  PROSPECT_STATUSES,
  NEXT_ACTIONS,
  type Workspace,
} from "@/types/prospect";
const text = z.string();
const boolean = z.boolean();
const date = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid timestamp");
export const dateOnly = text.refine(
  (value) =>
    value === "" ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) &&
      new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value),
  "Invalid follow-up date",
);
export const salesAssetFieldsSchema = z.object({
  name: text.trim().min(1, "Asset name is required"),
  type: z.enum(ASSET_TYPES),
  icp: z.enum(ASSET_ICPS),
  offer: text.trim(),
  url: text
    .trim()
    .refine(
      validAssetUrl,
      "Use a valid http:// or https:// URL without credentials or spaces",
    ),
  description: text.trim(),
  useWhen: text.trim(),
  status: z.enum(ASSET_STATUSES),
});
const salesAssetSchema = salesAssetFieldsSchema
  .extend({
    id: text.min(1),
    isExample: boolean.default(false),
    createdAt: date,
    updatedAt: date,
  })
  .transform((a) => ({ ...a, isExample: isExampleUrl(a.url) }));
export const briefFieldsSchema = z.object({
  company: text.trim().min(1, "Company is required"),
  contact: text,
  industry: text,
  date: dateOnly.refine((v) => !!v, "Choose a date"),
  desiredOutcome: text,
  vision: text,
  moneyInMotion: text,
  executionFriction: text,
  whyNow: text,
  sekairosOpportunity: text,
  recommendedFirstMove: text,
  potentialBusinessImpact: text,
  verificationNeeded: text,
});
const briefSchema = z.object({
  overrides: briefFieldsSchema.partial(),
  updatedAt: date,
});
const bounded = (max: number) => z.number().int().min(0).max(max);
export const intelligenceSchema = z.object({
  desiredOutcome: text,
  visionSignal: text,
  moneySignal: text,
  operationalFriction: text,
  timingSignal: text,
  sekairosOpportunity: text,
  verificationNeeded: text,
  scores: z.object({
    desire: bounded(20),
    vision: bounded(20),
    money: bounded(25),
    friction: bounded(15),
    timing: bounded(10),
    sekairosFit: bounded(10),
  }),
});
export const prospectFieldsSchema = z.object({
  companyName: text.trim().min(1, "Company name is required"),
  website: text.refine(
    (value) => !value || /^https?:\/\/[^\s]+$/i.test(value),
    "Website must start with https:// or http://",
  ),
  contactFirstName: text,
  contactLastName: text,
  contactRole: text,
  email: text.refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid email",
  ),
  phone: text,
  industry: text,
  location: text,
  source: text,
  icp: z.enum(ICP_VALUES),
  status: z.enum(PROSPECT_STATUSES),
  notes: text,
  estimatedOpportunityValue: z.number().finite().min(0),
});
export const callPrepSchema = z.object({
  opener: text,
  reasonForCall: text,
  discoveryQuestions: z.tuple([text, text, text, text, text]),
  likelyObjections: text,
  idealNextStep: text,
  claimsToAvoid: text,
  demoToShow: text,
});
export const debriefFieldsSchema = z
  .object({
    notInterested: boolean.default(false),
    answered: boolean,
    decisionMakerReached: boolean,
    meaningfulConversation: boolean,
    emailRequested: boolean,
    demoRequested: boolean,
    meetingRequested: boolean,
    proposalRequested: boolean,
    budgetMentioned: boolean,
    followUpRequired: boolean,
    currentProcess: text,
    primaryProblem: text,
    desiredOutcome: text,
    moneySignal: text,
    timing: text,
    currentTechnology: text,
    objection: text,
    followUpDate: dateOnly,
    nextAction: text,
    notes: text,
  })
  .refine((value) => !value.followUpRequired || !!value.followUpDate, {
    message: "Choose a follow-up date",
    path: ["followUpDate"],
  });
export const outreachMessageSchema = z.object({
  messageType: z.enum(MESSAGE_TYPES),
  channel: z.enum(OUTREACH_CHANNELS),
  subject: text,
  messageBody: text,
});
const outreachActivitySchema = outreachMessageSchema
  .extend({
    id: text.min(1),
    prospectId: text.min(1),
    createdAt: date,
    sentAt: date.nullable(),
    status: z.enum(["Draft", "Prepared", "Sent"]),
    sourceCallId: text.nullable(),
  })
  .refine(
    (a) => (a.status === "Sent" ? a.sentAt !== null : a.sentAt === null),
    "Sent timestamp must match activity status",
  )
  .refine(
    (a) => a.status === "Draft" || !!a.messageBody.trim(),
    "Prepared or Sent message cannot be empty",
  );
const prospectSchema = prospectFieldsSchema.extend({
  id: text.min(1),
  createdAt: date,
  updatedAt: date,
  isFictional: boolean,
  intelligence: intelligenceSchema,
  callPrep: callPrepSchema.nullable(),
  brief: briefSchema.nullable().default(null),
  outreachActivities: z.array(outreachActivitySchema).default([]),
  lastOutreachAt: date.nullable().default(null),
  nextFollowUpDate: dateOnly.nullable().default(null),
  followUpReason: text.default(""),
  calls: z.array(
    debriefFieldsSchema.safeExtend({
      id: text.min(1),
      createdAt: date,
      recommendedNextAction: z.enum(NEXT_ACTIONS),
    }),
  ),
});
const checkedProspectSchema = prospectSchema.refine(
  (p) =>
    p.outreachActivities.every(
      (a) =>
        a.prospectId === p.id &&
        (a.sourceCallId === null ||
          p.calls.some((c) => c.id === a.sourceCallId)),
    ) &&
    new Set(p.outreachActivities.map((a) => a.id)).size ===
      p.outreachActivities.length,
  "Invalid outreach activity ownership or duplicate ids",
);
const workspaceSchema = z
  .union([
    z.object({
      version: z.union([z.literal(1), z.literal(2)]),
      prospects: z.array(checkedProspectSchema),
      assets: z.array(salesAssetSchema).default(() => seedSalesAssets()),
    }),
    z.object({
      version: z.literal(3),
      prospects: z.array(checkedProspectSchema),
      assets: z.array(salesAssetSchema),
    }),
  ])
  .refine(
    (value) =>
      new Set(value.prospects.map((p) => p.id)).size ===
        value.prospects.length &&
      new Set(value.assets.map((a) => a.id)).size === value.assets.length,
    "Duplicate prospect or asset ids",
  );
export function parseWorkspace(raw: string): Workspace {
  const parsed = workspaceSchema.parse(JSON.parse(raw));
  return { ...parsed, version: 3 };
}

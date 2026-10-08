export const BRIEF_FIELD_LABELS = {
  company: "Company",
  contact: "Contact",
  industry: "Industry",
  date: "Date",
  desiredOutcome: "DESIRED OUTCOME",
  vision: "VISION",
  moneyInMotion: "MONEY IN MOTION",
  executionFriction: "EXECUTION FRICTION",
  whyNow: "WHY NOW",
  sekairosOpportunity: "SEKAIROS OPPORTUNITY",
  recommendedFirstMove: "RECOMMENDED FIRST MOVE",
  potentialBusinessImpact: "POTENTIAL BUSINESS IMPACT",
  verificationNeeded: "VERIFICATION NEEDED",
} as const;
export type BriefField = keyof typeof BRIEF_FIELD_LABELS;
export type BriefFields = Record<BriefField, string>;
export interface BriefCustomization {
  overrides: Partial<BriefFields>;
  updatedAt: string;
}

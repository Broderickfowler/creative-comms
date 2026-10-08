import type { Prospect } from "@/types/prospect";
import type { BriefFields } from "@/types/opportunity-brief";
import { recommendedOffer } from "@/features/outreach/domain/offers";
import { localDate } from "@/features/prospects/domain/priorities";
const recorded = (value: string) => value.trim() || "Requires discovery.";
export function generateOpportunityBrief(p: Prospect): BriefFields {
  return {
    company: p.companyName,
    contact: recorded(
      [p.contactFirstName, p.contactLastName].filter(Boolean).join(" ") +
        (p.contactRole ? ` · ${p.contactRole}` : ""),
    ),
    industry: recorded(p.industry),
    date: localDate(new Date(p.brief?.updatedAt ?? p.updatedAt)),
    desiredOutcome: recorded(p.intelligence.desiredOutcome),
    vision: recorded(p.intelligence.visionSignal),
    moneyInMotion: recorded(p.intelligence.moneySignal),
    executionFriction: recorded(p.intelligence.operationalFriction),
    whyNow: recorded(p.intelligence.timingSignal),
    sekairosOpportunity: recorded(p.intelligence.sekairosOpportunity),
    recommendedFirstMove: recommendedOffer(p).name,
    potentialBusinessImpact: "Requires discovery.",
    verificationNeeded: recorded(p.intelligence.verificationNeeded),
  };
}
export function resolveOpportunityBrief(p: Prospect): BriefFields {
  return { ...generateOpportunityBrief(p), ...p.brief?.overrides };
}
export function briefOverrides(
  p: Prospect,
  fields: BriefFields,
): Partial<BriefFields> {
  const generated = generateOpportunityBrief(p),
    overrides: Partial<BriefFields> = {};
  for (const key of Object.keys(generated) as (keyof BriefFields)[])
    if (fields[key] !== generated[key]) overrides[key] = fields[key];
  return overrides;
}

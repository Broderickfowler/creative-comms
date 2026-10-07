import type { Prospect, ICP } from "@/types/prospect";
import type { OfferRecommendation } from "@/types/outreach";
export const ICP_OFFERS: Record<ICP, readonly string[]> = {
  "Founder / Local Business": [
    "Operational Intelligence Review",
    "Capacity Sprint",
    "Connected Lead System",
    "CRM / Follow-Up System",
  ],
  "Soccer Club / Academy": [
    "Academy Operations Review",
    "Player Enrollment System",
    "Athletic Operations Capacity Sprint",
    "Sekairos Athletics Command Center",
  ],
  "College Athletics": [
    "Athletics Technology & Capacity Audit",
    "Athletic Operations Capacity Sprint",
    "Athletics Command Center",
    "Cross-System Operations Layer",
  ],
};
export function recommendedOffer(p: Prospect): OfferRecommendation {
  const signal =
    `${p.intelligence.desiredOutcome} ${p.intelligence.operationalFriction} ${p.intelligence.sekairosOpportunity}`.toLowerCase();
  let index = 0;
  let fit = "start by verifying the operational need and the scope";
  if (p.icp === "Founder / Local Business") {
    if (/crm|follow.up/.test(signal)) {
      index = 3;
      fit = "clarify prospect ownership and follow-up";
    } else if (/lead|inquir|pipeline/.test(signal)) {
      index = 2;
      fit = "connect inquiries to an owned next step";
    } else if (/capacity|handoff|manual/.test(signal)) {
      index = 1;
      fit = "address a specific capacity constraint";
    }
  } else if (p.icp === "Soccer Club / Academy") {
    if (/enroll|parent|trial|intake/.test(signal)) {
      index = 1;
      fit = "connect enrollment inquiries to clear follow-up";
    } else if (/command|central|visibility/.test(signal)) {
      index = 3;
      fit = "make operational ownership and next actions visible";
    } else if (/capacity|handoff|manual/.test(signal)) {
      index = 2;
      fit = "scope one operational handoff or capacity bottleneck";
    }
  } else {
    if (/cross.system|integration|silo/.test(signal)) {
      index = 3;
      fit = "review friction between existing institutional systems";
    } else if (/command|visibility|sponsor|partner/.test(signal)) {
      index = 2;
      fit = "clarify partnership context and accountable handoffs";
    } else if (/capacity|handoff|manual/.test(signal)) {
      index = 1;
      fit = "scope an operational capacity constraint";
    }
  }
  return {
    name: ICP_OFFERS[p.icp][index],
    reason: `A starting point to ${fit} at ${p.companyName}. Fit, scope, and budget still need confirmation.`,
  };
}

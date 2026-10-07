import type { PriorityClassification, Scores } from "@/types/prospect";
export const SCORE_FIELDS = [
  { key: "desire", label: "DESIRE", max: 20 },
  { key: "vision", label: "VISION", max: 20 },
  { key: "money", label: "MONEY", max: 25 },
  { key: "friction", label: "FRICTION", max: 15 },
  { key: "timing", label: "TIMING", max: 10 },
  { key: "sekairosFit", label: "SEKAIROS FIT", max: 10 },
] as const;
export function opportunityScore(scores: Scores): number {
  return SCORE_FIELDS.reduce(
    (total, { key, max }) =>
      total +
      Math.min(
        max,
        Math.max(0, Math.round(Number.isFinite(scores[key]) ? scores[key] : 0)),
      ),
    0,
  );
}
export function classifyScore(total: number): PriorityClassification {
  if (total >= 85) return "CALL NOW";
  if (total >= 70) return "ACTIVE PURSUIT";
  if (total >= 55) return "NURTURE";
  return "LOW PRIORITY";
}

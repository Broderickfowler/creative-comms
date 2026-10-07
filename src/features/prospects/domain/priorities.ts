import type { Prospect, ProspectStatus } from "@/types/prospect";
import { opportunityScore } from "./scoring";
const statusRank: Record<ProspectStatus, number> = {
  "Call Now": 0,
  Proposal: 1,
  "Meeting Requested": 2,
  "Meeting Booked": 3,
  "Demo Requested": 4,
  "Follow-Up": 5,
  Qualified: 6,
  Contacted: 7,
  Researching: 8,
  New: 9,
  Nurture: 10,
  Won: 11,
  Lost: 12,
};
export function followUpDate(prospect: Prospect): string | null {
  if (prospect.nextFollowUpDate !== null)
    return prospect.nextFollowUpDate || null;
  const call = prospect.calls.at(-1);
  return call?.followUpRequired && call.followUpDate ? call.followUpDate : null;
}
export function localDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function followUpLabel(prospect: Prospect, today = localDate()): string {
  const date = followUpDate(prospect);
  if (!date) return "No follow-up scheduled";
  if (date < today) return `Overdue · ${date}`;
  if (date === today) return "Follow-up due today";
  return `Follow-up · ${date}`;
}
export function rankProspects(prospects: Prospect[]): Prospect[] {
  return [...prospects].sort(
    (a, b) =>
      opportunityScore(b.intelligence.scores) -
        opportunityScore(a.intelligence.scores) ||
      (followUpDate(a) ?? "9999-12-31").localeCompare(
        followUpDate(b) ?? "9999-12-31",
      ) ||
      statusRank[a.status] - statusRank[b.status] ||
      a.companyName.localeCompare(b.companyName) ||
      a.id.localeCompare(b.id),
  );
}

export function followUpsDue(
  prospects: Prospect[],
  today = localDate(),
): Prospect[] {
  return prospects
    .filter(
      (p) =>
        p.status !== "Won" &&
        p.status !== "Lost" &&
        !!followUpDate(p) &&
        followUpDate(p)! <= today,
    )
    .sort(
      (a, b) =>
        followUpDate(a)!.localeCompare(followUpDate(b)!) ||
        opportunityScore(b.intelligence.scores) -
          opportunityScore(a.intelligence.scores) ||
        a.companyName.localeCompare(b.companyName),
    );
}
export function pipelineCounts(prospects: Prospect[], today = localDate()) {
  return {
    priorities: prospects.filter(
      (p) => p.status !== "Won" && p.status !== "Lost",
    ).length,
    followUps: followUpsDue(prospects, today).length,
    demos: prospects.filter((p) => p.status === "Demo Requested").length,
    meetings: prospects.filter(
      (p) => p.status === "Meeting Requested" || p.status === "Meeting Booked",
    ).length,
    proposals: prospects.filter((p) => p.status === "Proposal").length,
  };
}

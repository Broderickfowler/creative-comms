import type { Prospect } from "@/types/prospect";
import type { MessageType } from "@/types/outreach";
import type { AssetMatch } from "@/types/sales-asset";
import { rankProspects } from "@/features/prospects/domain/priorities";
export type MaterialRequest =
  "Demo Requested" | "Email Requested" | "Proposal Requested";
export function materialRequest(p: Prospect): MaterialRequest | null {
  if (p.status === "Won" || p.status === "Lost") return null;
  const call = p.calls.at(-1);
  if (call?.proposalRequested || p.status === "Proposal")
    return "Proposal Requested";
  if (call?.demoRequested || p.status === "Demo Requested")
    return "Demo Requested";
  if (call?.emailRequested) return "Email Requested";
  return null;
}
export function materialWasSent(
  p: Prospect,
  request = materialRequest(p),
): boolean {
  if (!request) return false;
  const callId = p.calls.at(-1)?.id ?? null;
  const types: MessageType[] =
    request === "Demo Requested"
      ? [
          "Demo Email",
          "WhatsApp Message",
          "LinkedIn DM",
          "Instagram / Facebook DM",
        ]
      : [
          "Post-Call Follow-Up Email",
          "WhatsApp Message",
          "LinkedIn DM",
          "Instagram / Facebook DM",
        ];
  return p.outreachActivities.some(
    (a) =>
      a.sourceCallId === callId &&
      a.status === "Sent" &&
      types.includes(a.messageType),
  );
}
export function materialToSend(prospects: Prospect[]): Prospect[] {
  return rankProspects(
    prospects.filter((p) => !!materialRequest(p) && !materialWasSent(p)),
  );
}
export function materialAction(
  request: MaterialRequest,
  match: AssetMatch,
): string {
  return request === "Proposal Requested"
    ? "Prepare Proposal"
    : request === "Email Requested"
      ? "Send Information Pack"
      : match.primary
        ? "Send Demo + Opportunity Brief"
        : "Prepare Demo + Opportunity Brief";
}

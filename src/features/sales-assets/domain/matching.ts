import type { Prospect } from "@/types/prospect";
import type { AssetMatch, SalesAsset } from "@/types/sales-asset";
import { recommendedOffer } from "@/features/outreach/domain/offers";
import { materialRequest } from "./materials";
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
function tokens(value: string): Set<string> {
  return new Set(
    normalize(value)
      .split(" ")
      .filter((t) => t.length > 3)
      .map((t) =>
        t.startsWith("enroll")
          ? "enroll"
          : t.startsWith("inquir")
            ? "inquiry"
            : t.startsWith("sponsor")
              ? "sponsor"
              : t.replace(/s$/, ""),
      ),
  );
}
export function matchSalesAssets(
  p: Prospect,
  assets: SalesAsset[],
): AssetMatch {
  const offer = recommendedOffer(p).name;
  const request = materialRequest(p);
  const keywords = tokens(
    `${p.intelligence.desiredOutcome} ${p.intelligence.sekairosOpportunity}`,
  );
  const matches = assets
    .filter(
      (a) =>
        a.status === "Active" && (a.icp === p.icp || a.icp === "Universal"),
    )
    .map((a) => {
      let score = a.icp === p.icp ? 60 : 20;
      if (normalize(a.offer) === normalize(offer)) score += 70;
      const words = tokens(
        `${a.name} ${a.offer} ${a.description} ${a.useWhen}`,
      );
      for (const word of keywords) if (words.has(word)) score += 4;
      if (request === "Demo Requested")
        score += a.type === "Demo" ? 45 : a.type === "Video" ? 20 : 0;
      else if (request === "Proposal Requested")
        score +=
          a.type === "Proposal Example"
            ? 50
            : a.type === "Offer" || a.type === "PDF"
              ? 25
              : 0;
      else if (request === "Email Requested")
        score += ["PDF", "Case Study", "Offer", "Website"].includes(a.type)
          ? 25
          : 0;
      return { asset: a, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.asset.name.localeCompare(b.asset.name) ||
        a.asset.id.localeCompare(b.asset.id),
    );
  const primary = matches[0]?.asset ?? null,
    secondary = matches[1]?.asset ?? null;
  return {
    primary,
    secondary,
    reason: primary
      ? `${primary.icp === p.icp ? `Matches ${p.icp}` : "Universal material available for this ICP"}${normalize(primary.offer) === normalize(offer) ? ` and ${offer}` : "; selected by recorded outcome and opportunity context"}. ${primary.useWhen || primary.description}`
      : `No active asset matches ${p.icp}. Add or activate appropriate material in Sales Assets.`,
  };
}

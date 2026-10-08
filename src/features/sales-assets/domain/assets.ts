import type { SalesAssetFields } from "@/types/sales-asset";
import { ICP_OFFERS } from "@/features/outreach/domain/offers";
export const blankAsset: SalesAssetFields = {
  name: "",
  type: "Demo",
  icp: "Universal",
  offer: "",
  url: "",
  description: "",
  useWhen: "",
  status: "Active",
};
export const offerOptions = [
  ...new Set(Object.values(ICP_OFFERS).flat()),
].sort();
export function validAssetUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      /^https?:$/.test(url.protocol) &&
      !!url.hostname &&
      !url.username &&
      !url.password &&
      !/\s/.test(value)
    );
  } catch {
    return false;
  }
}
export function isExampleUrl(value: string): boolean {
  if (!validAssetUrl(value)) return false;
  const host = new URL(value).hostname;
  return (
    /(^|\.)(example\.(com|org|net)|[^.]+\.example)$/.test(host) ||
    host === "example"
  );
}

export function appendAssetLink(
  body: string,
  asset: { name: string; url: string },
): string {
  return body.includes(asset.url)
    ? body
    : `${body.trim()}\n\n${asset.name}\n${asset.url}`.trim();
}

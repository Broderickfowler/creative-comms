import { ICP_VALUES } from "./prospect";
export const ASSET_TYPES = [
  "Demo",
  "Website",
  "Case Study",
  "PDF",
  "Video",
  "Offer",
  "Proposal Example",
  "Other",
] as const;
export const ASSET_ICPS = [...ICP_VALUES, "Universal"] as const;
export const ASSET_STATUSES = ["Active", "Inactive"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];
export interface SalesAssetFields {
  name: string;
  type: AssetType;
  icp: (typeof ASSET_ICPS)[number];
  offer: string;
  url: string;
  description: string;
  useWhen: string;
  status: (typeof ASSET_STATUSES)[number];
}
export interface SalesAsset extends SalesAssetFields {
  id: string;
  isExample: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AssetMatch {
  primary: SalesAsset | null;
  secondary: SalesAsset | null;
  reason: string;
}

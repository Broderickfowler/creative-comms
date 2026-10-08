import type { Metadata } from "next";
import { AssetEditorPage } from "@/features/sales-assets/asset-editor-page";
export const metadata: Metadata = { title: "Create Asset" };
export default function Page() {
  return <AssetEditorPage />;
}

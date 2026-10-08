import type { Metadata } from "next";
import { AssetEditorPage } from "@/features/sales-assets/asset-editor-page";
export const metadata: Metadata = { title: "Edit Asset" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssetEditorPage id={id} />;
}

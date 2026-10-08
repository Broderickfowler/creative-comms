import type { Metadata } from "next";
import { SalesAssetsPage } from "@/features/sales-assets/sales-assets-page";
export const metadata: Metadata = { title: "Sales Assets" };
export default function Page() {
  return <SalesAssetsPage />;
}

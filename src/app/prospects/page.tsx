import type { Metadata } from "next";
import { ProspectsList } from "@/features/prospects/prospects-list";
export const metadata: Metadata = { title: "Prospects" };
export default function Page() {
  return <ProspectsList />;
}

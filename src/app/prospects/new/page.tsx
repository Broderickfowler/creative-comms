import type { Metadata } from "next";
import { CreateProspectPage } from "@/features/prospects/create-prospect-page";
export const metadata: Metadata = { title: "Create prospect" };
export default function Page() {
  return <CreateProspectPage />;
}

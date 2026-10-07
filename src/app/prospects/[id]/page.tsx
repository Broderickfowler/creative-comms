import type { Metadata } from "next";
import { ProspectDetail } from "@/features/prospects/prospect-detail";
export const metadata: Metadata = { title: "Prospect" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProspectDetail id={id} />;
}

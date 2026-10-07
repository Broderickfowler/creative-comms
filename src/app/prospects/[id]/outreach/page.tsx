import type { Metadata } from "next";
import { OutreachPage } from "@/features/outreach/outreach-page";
export const metadata: Metadata = { title: "Outreach" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OutreachPage id={id} />;
}

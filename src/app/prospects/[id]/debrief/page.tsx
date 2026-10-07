import type { Metadata } from "next";
import { CallDebriefPage } from "@/features/prospects/call-debrief-page";
export const metadata: Metadata = { title: "Call Debrief" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CallDebriefPage id={id} />;
}

import type { Metadata } from "next";
import { CallPrepPage } from "@/features/prospects/call-prep-page";
export const metadata: Metadata = { title: "Call Prep" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CallPrepPage id={id} />;
}

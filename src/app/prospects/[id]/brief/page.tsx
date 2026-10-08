import type { Metadata } from "next";
import { BriefPage } from "@/features/briefs/brief-page";
export const metadata: Metadata = { title: "Opportunity Brief" };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return <BriefPage id={id} printRequested={query.print === "1"} />;
}

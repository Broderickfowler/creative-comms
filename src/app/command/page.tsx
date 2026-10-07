import type { Metadata } from "next";
import { CommandPage } from "@/features/command/command-page";

export const metadata: Metadata = { title: "Command" };
export default function Page() {
  return <CommandPage />;
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="py-20">
      <p className="eyebrow">WORKSPACE NOT FOUND</p>
      <h1 className="mt-3 text-3xl font-semibold">
        This page is outside the workspace.
      </h1>
      <p className="mb-6 mt-3 text-muted-foreground">
        Return to Command to choose your next destination.
      </p>
      <Button asChild>
        <Link href="/command">Back to Command</Link>
      </Button>
    </div>
  );
}

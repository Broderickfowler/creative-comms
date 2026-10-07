import Link from "next/link";
import { Button } from "@/components/ui/button";
export function MissingProspect() {
  return (
    <div className="space-y-5 py-12">
      <h1 className="text-2xl font-semibold">
        Prospect not found in this workspace
      </h1>
      <p className="text-sm text-muted-foreground">
        It may have been deleted or saved in another browser.
      </p>
      <Button asChild>
        <Link href="/prospects">Back to Prospects</Link>
      </Button>
    </div>
  );
}

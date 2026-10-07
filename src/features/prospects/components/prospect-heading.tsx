import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import { Badge } from "@/components/ui/badge";
export function ProspectHeading({
  prospect,
  title,
}: {
  prospect: Prospect;
  title: string;
}) {
  return (
    <div className="mb-7">
      <Link
        href={`/prospects/${prospect.id}`}
        className="mb-4 inline-flex items-center gap-2 text-xs text-primary"
      >
        <ArrowLeft className="size-3" />
        Prospect detail
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {prospect.isFictional && (
          <Badge variant="secondary">Fictional example</Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {prospect.companyName} ·{" "}
        {[prospect.contactFirstName, prospect.contactLastName]
          .filter(Boolean)
          .join(" ") || "Contact not recorded"}{" "}
        · {prospect.contactRole || "Role not recorded"}
      </p>
    </div>
  );
}

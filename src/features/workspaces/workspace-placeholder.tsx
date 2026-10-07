import Link from "next/link";
import { ArrowLeft, ArrowRight, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WorkspacePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  nextCapabilities: string[];
}

export function WorkspacePlaceholder({
  title,
  description,
  icon: Icon,
  nextCapabilities,
}: WorkspacePlaceholderProps) {
  return (
    <div className="max-w-4xl">
      <p className="eyebrow">SEKAIROS WORKSPACE</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <Card className="mt-9 gap-0 rounded-2xl shadow-none">
        <CardContent className="p-7 sm:p-10">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <Icon className="size-6 text-primary" aria-hidden="true" />
          </div>
          <Badge variant="secondary" className="mb-4 font-normal">
            Planned workspace
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            A place for the next revenue workflow.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            The navigation and workspace are ready. The capabilities below are
            planned for later sprints and are not implemented yet.
          </p>
          <ul className="my-7 space-y-3">
            {nextCapabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-3 text-sm">
                <ArrowRight
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {capability}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline">
            <Link href="/command">
              <ArrowLeft className="size-4" />
              Back to Command
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

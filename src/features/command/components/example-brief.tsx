import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { exampleBrief } from "@/data/example-brief";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ExampleBrief() {
  return (
    <section aria-labelledby="brief-heading" className="mt-9">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">FROM CONTEXT TO CONVERSATION</p>
          <h2
            id="brief-heading"
            className="mt-2 text-xl font-semibold tracking-tight"
          >
            What a useful brief can look like
          </h2>
        </div>
        <Badge variant="secondary" className="font-normal">
          Fictional example
        </Badge>
      </div>
      <Card className="gap-0 rounded-2xl py-0 shadow-none">
        <CardContent className="p-0 md:grid md:grid-cols-[0.85fr_1.6fr]">
          <div className="border-b p-6 md:border-b-0 md:border-r">
            <div
              className="mb-5 flex size-11 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-primary"
              aria-hidden="true"
            >
              MO
            </div>
            <h3 className="text-lg font-semibold">{exampleBrief.contact}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {exampleBrief.role} · {exampleBrief.company}
            </p>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {exampleBrief.context}
            </p>
            <Button asChild variant="link" className="mt-4 h-auto p-0 text-xs">
              <Link href="/prospects">
                View prospect workspace <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <dl className="grid gap-x-8 gap-y-5 p-6 sm:grid-cols-2">
            {exampleBrief.signals.map(({ lens, example }) => (
              <div key={lens}>
                <dt className="text-[10px] font-semibold tracking-[0.12em] text-primary">
                  {lens}
                </dt>
                <dd className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {example}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
        <ArrowRight className="mt-1 size-3 shrink-0" aria-hidden="true" />
        Illustrative context only. Contact selection, offers, messaging, and
        next actions arrive in later sprints.
      </p>
    </section>
  );
}

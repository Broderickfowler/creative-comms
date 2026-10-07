import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntelligenceGrid } from "@/features/command/components/intelligence-grid";
import { ExampleBrief } from "@/features/command/components/example-brief";

export function CommandPage() {
  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <p className="eyebrow">THE OPERATOR WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Command
          </h1>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <Compass className="size-4" aria-hidden="true" />
          Clarity → Execution
        </div>
      </div>
      <section
        aria-labelledby="command-intro"
        className="relative overflow-hidden rounded-2xl bg-[#102f29] p-7 text-white sm:p-9"
      >
        <div
          className="pointer-events-none absolute -right-12 -top-16 size-80 rounded-full border border-teal-200/10"
          aria-hidden="true"
        >
          <div className="absolute inset-10 rounded-full border border-teal-200/10" />
          <div className="absolute inset-20 rounded-full border border-teal-200/10" />
        </div>
        <div className="relative max-w-xl">
          <p className="text-[10px] font-medium tracking-[0.2em] text-teal-200">
            A FOUNDATION FOR REVENUE EXECUTION
          </p>
          <h2
            id="command-intro"
            className="mt-4 max-w-md text-3xl font-medium leading-tight tracking-tight sm:text-4xl"
          >
            Revenue begins with
            <br className="hidden sm:block" /> a clear next move.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-teal-100/65">
            Who to contact. Why it matters. What to offer.
            <br className="hidden sm:block" /> One operator, with the context to
            move forward.
          </p>
          <Button
            asChild
            className="mt-6 bg-teal-200 text-[#102f29] hover:bg-teal-100"
          >
            <Link href="/prospects">
              Explore Prospects <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-dashed px-5 py-3.5 text-xs">
        <span className="flex items-center gap-2 font-medium">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Foundation stage
        </span>
        <span className="text-muted-foreground">
          The Command workflow is a placeholder. No live revenue data is
          connected.
        </span>
      </div>
      <IntelligenceGrid />
      <ExampleBrief />
    </div>
  );
}

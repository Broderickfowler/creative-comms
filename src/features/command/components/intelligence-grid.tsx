import {
  Target,
  Telescope,
  Banknote,
  Layers,
  Clock3,
  ScanLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { exampleBrief } from "@/data/example-brief";
import type { IntelligenceLens } from "@/types/intelligence";
import { Card, CardContent } from "@/components/ui/card";

const icons: Record<IntelligenceLens, LucideIcon> = {
  DESIRE: Target,
  VISION: Telescope,
  MONEY: Banknote,
  FRICTION: Layers,
  TIMING: Clock3,
  "SEKAIROS FIT": ScanLine,
};

export function IntelligenceGrid() {
  return (
    <section aria-labelledby="intelligence-heading" className="mt-9">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">THE INTELLIGENCE FRAMEWORK</p>
          <h2
            id="intelligence-heading"
            className="mt-2 text-xl font-semibold tracking-tight"
          >
            Six lenses. One clear direction.
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">Context before action.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {exampleBrief.signals.map(({ lens, question }, index) => {
          const Icon = icons[lens];
          return (
            <Card key={lens} className="gap-0 rounded-xl py-0 shadow-none">
              <CardContent className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-[11px] font-semibold tracking-[0.14em]">
                  {lens}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{question}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  opportunityScore,
  classifyScore,
} from "@/features/prospects/domain/scoring";
import type { Scores } from "@/types/prospect";
export function ScoreBadge({ scores }: { scores: Scores }) {
  const score = opportunityScore(scores);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-lg font-semibold">
        {score}
        <span className="text-xs font-normal text-muted-foreground">
          {" "}
          / 100
        </span>
      </span>
      <Badge variant={score >= 85 ? "default" : "secondary"}>
        {classifyScore(score)}
      </Badge>
    </div>
  );
}

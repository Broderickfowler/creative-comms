import type { Prospect } from "@/types/prospect";
import type { BriefFields } from "@/types/opportunity-brief";
import type { AssetMatch } from "@/types/sales-asset";
import { BRIEF_FIELD_LABELS } from "@/types/opportunity-brief";
import {
  opportunityScore,
  classifyScore,
} from "@/features/prospects/domain/scoring";
import { Button } from "@/components/ui/button";
const sections = [
  "desiredOutcome",
  "vision",
  "moneyInMotion",
  "executionFriction",
  "whyNow",
  "sekairosOpportunity",
  "recommendedFirstMove",
  "potentialBusinessImpact",
  "verificationNeeded",
] as const;
export function BriefDocument({
  prospect: p,
  fields,
  match,
}: {
  prospect: Prospect;
  fields: BriefFields;
  match: AssetMatch;
}) {
  const score = opportunityScore(p.intelligence.scores);
  return (
    <article
      className="opportunity-brief"
      data-testid="brief-document"
      aria-label="Opportunity Brief document"
    >
      <header className="brief-masthead">
        <p className="brief-wordmark">SEKAIROS</p>
        <p className="brief-edition">OPPORTUNITY BRIEF</p>
      </header>
      <div className="brief-intro">
        <p className="brief-kicker">A CLEARER PATH TO THE NEXT MOVE</p>
        <h1 data-testid="brief-company">{fields.company}</h1>
        <dl className="brief-meta">
          <div>
            <dt>Contact</dt>
            <dd>{fields.contact || "Requires discovery."}</dd>
          </div>
          <div>
            <dt>Industry</dt>
            <dd>{fields.industry || "Requires discovery."}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{fields.date}</dd>
          </div>
        </dl>
        {p.isFictional && (
          <p className="brief-example">Fictional prospect · example brief</p>
        )}
      </div>
      <div className="brief-grid">
        {sections.map((key) => (
          <section
            key={key}
            className={
              key === "recommendedFirstMove"
                ? "brief-section brief-first-move"
                : "brief-section"
            }
            data-testid={`brief-${key}`}
          >
            <h2>{BRIEF_FIELD_LABELS[key]}</h2>
            <p>{fields[key].trim() || "Requires discovery."}</p>
          </section>
        ))}
      </div>
      <section className="brief-asset" data-testid="brief-recommended-asset">
        <h2>RECOMMENDED ASSET</h2>
        {match.primary ? (
          <>
            <h3>{match.primary.name}</h3>
            <p>
              {match.primary.description ||
                match.primary.useWhen ||
                "Review material for fit before sending."}
            </p>
            <a
              className="brief-asset-url"
              href={match.primary.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {match.primary.url}
            </a>
            {match.primary.isExample && (
              <p className="brief-example">
                Example asset URL · replace with real collateral before sending.
              </p>
            )}
            <div className="mt-3" data-print-internal>
              <Button asChild size="sm" variant="outline">
                <a
                  href={match.primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Asset
                </a>
              </Button>
            </div>
          </>
        ) : (
          <p>
            No active material matched. A first conversation should confirm what
            to demonstrate.
          </p>
        )}
      </section>
      <footer className="brief-footer">
        <div>
          <p className="brief-score-label">OPPORTUNITY SCORE</p>
          <p className="brief-score" data-testid="brief-score">
            {score}
            <span> / 100 · {classifyScore(score)}</span>
          </p>
        </div>
        <p className="brief-footnote">
          Prepared from recorded context.
          <br />
          Scope and business impact require verification.
        </p>
      </footer>
    </article>
  );
}

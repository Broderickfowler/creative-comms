"use client";
import { useState } from "react";
import {
  TextField,
  FormSection,
  SaveFeedback,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import type { Intelligence } from "@/types/prospect";
import { saveIntelligence } from "@/services/prospect-store";
import {
  SCORE_FIELDS,
  opportunityScore,
  classifyScore,
} from "../domain/scoring";
const signals = [
  { key: "desiredOutcome", label: "Desired Outcome", lens: "DESIRE" },
  { key: "visionSignal", label: "Vision Signal", lens: "VISION" },
  { key: "moneySignal", label: "Money Signal", lens: "MONEY" },
  {
    key: "operationalFriction",
    label: "Operational Friction",
    lens: "FRICTION",
  },
  { key: "timingSignal", label: "Timing Signal", lens: "TIMING" },
  {
    key: "sekairosOpportunity",
    label: "Sekairos Opportunity",
    lens: "SEKAIROS FIT",
  },
  {
    key: "verificationNeeded",
    label: "Verification Needed",
    lens: "EVIDENCE & ASSUMPTIONS",
  },
] as const;
export function IntelligenceEditor({
  id,
  initial,
}: {
  id: string;
  initial: Intelligence;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const score = opportunityScore(value.scores);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      saveIntelligence(id, value);
      setError(null);
      setMessage("Intelligence saved. Command priorities have been updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Intelligence was not saved");
      setMessage(null);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <FormSection
        title="Intelligence"
        description="Record evidence, keep assumptions explicit, and list what still needs verification."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {signals.map(({ key, label, lens }) => (
            <TextField
              key={key}
              label={label}
              hint={lens}
              multiline
              value={value[key]}
              onChange={(text) => {
                setValue((current) => ({ ...current, [key]: text }));
                setMessage(null);
              }}
            />
          ))}
        </div>
      </FormSection>
      <FormSection
        title="Opportunity Score"
        description="The six scores sum automatically to a maximum of 100. Scoring does not automatically change prospect status."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {SCORE_FIELDS.map(({ key, label, max }) => (
            <TextField
              key={key}
              label={`${label} score`}
              value={value.scores[key]}
              type="number"
              min={0}
              max={max}
              step={1}
              required
              hint={`0–${max}`}
              onChange={(text) => {
                setValue((current) => ({
                  ...current,
                  scores: { ...current.scores, [key]: Number(text) },
                }));
                setMessage(null);
              }}
            />
          ))}
        </div>
        <div
          aria-live="polite"
          className="flex flex-wrap items-center gap-4 rounded-xl bg-secondary p-4"
        >
          <p className="text-sm">
            Total:{" "}
            <strong data-testid="score-total" className="text-2xl text-primary">
              {score}
            </strong>{" "}
            / 100
          </p>
          <span
            data-testid="score-classification"
            className="text-xs font-semibold text-primary"
          >
            {classifyScore(score)}
          </span>
        </div>
      </FormSection>
      <SaveFeedback error={error} message={message} />
      <Button type="submit">Save intelligence</Button>
    </form>
  );
}

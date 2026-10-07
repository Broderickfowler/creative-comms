"use client";
import { useState } from "react";
import { NextRevenueAction } from "@/features/outreach/components/next-revenue-action";
import Link from "next/link";
import {
  CheckboxField,
  TextField,
  FormSection,
  SaveFeedback,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import type { DebriefFields, Prospect } from "@/types/prospect";
import { blankDebrief } from "../domain/defaults";
import { recommendedNextAction } from "../domain/call-outcome";
import { saveDebrief } from "@/services/prospect-store";
import { outcomeFields, conversationFields } from "./debrief-field-definitions";
export function DebriefForm({ prospect: p }: { prospect: Prospect }) {
  const [value, setValue] = useState<DebriefFields>({
    ...blankDebrief,
    desiredOutcome: p.intelligence.desiredOutcome,
    moneySignal: p.intelligence.moneySignal,
    timing: p.intelligence.timingSignal,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  function change<K extends keyof DebriefFields>(
    key: K,
    newValue: DebriefFields[K],
  ) {
    setValue((current) => ({ ...current, [key]: newValue }));
    setSaved(false);
    setError(null);
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saved) return;
    try {
      saveDebrief(p.id, value);
      setError(null);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Call was not saved");
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <FormSection
        title="Call outcome"
        description="Check the outcomes, capture the essentials, and save. Not interested stops outreach. Otherwise proposal takes priority over meeting, then demo."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {outcomeFields.map(({ key, label }) => (
            <CheckboxField
              key={key}
              label={label}
              checked={value[key]}
              onChange={(checked) => change(key, checked)}
            />
          ))}
        </div>
        <TextField
          label="Follow-Up Date"
          type="date"
          required={value.followUpRequired}
          value={value.followUpDate}
          onChange={(date) => change("followUpDate", date)}
          hint="Required when follow-up is needed. Dates use your browser's local calendar."
        />
      </FormSection>
      <FormSection
        title="Conversation essentials"
        description="New Desired Outcome, Money Signal, Timing, and Primary Problem values update the matching intelligence signals without changing scores."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {conversationFields.map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              multiline
              value={value[key]}
              onChange={(text) => change(key, text)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Next Action records your own action notes. The rule-based
          recommendation is calculated separately.
        </p>
      </FormSection>
      <SaveFeedback error={error} message={null} />
      {saved && (
        <section
          role="status"
          className="rounded-xl border border-primary/25 bg-secondary p-6"
        >
          <h2 className="text-xs font-semibold tracking-wide">
            RECOMMENDED NEXT ACTION
          </h2>
          <p
            data-testid="debrief-next-action"
            className="mt-2 text-2xl font-semibold text-primary"
          >
            {recommendedNextAction(p)}
          </p>
          <p className="mt-3 text-sm">
            Call saved. Status:{" "}
            <strong data-testid="debrief-status">{p.status}</strong>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {value.followUpRequired
              ? `Follow-up scheduled for ${value.followUpDate}. `
              : ""}
            This is a recommendation; no message, demo, or proposal has been
            sent.
          </p>
        </section>
      )}
      {saved && <NextRevenueAction prospect={p} />}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saved}>
          {saved ? "Call saved" : "Save call debrief"}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/prospects/${p.id}`}>View prospect</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/command">View revenue priorities</Link>
        </Button>
      </div>
    </form>
  );
}

"use client";
import { useState } from "react";
import type { Prospect } from "@/types/prospect";
import {
  BRIEF_FIELD_LABELS,
  type BriefFields,
} from "@/types/opportunity-brief";
import { resolveOpportunityBrief } from "../domain/brief";
import { saveOpportunityBrief } from "@/services/prospect-store";
import { Button } from "@/components/ui/button";
import {
  TextField,
  FormSection,
  SaveFeedback,
} from "@/components/forms/fields";
export function BriefEditor({
  prospect: p,
  onDone,
}: {
  prospect: Prospect;
  onDone: () => void;
}) {
  const [fields, setFields] = useState<BriefFields>(resolveOpportunityBrief(p)),
    [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mb-7"
      data-print-internal
      onSubmit={(e) => {
        e.preventDefault();
        try {
          saveOpportunityBrief(p.id, fields);
          onDone();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Brief was not saved.");
        }
      }}
    >
      <FormSection
        title="Edit Opportunity Brief"
        description="Save before printing. Only customized fields are stored; scores and matched assets stay connected to the prospect. Use recorded information and never invent ROI."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {(Object.keys(BRIEF_FIELD_LABELS) as (keyof BriefFields)[]).map(
            (key) => (
              <TextField
                key={key}
                label={BRIEF_FIELD_LABELS[key]}
                value={fields[key]}
                type={key === "date" ? "date" : "text"}
                required={key === "company" || key === "date"}
                multiline={
                  !["company", "contact", "industry", "date"].includes(key)
                }
                hint={
                  key === "potentialBusinessImpact"
                    ? "Record confirmed context only. Unknown impact should remain Requires discovery."
                    : undefined
                }
                onChange={(value) => {
                  setFields((f) => ({ ...f, [key]: value }));
                  setError(null);
                }}
              />
            ),
          )}
        </div>
        <SaveFeedback error={error} message={null} />
        <div className="flex gap-3">
          <Button type="submit">Save brief</Button>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel edits
          </Button>
        </div>
      </FormSection>
    </form>
  );
}

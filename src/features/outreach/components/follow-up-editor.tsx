"use client";
import { useState } from "react";
import type { Prospect } from "@/types/prospect";
import { Button } from "@/components/ui/button";
import {
  TextField,
  FormSection,
  SaveFeedback,
} from "@/components/forms/fields";
import { saveFollowUp } from "@/services/prospect-store";
import {
  followUpDate,
  followUpLabel,
} from "@/features/prospects/domain/priorities";
export function FollowUpEditor({ prospect: p }: { prospect: Prospect }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    date: followUpDate(p) ?? "",
    reason: p.followUpReason,
  });
  const { date, reason } = editing
    ? draft
    : { date: followUpDate(p) ?? "", reason: p.followUpReason };
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  return (
    <form
      className="mb-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        setSaved(false);
        try {
          saveFollowUp(p.id, date, reason);
          setEditing(false);
          setSaved(true);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Follow-up was not saved.");
        }
      }}
    >
      <FormSection title="Follow-up" description={followUpLabel(p)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Next Follow-Up Date"
            type="date"
            value={date}
            onChange={(v) => {
              setDraft({ date: v, reason });
              setEditing(true);
              setSaved(false);
            }}
          />
          <TextField
            label="Follow-Up Reason"
            value={reason}
            required={!!date}
            onChange={(v) => {
              setDraft({ date, reason: v });
              setEditing(true);
              setSaved(false);
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Clear the date to remove this follow-up. Due items appear on Command;
          no notifications are sent.
        </p>
        <Button type="submit" size="sm">
          Save follow-up
        </Button>
        <SaveFeedback
          error={error}
          message={saved ? "Follow-up saved." : null}
        />
      </FormSection>
    </form>
  );
}

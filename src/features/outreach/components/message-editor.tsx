"use client";
import { useState } from "react";
import { Copy, RotateCcw } from "lucide-react";
import type { Prospect } from "@/types/prospect";
import type { OutreachMessage } from "@/types/outreach";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextField, SaveFeedback } from "@/components/forms/fields";
import { saveOutreachDraft } from "@/services/prospect-store";
import { currentCallId, resolveMessage } from "../domain/messages";
import { useOutreachActions } from "../use-outreach-actions";
export function MessageEditor({
  prospect: p,
  generated,
}: {
  prospect: Prospect;
  generated: OutreachMessage;
}) {
  const persisted = resolveMessage(p, generated.messageType);
  const [unsaved, setUnsaved] = useState<OutreachMessage | null>(null);
  const draft = unsaved ?? persisted;
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const actions = useOutreachActions(p);
  const activity = p.outreachActivities.findLast(
    (a) =>
      a.messageType === generated.messageType &&
      a.sourceCallId === currentCallId(p),
  );
  function edit(value: OutreachMessage) {
    setUnsaved(value);
    actions.clearFeedback();
    setSaved(false);
    setError(null);
    try {
      saveOutreachDraft(p.id, value);
      setUnsaved(null);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft was not saved.");
    }
  }
  return (
    <article
      data-testid="message-editor"
      className="space-y-4 rounded-xl border bg-white p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{generated.messageType}</h3>
        <Badge variant="outline">
          {activity?.status ?? "Generated"} · {generated.channel}
        </Badge>
      </div>
      {generated.channel === "Email" && (
        <TextField
          label={`${generated.messageType} subject`}
          value={draft.subject}
          onChange={(subject) => edit({ ...draft, subject })}
        />
      )}
      <TextField
        multiline
        label={`${generated.messageType} body`}
        value={draft.messageBody}
        onChange={(messageBody) => edit({ ...draft, messageBody })}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={actions.busy || !draft.messageBody.trim()}
          onClick={() => void actions.copy(draft.messageType, draft)}
        >
          <Copy className="size-3.5" />
          Copy
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={actions.busy || !draft.messageBody.trim()}
          onClick={() => actions.markSent(draft.messageType, draft)}
        >
          Mark Sent
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => edit(generated)}
        >
          <RotateCcw className="size-3.5" />
          Reset to generated version
        </Button>
      </div>
      <SaveFeedback error={error ?? actions.error} message={actions.feedback} />
      {saved && !error && (
        <p className="text-xs text-muted-foreground">
          Draft saved in this browser.
        </p>
      )}
    </article>
  );
}

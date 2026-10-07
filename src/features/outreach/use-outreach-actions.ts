"use client";
import { useState } from "react";
import type { Prospect } from "@/types/prospect";
import type { MessageType, OutreachMessage } from "@/types/outreach";
import { copyToClipboard } from "@/services/clipboard";
import { markOutreachSent, saveOutreachDraft } from "@/services/prospect-store";
import { copyText, resolveMessage } from "./domain/messages";
export function useOutreachActions(prospect: Prospect) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function copy(type: MessageType, message?: OutreachMessage) {
    setError(null);
    setFeedback(null);
    setBusy(true);
    let copied = false;
    try {
      const value = message ?? resolveMessage(prospect, type);
      if (!value.messageBody.trim())
        throw new Error("Add a message before copying.");
      await copyToClipboard(copyText(value));
      copied = true;
      saveOutreachDraft(prospect.id, value, true);
      setFeedback(`${type} copied · prepared for manual sending.`);
    } catch (e) {
      setError(
        `${copied ? "Copied, but activity was not saved. " : ""}${e instanceof Error ? e.message : "Copy failed."}`,
      );
    } finally {
      setBusy(false);
    }
  }
  function markSent(type: MessageType, message?: OutreachMessage) {
    setError(null);
    setFeedback(null);
    try {
      markOutreachSent(prospect.id, message ?? resolveMessage(prospect, type));
      setFeedback(`${type} marked Sent. This records your manual send.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activity was not saved.");
    }
  }
  return {
    copy,
    markSent,
    feedback,
    error,
    busy,
    clearFeedback: () => {
      setError(null);
      setFeedback(null);
    },
  };
}

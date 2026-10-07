"use client";
import { useState } from "react";
import Link from "next/link";
import {
  TextField,
  FormSection,
  SaveFeedback,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { saveCallPrep } from "@/services/prospect-store";
import type { Prospect } from "@/types/prospect";
import { callTemplate } from "./domain/call-templates";
import { useProspects } from "./use-prospects";
import { WorkspaceGate } from "./components/workspace-gate";
import { MissingProspect } from "./components/missing-prospect";
import { ProspectHeading } from "./components/prospect-heading";
import { CallContext } from "./components/call-context";
const prepFields = [
  { key: "opener", label: "30-second opener" },
  { key: "reasonForCall", label: "Reason for call" },
  { key: "likelyObjections", label: "Likely objections" },
  { key: "idealNextStep", label: "Ideal next step" },
  { key: "claimsToAvoid", label: "Claims to avoid" },
  { key: "demoToShow", label: "Demo to show" },
] as const;
function CallPrepEditor({ prospect: p }: { prospect: Prospect }) {
  const [value, setValue] = useState(p.callPrep ?? callTemplate(p));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      saveCallPrep(p.id, value);
      setError(null);
      setMessage("Call Prep saved in this browser.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Call Prep was not saved");
      setMessage(null);
    }
  }
  return (
    <>
      <ProspectHeading prospect={p} title="Call Prep" />
      <CallContext prospect={p} />
      <form onSubmit={submit} className="space-y-5">
        <FormSection
          title="Prepare the conversation"
          description={`Deterministic template for ${p.icp}. Edit it for the prospect; verify every claim.`}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {prepFields.map(({ key, label }) => (
              <TextField
                key={key}
                label={label}
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
        <FormSection title="5 discovery questions">
          <div className="space-y-4">
            {value.discoveryQuestions.map((question, index) => (
              <TextField
                key={index}
                label={`Discovery question ${index + 1}`}
                value={question}
                multiline
                onChange={(text) => {
                  setValue((current) => {
                    const questions = [
                      ...current.discoveryQuestions,
                    ] as typeof current.discoveryQuestions;
                    questions[index] = text;
                    return { ...current, discoveryQuestions: questions };
                  });
                  setMessage(null);
                }}
              />
            ))}
          </div>
        </FormSection>
        <SaveFeedback error={error} message={message} />
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Save Call Prep</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setValue(callTemplate(p));
              setError(null);
              setMessage(
                "ICP template restored to the draft. Save to keep it.",
              );
            }}
          >
            Reset to ICP template
          </Button>
          <Button asChild variant="outline">
            <Link href={`/prospects/${p.id}/debrief`}>Log a call</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
export function CallPrepPage({ id }: { id: string }) {
  const store = useProspects();
  const p = store.prospects.find((p) => p.id === id);
  return (
    <WorkspaceGate {...store}>
      {p ? <CallPrepEditor key={id} prospect={p} /> : <MissingProspect />}
    </WorkspaceGate>
  );
}

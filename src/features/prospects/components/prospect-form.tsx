"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TextField,
  SelectField,
  FormSection,
  SaveFeedback,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { blankProspect } from "@/features/prospects/domain/defaults";
import { addProspect, updateProspect } from "@/services/prospect-store";
import {
  ICP_VALUES,
  PROSPECT_STATUSES,
  type ICP,
  type Prospect,
  type ProspectFields,
  type ProspectStatus,
} from "@/types/prospect";
const contactFields = [
  { key: "contactFirstName", label: "Contact first name" },
  { key: "contactLastName", label: "Contact last name" },
  { key: "contactRole", label: "Contact role" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
] as const;
const companyFields = [
  { key: "companyName", label: "Company name", required: true },
  { key: "website", label: "Website", type: "url" },
  { key: "industry", label: "Industry" },
  { key: "location", label: "Location" },
  { key: "source", label: "Source" },
] as const;
export function ProspectForm({ initial }: { initial?: Prospect }) {
  const router = useRouter();
  const [fields, setFields] = useState<ProspectFields>(
    initial ? { ...initial } : blankProspect,
  );
  const [error, setError] = useState<string | null>(null);
  function change<K extends keyof ProspectFields>(
    key: K,
    value: ProspectFields[K],
  ) {
    setFields((current) => ({ ...current, [key]: value }));
    setError(null);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const id = initial?.id ?? addProspect(fields);
      if (initial) updateProspect(initial.id, fields);
      router.push(`/prospects/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prospect could not be saved");
    }
  }
  return (
    <form onSubmit={submit} className="max-w-4xl space-y-5">
      <FormSection
        title="Company & fit"
        description="Company name is required. Estimated value is a hypothesis in USD, not confirmed revenue."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {companyFields.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              value={fields[field.key]}
              onChange={(value) => change(field.key, value)}
              type={"type" in field ? field.type : "text"}
              required={"required" in field && field.required}
            />
          ))}
          <SelectField
            label="ICP"
            value={fields.icp}
            options={ICP_VALUES}
            onChange={(value) => change("icp", value as ICP)}
          />
          <SelectField
            label="Status"
            value={fields.status}
            options={PROSPECT_STATUSES}
            onChange={(value) => change("status", value as ProspectStatus)}
          />
          <TextField
            label="Estimated opportunity value (USD)"
            value={fields.estimatedOpportunityValue}
            type="number"
            min={0}
            step={0.01}
            required
            onChange={(value) =>
              change("estimatedOpportunityValue", Number(value))
            }
          />
        </div>
      </FormSection>
      <FormSection title="Contact">
        <div className="grid gap-5 sm:grid-cols-2">
          {contactFields.map((field) => (
            <TextField
              key={field.key}
              label={field.label}
              value={fields[field.key]}
              type={"type" in field ? field.type : "text"}
              onChange={(value) => change(field.key, value)}
            />
          ))}
        </div>
      </FormSection>
      <FormSection title="Notes">
        <TextField
          label="Notes"
          multiline
          value={fields.notes}
          onChange={(value) => change("notes", value)}
        />
      </FormSection>
      <SaveFeedback error={error} message={null} />
      <div className="flex gap-3">
        <Button type="submit">
          {initial ? "Save prospect" : "Create prospect"}
        </Button>
        <Button asChild variant="outline">
          <Link href={initial ? `/prospects/${initial.id}` : "/prospects"}>
            Cancel
          </Link>
        </Button>
      </div>
    </form>
  );
}

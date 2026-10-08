import type { SalesAsset, SalesAssetFields } from "@/types/sales-asset";
import type { BriefFields } from "@/types/opportunity-brief";
import { briefOverrides } from "@/features/briefs/domain/brief";
import { seedSalesAssets } from "@/data/seed-sales-assets";
import { isExampleUrl } from "@/features/sales-assets/domain/assets";
import { briefFieldsSchema, salesAssetFieldsSchema } from "./workspace-schema";
import type { OutreachMessage } from "@/types/outreach";
import { applyOutreach } from "@/features/outreach/domain/activity";
import { dateOnly, outreachMessageSchema } from "./workspace-schema";
import type {
  CallPrep,
  DebriefFields,
  Intelligence,
  Prospect,
  ProspectFields,
  Workspace,
} from "@/types/prospect";
import { seedProspects } from "@/data/seed-prospects";
import { createProspect } from "@/features/prospects/domain/defaults";
import { applyDebrief } from "@/features/prospects/domain/call-outcome";
import {
  callPrepSchema,
  debriefFieldsSchema,
  intelligenceSchema,
  parseWorkspace,
  prospectFieldsSchema,
} from "./workspace-schema";
export const STORAGE_KEY = "sekairos.revenue-command.v1";
interface StoreSnapshot {
  ready: boolean;
  prospects: Prospect[];
  assets: SalesAsset[];
  error: string | null;
}
const serverSnapshot: StoreSnapshot = {
  ready: false,
  prospects: [],
  assets: [],
  error: null,
};
let snapshot = serverSnapshot;
const listeners = new Set<() => void>();
let initialized = false;
function emit() {
  for (const listener of listeners) listener();
}
export const getSnapshot = () => snapshot;
export const getServerSnapshot = () => serverSnapshot;
export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function initializeStore() {
  if (initialized) return;
  initialized = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const workspace: Workspace =
      raw === null
        ? { version: 3, prospects: seedProspects(), assets: seedSalesAssets() }
        : parseWorkspace(raw);
    if (raw === null || JSON.parse(raw).version !== 3)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    snapshot = {
      ready: true,
      prospects: workspace.prospects,
      assets: workspace.assets,
      error: null,
    };
  } catch {
    snapshot = {
      ready: true,
      prospects: [],
      assets: [],
      error:
        "Your local workspace could not be opened. Storage may be blocked or the saved data may be invalid. Existing data has not been replaced.",
    };
  }
  emit();
}
export function refreshStore() {
  initialized = false;
  initializeStore();
}
function changeWorkspace(transform: (workspace: Workspace) => Workspace) {
  if (!snapshot.ready || snapshot.error)
    throw new Error(snapshot.error || "Workspace is still loading");
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current: Workspace =
      raw === null
        ? { version: 3, prospects: snapshot.prospects, assets: snapshot.assets }
        : parseWorkspace(raw);
    const next = parseWorkspace(JSON.stringify(transform(current)));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    snapshot = {
      ready: true,
      prospects: next.prospects,
      assets: next.assets,
      error: null,
    };
    emit();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Changes were not saved: ${error.message}`
        : "Changes were not saved. Check browser storage.",
    );
  }
}
function change(transform: (prospects: Prospect[]) => Prospect[]) {
  changeWorkspace((workspace) => ({
    ...workspace,
    prospects: transform(workspace.prospects),
  }));
}
export function addProspect(fields: ProspectFields): string {
  const valid = prospectFieldsSchema.parse(fields);
  const id = crypto.randomUUID();
  change((list) => [
    ...list,
    createProspect(valid, id, new Date().toISOString()),
  ]);
  return id;
}
export function updateProspect(id: string, fields: ProspectFields) {
  const valid = prospectFieldsSchema.parse(fields);
  update(id, (p) => ({ ...p, ...valid, updatedAt: new Date().toISOString() }));
}
function update(id: string, transform: (p: Prospect) => Prospect) {
  change((list) => {
    if (!list.some((p) => p.id === id))
      throw new Error("Prospect no longer exists");
    return list.map((p) => (p.id === id ? transform(p) : p));
  });
}
export function deleteProspect(id: string) {
  change((list) => list.filter((p) => p.id !== id));
}
export function saveIntelligence(id: string, value: Intelligence) {
  const valid = intelligenceSchema.parse(value);
  update(id, (p) => ({
    ...p,
    intelligence: valid,
    updatedAt: new Date().toISOString(),
  }));
}
export function saveCallPrep(id: string, value: CallPrep) {
  const valid = callPrepSchema.parse(value);
  update(id, (p) => ({
    ...p,
    callPrep: valid,
    updatedAt: new Date().toISOString(),
  }));
}
export function saveDebrief(id: string, value: DebriefFields) {
  const valid = debriefFieldsSchema.parse(value);
  update(id, (p) =>
    applyDebrief(p, valid, crypto.randomUUID(), new Date().toISOString()),
  );
}

export function saveOutreachDraft(
  id: string,
  message: OutreachMessage,
  prepared = false,
) {
  const valid = outreachMessageSchema.parse(message);
  if (prepared && !valid.messageBody.trim())
    throw new Error("Add a message before copying.");
  update(id, (p) =>
    applyOutreach(
      p,
      valid,
      prepared ? "Prepared" : "Draft",
      crypto.randomUUID(),
      new Date().toISOString(),
    ),
  );
}
export function markOutreachSent(id: string, message: OutreachMessage) {
  const valid = outreachMessageSchema.parse(message);
  if (!valid.messageBody.trim())
    throw new Error("Add a message before marking it sent.");
  update(id, (p) =>
    applyOutreach(
      p,
      valid,
      "Sent",
      crypto.randomUUID(),
      new Date().toISOString(),
    ),
  );
}
export function saveFollowUp(id: string, date: string, reason: string) {
  const valid = dateOnly.parse(date);
  if (valid && !reason.trim())
    throw new Error("Add a reason for this follow-up.");
  update(id, (p) => ({
    ...p,
    nextFollowUpDate: valid,
    followUpReason: valid ? reason.trim() : "",
    updatedAt: new Date().toISOString(),
  }));
}

export function addSalesAsset(fields: SalesAssetFields): string {
  const valid = salesAssetFieldsSchema.parse(fields),
    id = crypto.randomUUID(),
    now = new Date().toISOString();
  changeWorkspace((w) => ({
    ...w,
    assets: [
      ...w.assets,
      {
        ...valid,
        id,
        createdAt: now,
        updatedAt: now,
        isExample: isExampleUrl(valid.url),
      },
    ],
  }));
  return id;
}
export function updateSalesAsset(id: string, fields: SalesAssetFields) {
  const valid = salesAssetFieldsSchema.parse(fields);
  changeWorkspace((w) => {
    if (!w.assets.some((a) => a.id === id))
      throw new Error("Sales asset no longer exists");
    return {
      ...w,
      assets: w.assets.map((a) =>
        a.id === id
          ? {
              ...a,
              ...valid,
              isExample: isExampleUrl(valid.url),
              updatedAt: new Date().toISOString(),
            }
          : a,
      ),
    };
  });
}
export function deleteSalesAsset(id: string) {
  changeWorkspace((w) => ({
    ...w,
    assets: w.assets.filter((a) => a.id !== id),
  }));
}
export function saveOpportunityBrief(id: string, fields: BriefFields) {
  const valid = briefFieldsSchema.parse(fields);
  update(id, (p) => ({
    ...p,
    brief: {
      overrides: briefOverrides(p, valid),
      updatedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  }));
}
export function resetOpportunityBrief(id: string) {
  update(id, (p) => ({
    ...p,
    brief: null,
    updatedAt: new Date().toISOString(),
  }));
}

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
  error: string | null;
}
const serverSnapshot: StoreSnapshot = {
  ready: false,
  prospects: [],
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
        ? { version: 1, prospects: seedProspects() }
        : parseWorkspace(raw);
    if (raw === null)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    snapshot = { ready: true, prospects: workspace.prospects, error: null };
  } catch {
    snapshot = {
      ready: true,
      prospects: [],
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
function change(transform: (prospects: Prospect[]) => Prospect[]) {
  if (!snapshot.ready || snapshot.error)
    throw new Error(snapshot.error || "Workspace is still loading");
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current =
      raw === null
        ? { version: 1 as const, prospects: snapshot.prospects }
        : parseWorkspace(raw);
    const next: Workspace = {
      version: 1,
      prospects: transform(current.prospects),
    };
    parseWorkspace(JSON.stringify(next));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    snapshot = { ready: true, prospects: next.prospects, error: null };
    emit();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Changes were not saved: ${error.message}`
        : "Changes were not saved. Check browser storage.",
    );
  }
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

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  blankProspect,
  blankDebrief,
  blankIntelligence,
} from "@/features/prospects/domain/defaults";
import {
  addProspect,
  deleteProspect,
  getSnapshot,
  refreshStore,
  saveCallPrep,
  saveDebrief,
  saveIntelligence,
  STORAGE_KEY,
  updateProspect,
} from "@/services/prospect-store";
import { callTemplate } from "@/features/prospects/domain/call-templates";
import { parseWorkspace } from "@/services/workspace-schema";
class MemoryStorage {
  values = new Map<string, string>();
  failWrites = false;
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("Quota exceeded");
    this.values.set(key, value);
  }
}
function open(storage: MemoryStorage) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  refreshStore();
}
test("CRUD, intelligence, prep, call history, and derived outcomes survive a workspace reload", () => {
  const storage = new MemoryStorage();
  open(storage);
  assert.equal(getSnapshot().prospects.length, 3);
  const id = addProspect({
    ...blankProspect,
    companyName: "Operator test company",
  });
  const original = getSnapshot().prospects.find((p) => p.id === id)!;
  assert.equal(original.isFictional, false);
  updateProspect(id, { ...original, companyName: "Edited company" });
  saveIntelligence(id, {
    ...blankIntelligence,
    desiredOutcome: "Fill a local pipeline",
    scores: {
      desire: 20,
      vision: 20,
      money: 25,
      friction: 15,
      timing: 5,
      sekairosFit: 0,
    },
  });
  const p = getSnapshot().prospects.find((p) => p.id === id)!;
  saveCallPrep(id, { ...callTemplate(p), opener: "Saved operator opener" });
  saveDebrief(id, { ...blankDebrief, demoRequested: true });
  open(storage);
  const saved = getSnapshot().prospects.find((p) => p.id === id)!;
  assert.equal(saved.companyName, "Edited company");
  assert.equal(saved.callPrep?.opener, "Saved operator opener");
  assert.equal(saved.status, "Demo Requested");
  assert.equal(saved.calls[0].recommendedNextAction, "Send Demo");
  assert.equal(saved.intelligence.desiredOutcome, "Fill a local pipeline");
  deleteProspect(id);
  open(storage);
  assert.equal(
    getSnapshot().prospects.some((p) => p.id === id),
    false,
  );
  assert.equal(
    parseWorkspace(storage.getItem(STORAGE_KEY)!).prospects.length,
    3,
  );
});
test("A failed browser write cannot report a save or change the visible snapshot", () => {
  const storage = new MemoryStorage();
  open(storage);
  const before = getSnapshot();
  const raw = storage.getItem(STORAGE_KEY);
  storage.failWrites = true;
  assert.throws(
    () => addProspect({ ...blankProspect, companyName: "Must not be saved" }),
    /not saved/,
  );
  assert.equal(getSnapshot(), before);
  assert.equal(storage.getItem(STORAGE_KEY), raw);
});
test("Corrupted saved data is not replaced and blocks mutations", () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, "{corrupt}");
  open(storage);
  assert.ok(getSnapshot().error);
  assert.equal(storage.getItem(STORAGE_KEY), "{corrupt}");
  assert.throws(() =>
    addProspect({ ...blankProspect, companyName: "Blocked" }),
  );
});
test("Deleting every example persists an empty workspace instead of reseeding", () => {
  const storage = new MemoryStorage();
  open(storage);
  for (const p of getSnapshot().prospects) deleteProspect(p.id);
  open(storage);
  assert.equal(getSnapshot().prospects.length, 0);
  assert.equal(
    parseWorkspace(storage.getItem(STORAGE_KEY)!).prospects.length,
    0,
  );
});

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

test("Outreach drafts, preparation, sent activity and explicit follow-up survive store reloads", async () => {
  const { saveOutreachDraft, markOutreachSent, saveFollowUp } =
    await import("@/services/prospect-store");
  const { resolveMessage } =
    await import("@/features/outreach/domain/messages");
  const storage = new MemoryStorage();
  open(storage);
  const id = "fictional-soccer";
  saveDebrief(id, {
    ...blankDebrief,
    answered: true,
    meaningfulConversation: true,
    demoRequested: true,
  });
  const p = getSnapshot().prospects.find((p) => p.id === id)!;
  const msg = {
    ...resolveMessage(p, "Demo Email"),
    messageBody: "Persistent operator copy",
  };
  saveOutreachDraft(id, msg);
  open(storage);
  assert.equal(
    resolveMessage(
      getSnapshot().prospects.find((p) => p.id === id)!,
      "Demo Email",
    ).messageBody,
    msg.messageBody,
  );
  saveOutreachDraft(id, msg, true);
  markOutreachSent(id, msg);
  saveFollowUp(id, "2026-10-08", "Agree demo feedback");
  open(storage);
  const saved = getSnapshot().prospects.find((p) => p.id === id)!;
  assert.equal(saved.status, "Follow-Up");
  assert.ok(saved.lastOutreachAt);
  assert.equal(saved.outreachActivities.length, 1);
  assert.equal(saved.outreachActivities[0].status, "Sent");
  assert.equal(saved.nextFollowUpDate, "2026-10-08");
  assert.equal(saved.followUpReason, "Agree demo feedback");
  saveFollowUp(id, "", "");
  open(storage);
  assert.equal(
    getSnapshot().prospects.find((p) => p.id === id)!.nextFollowUpDate,
    "",
  );
  assert.throws(() => saveFollowUp(id, "2026-02-30", "Bad date"));
  assert.throws(() => saveFollowUp(id, "2026-10-09", ""), /reason/);
  assert.throws(
    () => markOutreachSent(id, { ...msg, messageBody: "" }),
    /message/,
  );
});

test("Legacy store migration persists version three and preserves the original when migration writes fail", () => {
  const source = new MemoryStorage();
  open(source);
  const old = JSON.parse(source.getItem(STORAGE_KEY)!);
  old.version = 1;
  for (const p of old.prospects) {
    delete p.outreachActivities;
    delete p.lastOutreachAt;
    delete p.nextFollowUpDate;
    delete p.followUpReason;
  }
  const raw = JSON.stringify(old);
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, raw);
  open(storage);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)!).version, 3);
  assert.equal(getSnapshot().prospects.length, 3);
  assert.equal(
    getSnapshot().prospects[1].companyName,
    old.prospects[1].companyName,
  );
  assert.deepEqual(
    getSnapshot().prospects[1].intelligence,
    old.prospects[1].intelligence,
  );
  const blocked = new MemoryStorage();
  blocked.setItem(STORAGE_KEY, raw);
  blocked.failWrites = true;
  open(blocked);
  assert.ok(getSnapshot().error);
  assert.equal(blocked.getItem(STORAGE_KEY), raw);
});

test("Sales asset CRUD and brief customizations persist without replacing prospects or sent activity", async () => {
  const {
    addSalesAsset,
    updateSalesAsset,
    deleteSalesAsset,
    saveOpportunityBrief,
    resetOpportunityBrief,
  } = await import("@/services/prospect-store");
  const { generateOpportunityBrief, resolveOpportunityBrief } =
    await import("@/features/briefs/domain/brief");
  const storage = new MemoryStorage();
  open(storage);
  const id = addSalesAsset({
    name: "Operator enrollment demo",
    type: "Demo",
    icp: "Soccer Club / Academy",
    offer: "Player Enrollment System",
    url: "https://sekairos.com/demo",
    description: "Recorded demo",
    useWhen: "Enrollment",
    status: "Active",
  });
  const p = getSnapshot().prospects[1];
  const fields = {
    ...generateOpportunityBrief(p),
    vision: "Saved executive vision",
  };
  saveOpportunityBrief(p.id, fields);
  open(storage);
  assert.equal(
    resolveOpportunityBrief(getSnapshot().prospects[1]).vision,
    "Saved executive vision",
  );
  assert.deepEqual(getSnapshot().prospects[1].brief?.overrides, {
    vision: "Saved executive vision",
  });
  const asset = getSnapshot().assets.find((a) => a.id === id)!;
  assert.equal(asset.isExample, false);
  assert.ok(asset.createdAt);
  updateSalesAsset(id, {
    ...asset,
    name: "Edited demo",
    url: "https://example.com/placeholder",
    status: "Inactive",
  });
  open(storage);
  assert.equal(
    getSnapshot().assets.find((a) => a.id === id)?.name,
    "Edited demo",
  );
  assert.equal(getSnapshot().assets.find((a) => a.id === id)?.isExample, true);
  resetOpportunityBrief(p.id);
  deleteSalesAsset(id);
  open(storage);
  assert.equal(getSnapshot().prospects[1].brief, null);
  assert.equal(
    getSnapshot().assets.some((a) => a.id === id),
    false,
  );
  assert.equal(getSnapshot().prospects.length, 3);
  for (const a of getSnapshot().assets) deleteSalesAsset(a.id);
  open(storage);
  assert.equal(getSnapshot().assets.length, 0);
});

test("Asset and brief save failures preserve both saved data and the visible workspace snapshot", async () => {
  const { addSalesAsset, saveOpportunityBrief } =
    await import("@/services/prospect-store");
  const { generateOpportunityBrief } =
    await import("@/features/briefs/domain/brief");
  const { blankAsset } = await import("@/features/sales-assets/domain/assets");
  const storage = new MemoryStorage();
  open(storage);
  const before = getSnapshot(),
    raw = storage.getItem(STORAGE_KEY);
  storage.failWrites = true;
  assert.throws(
    () =>
      addSalesAsset({
        ...blankAsset,
        name: "Must not save",
        url: "https://sekairos.com/demo",
      }),
    /not saved/,
  );
  assert.throws(
    () =>
      saveOpportunityBrief(before.prospects[0].id, {
        ...generateOpportunityBrief(before.prospects[0]),
        vision: "Unsaved edit",
      }),
    /not saved/,
  );
  assert.equal(getSnapshot(), before);
  assert.equal(storage.getItem(STORAGE_KEY), raw);
});

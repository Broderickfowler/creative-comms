import { test } from "node:test";
import assert from "node:assert/strict";
import { seedProspects } from "@/data/seed-prospects";
import { seedSalesAssets } from "@/data/seed-sales-assets";
import {
  blankDebrief,
  blankIntelligence,
} from "@/features/prospects/domain/defaults";
import { applyDebrief } from "@/features/prospects/domain/call-outcome";
import {
  generateOutreachPack,
  resolveMessage,
} from "@/features/outreach/domain/messages";
import { applyOutreach } from "@/features/outreach/domain/activity";
import { matchSalesAssets } from "@/features/sales-assets/domain/matching";
import {
  materialToSend,
  materialAction,
} from "@/features/sales-assets/domain/materials";
import {
  appendAssetLink,
  validAssetUrl,
  isExampleUrl,
} from "@/features/sales-assets/domain/assets";
import {
  generateOpportunityBrief,
  resolveOpportunityBrief,
  briefOverrides,
} from "@/features/briefs/domain/brief";
import {
  salesAssetFieldsSchema,
  parseWorkspace,
} from "@/services/workspace-schema";
const now = "2026-10-07T18:00:00.000Z";
const assets = seedSalesAssets(now);
function soccer() {
  return applyDebrief(
    seedProspects(now)[1],
    {
      ...blankDebrief,
      answered: true,
      meaningfulConversation: true,
      demoRequested: true,
      desiredOutcome: "Increase player enrollment",
    },
    "call-1",
    now,
  );
}

test("Soccer enrollment request selects Player Enrollment Demo, the workflow reason, and a secondary asset", () => {
  const p = soccer(),
    match = matchSalesAssets(p, assets);
  assert.equal(match.primary?.name, "Player Enrollment Demo");
  assert.equal(match.primary?.offer, "Player Enrollment System");
  assert.match(match.reason, /application-to-trial-to-payment-to-enrollment/);
  assert.ok(match.secondary);
  assert.notEqual(match.secondary.id, match.primary.id);
  assert.equal(
    generateOutreachPack(p, assets).nextRevenueAction,
    "Send Demo + Opportunity Brief",
  );
  assert.deepEqual(matchSalesAssets(p, [...assets].reverse()), match);
});

test("Founder and College assets match their own recorded opportunity and recommended offer", () => {
  const [founder, , college] = seedProspects(now);
  assert.equal(
    matchSalesAssets(
      applyDebrief(founder, { ...blankDebrief, demoRequested: true }, "c", now),
      assets,
    ).primary?.name,
    "CRM / Follow-Up System Demo",
  );
  const systems = {
    ...college,
    intelligence: {
      ...blankIntelligence,
      desiredOutcome: "Resolve cross-system silos",
      sekairosOpportunity: "Cross-system operations",
    },
  };
  assert.equal(
    matchSalesAssets(
      applyDebrief(systems, { ...blankDebrief, demoRequested: true }, "c", now),
      assets,
    ).primary?.name,
    "Cross-System Operations Layer",
  );
});

test("Inactive assets and different ICPs are excluded; Universal assets can supply missing material", () => {
  const p = soccer();
  const inactive = assets.map((a) => ({ ...a, status: "Inactive" as const }));
  assert.equal(matchSalesAssets(p, inactive).primary, null);
  assert.equal(
    matchSalesAssets(
      p,
      assets.filter((a) => a.icp === "College Athletics"),
    ).primary,
    null,
  );
  const universal = {
    ...assets[4],
    id: "universal",
    icp: "Universal" as const,
  };
  assert.equal(
    matchSalesAssets(p, [...inactive, universal]).primary?.id,
    "universal",
  );
  assert.match(matchSalesAssets(p, []).reason, /No active asset/);
  assert.equal(generateOutreachPack(p, []).nextRevenueAction, "SEND DEMO");
});

test("Demo, information, and proposal outcomes prefer the appropriate material type when offer and ICP agree", () => {
  const p = soccer(),
    demo = assets[4];
  const variants = [
    demo,
    {
      ...demo,
      id: "pdf",
      type: "PDF" as const,
      name: "Enrollment information",
    },
    {
      ...demo,
      id: "proposal",
      type: "Proposal Example" as const,
      name: "Enrollment proposal",
    },
  ];
  assert.equal(matchSalesAssets(p, variants).primary?.type, "Demo");
  const info = applyDebrief(
    seedProspects(now)[1],
    { ...blankDebrief, emailRequested: true },
    "call-info",
    now,
  );
  assert.equal(matchSalesAssets(info, variants).primary?.type, "PDF");
  assert.equal(
    generateOutreachPack(info, variants).nextRevenueAction,
    "Send Information Pack",
  );
  const proposal = applyDebrief(
    p,
    { ...blankDebrief, proposalRequested: true, demoRequested: true },
    "call-proposal",
    now,
  );
  assert.equal(
    matchSalesAssets(proposal, variants).primary?.type,
    "Proposal Example",
  );
  assert.equal(
    generateOutreachPack(proposal, variants).nextRevenueAction,
    "Prepare Proposal",
  );
});

test("Asset URL validation permits URL collateral but blocks executable protocols, credentials, malformed links, and whitespace", () => {
  for (const url of [
    "https://sekairos.example/demo",
    "http://localhost:3200/command",
    "https://example.com/a?b=c#section",
  ])
    assert.ok(validAssetUrl(url));
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///tmp/test.pdf",
    "not-a-url",
    "https://user:password@example.com",
    "https://example.com/a b",
    "",
  ])
    assert.equal(validAssetUrl(url), false);
  assert.equal(isExampleUrl("https://demo.example/asset"), true);
  assert.equal(isExampleUrl("https://example.com/demo"), true);
  assert.equal(isExampleUrl("https://sekairos.com/demo"), false);
  assert.equal(
    salesAssetFieldsSchema.safeParse({
      ...assets[0],
      url: "javascript:alert(1)",
    }).success,
    false,
  );
});

test("Brief generation uses recorded signals, score-independent context, and requires discovery for unknown impact", () => {
  const p = soccer(),
    brief = generateOpportunityBrief(p);
  assert.equal(brief.company, p.companyName);
  assert.match(brief.contact, /Diego Santos/);
  assert.equal(brief.desiredOutcome, "Increase player enrollment");
  assert.equal(brief.vision, p.intelligence.visionSignal);
  assert.equal(brief.moneyInMotion, p.intelligence.moneySignal);
  assert.equal(brief.executionFriction, p.intelligence.operationalFriction);
  assert.equal(brief.whyNow, p.intelligence.timingSignal);
  assert.equal(brief.sekairosOpportunity, p.intelligence.sekairosOpportunity);
  assert.equal(brief.recommendedFirstMove, "Player Enrollment System");
  assert.equal(brief.potentialBusinessImpact, "Requires discovery.");
  assert.deepEqual(
    generateOpportunityBrief({ ...p, estimatedOpportunityValue: 1_000_000 }),
    brief,
  );
  const blank = generateOpportunityBrief({
    ...p,
    intelligence: structuredClone(blankIntelligence),
  });
  for (const key of [
    "desiredOutcome",
    "vision",
    "moneyInMotion",
    "executionFriction",
    "whyNow",
    "sekairosOpportunity",
  ] as const)
    assert.equal(blank[key], "Requires discovery.");
});

test("Saved brief overrides stay separate and preserve edits while unmodified defaults follow intelligence", () => {
  const p = soccer(),
    fields = {
      ...generateOpportunityBrief(p),
      vision: "Operator-confirmed vision",
    };
  const overrides = briefOverrides(p, fields);
  assert.deepEqual(overrides, { vision: "Operator-confirmed vision" });
  const edited = {
    ...p,
    brief: { overrides, updatedAt: now },
    intelligence: {
      ...p.intelligence,
      visionSignal: "New generated vision",
      moneySignal: "New recorded budget signal",
    },
  };
  assert.equal(
    resolveOpportunityBrief(edited).vision,
    "Operator-confirmed vision",
  );
  assert.equal(
    resolveOpportunityBrief(edited).moneyInMotion,
    "New recorded budget signal",
  );
  assert.equal(
    resolveOpportunityBrief({ ...edited, brief: null }).vision,
    "New generated vision",
  );
  assert.equal(p.brief, null);
});

test("Material to Send survives preparation and unrelated sends, clears on a relevant send, and returns for a fresh call", () => {
  const p = soccer();
  assert.deepEqual(materialToSend([p]), [p]);
  const message = resolveMessage(p, "Demo Email");
  const prepared = applyOutreach(p, message, "Prepared", "a", now);
  assert.equal(materialToSend([prepared]).length, 1);
  const unrelated = applyOutreach(
    prepared,
    resolveMessage(prepared, "Voicemail"),
    "Sent",
    "b",
    now,
  );
  assert.equal(materialToSend([unrelated]).length, 1);
  const sent = applyOutreach(unrelated, message, "Sent", "c", now);
  assert.equal(materialToSend([sent]).length, 0);
  assert.equal(
    materialAction("Demo Requested", matchSalesAssets(p, assets)),
    "Send Demo + Opportunity Brief",
  );
  const next = applyDebrief(
    sent,
    { ...blankDebrief, demoRequested: true },
    "call-2",
    now,
  );
  assert.equal(materialToSend([next]).length, 1);
  assert.equal(
    materialToSend([
      { ...p, status: "Lost" },
      { ...p, status: "Won" },
    ]).length,
    0,
  );
});

test("Information and proposal queues clear after the corresponding current-call acknowledgment is marked sent", () => {
  for (const flag of ["emailRequested", "proposalRequested"] as const) {
    const p = applyDebrief(
      seedProspects(now)[0],
      { ...blankDebrief, [flag]: true },
      flag,
      now,
    );
    assert.equal(materialToSend([p]).length, 1);
    const sent = applyOutreach(
      p,
      resolveMessage(p, "Post-Call Follow-Up Email"),
      "Sent",
      "a",
      now,
    );
    assert.equal(materialToSend([sent]).length, 0);
    if (flag === "proposalRequested") assert.equal(sent.status, "Proposal");
  }
});

test("Adding material preserves message edits and avoids duplicate URLs", () => {
  const body = "Operator-specific message";
  const result = appendAssetLink(body, assets[4]);
  assert.equal(result, `${body}\n\nPlayer Enrollment Demo\n${assets[4].url}`);
  assert.equal(appendAssetLink(result, assets[4]), result);
});

test("Version-two migration preserves outreach and adds the asset library and brief defaults without reseeding version three", () => {
  const p = applyOutreach(
    soccer(),
    resolveMessage(soccer(), "Demo Email"),
    "Sent",
    "a",
    now,
  );
  const legacy = JSON.parse(JSON.stringify(p)) as Record<string, unknown>;
  delete legacy.brief;
  const migrated = parseWorkspace(
    JSON.stringify({ version: 2, prospects: [legacy] }),
  );
  assert.equal(migrated.version, 3);
  assert.deepEqual(migrated.prospects, [p]);
  assert.equal(migrated.assets.length, 11);
  assert.ok(migrated.assets.every((a) => a.isExample));
  const empty = parseWorkspace(
    JSON.stringify({ version: 3, prospects: [], assets: [] }),
  );
  assert.deepEqual(empty.assets, []);
  assert.throws(() =>
    parseWorkspace(JSON.stringify({ version: 3, prospects: [] })),
  );
  assert.throws(() =>
    parseWorkspace(
      JSON.stringify({ ...empty, assets: [assets[0], assets[0]] }),
    ),
  );
});

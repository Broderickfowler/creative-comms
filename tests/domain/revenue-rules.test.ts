import { seedSalesAssets } from "@/data/seed-sales-assets";
import { test } from "node:test";
import assert from "node:assert/strict";
import { seedProspects } from "@/data/seed-prospects";
import {
  blankDebrief,
  blankIntelligence,
  blankProspect,
  createProspect,
} from "@/features/prospects/domain/defaults";
import {
  classifyScore,
  opportunityScore,
} from "@/features/prospects/domain/scoring";
import {
  applyDebrief,
  statusAfterCall,
  nextActionForCall,
} from "@/features/prospects/domain/call-outcome";
import {
  rankProspects,
  followUpLabel,
} from "@/features/prospects/domain/priorities";
import { callTemplate } from "@/features/prospects/domain/call-templates";
import {
  parseWorkspace,
  debriefFieldsSchema,
} from "@/services/workspace-schema";
import { ICP_VALUES, type Scores } from "@/types/prospect";
const now = "2026-10-07T18:00:00.000Z";
function withScore(score: number) {
  const p = createProspect(
    { ...blankProspect, companyName: "Boundary business" },
    `score-${score}`,
    now,
  );
  p.intelligence.scores = {
    desire: 20,
    vision: 20,
    money: score - 40,
    friction: 0,
    timing: 0,
    sekairosFit: 0,
  };
  if (score > 65) {
    p.intelligence.scores.money = 25;
    p.intelligence.scores.friction = Math.min(15, score - 65);
    p.intelligence.scores.timing = Math.max(0, score - 80);
  }
  return p;
}
for (const [score, expected] of [
  [54, "LOW PRIORITY"],
  [55, "NURTURE"],
  [69, "NURTURE"],
  [70, "ACTIVE PURSUIT"],
  [84, "ACTIVE PURSUIT"],
  [85, "CALL NOW"],
] as const) {
  test(`Score ${score} is ${expected}`, () => {
    assert.equal(opportunityScore(withScore(score).intelligence.scores), score);
    assert.equal(classifyScore(score), expected);
  });
}
test("Scores sum to 100 maximum and sanitize out-of-range numbers", () => {
  const max: Scores = {
    desire: 20,
    vision: 20,
    money: 25,
    friction: 15,
    timing: 10,
    sekairosFit: 10,
  };
  assert.equal(opportunityScore(max), 100);
  assert.equal(
    opportunityScore({ ...max, desire: 999, money: NaN, vision: -4 }),
    55,
  );
  assert.equal(opportunityScore(blankIntelligence.scores), 0);
});
test("Debrief requested outcomes use proposal > meeting > demo > contact", () => {
  assert.equal(
    statusAfterCall("New", { ...blankDebrief, meaningfulConversation: true }),
    "Contacted",
  );
  assert.equal(
    statusAfterCall("New", {
      ...blankDebrief,
      meaningfulConversation: true,
      demoRequested: true,
    }),
    "Demo Requested",
  );
  assert.equal(
    statusAfterCall("New", {
      ...blankDebrief,
      demoRequested: true,
      meetingRequested: true,
    }),
    "Meeting Requested",
  );
  assert.equal(
    statusAfterCall("New", {
      ...blankDebrief,
      demoRequested: true,
      meetingRequested: true,
      proposalRequested: true,
    }),
    "Proposal",
  );
  assert.equal(
    statusAfterCall("Proposal", {
      ...blankDebrief,
      meaningfulConversation: true,
    }),
    "Proposal",
  );
  assert.equal(statusAfterCall("Researching", blankDebrief), "Researching");
});
test("Next-action engine covers every recommendation and request precedence", () => {
  assert.equal(
    nextActionForCall("Demo Requested", 85, {
      ...blankDebrief,
      demoRequested: true,
    }),
    "Send Demo",
  );
  assert.equal(
    nextActionForCall("Meeting Requested", 85, {
      ...blankDebrief,
      demoRequested: true,
      meetingRequested: true,
    }),
    "Schedule Meeting",
  );
  assert.equal(
    nextActionForCall("Proposal", 85, {
      ...blankDebrief,
      proposalRequested: true,
    }),
    "Create Proposal",
  );
  assert.equal(
    nextActionForCall("Contacted", 30, {
      ...blankDebrief,
      emailRequested: true,
    }),
    "Send Email",
  );
  assert.equal(nextActionForCall("New", 10, blankDebrief), "Call Tomorrow");
  assert.equal(
    nextActionForCall("Contacted", 30, {
      ...blankDebrief,
      answered: true,
      followUpRequired: true,
    }),
    "Call Tomorrow",
  );
  assert.equal(
    nextActionForCall("Contacted", 30, { ...blankDebrief, answered: true }),
    "Nurture",
  );
  assert.equal(nextActionForCall("Lost", 100), "Disqualify");
});
test("Saving a debrief updates signals and keeps scores/history without mutating the prospect", () => {
  const p = withScore(85);
  const next = applyDebrief(
    p,
    {
      ...blankDebrief,
      demoRequested: true,
      desiredOutcome: "Book more qualified conversations",
      primaryProblem: "Follow-up is inconsistent",
      moneySignal: "Budget needs verification",
      timing: "Next month",
    },
    "call-1",
    now,
  );
  assert.equal(next.status, "Demo Requested");
  assert.equal(next.calls[0].recommendedNextAction, "Send Demo");
  assert.equal(
    next.intelligence.desiredOutcome,
    "Book more qualified conversations",
  );
  assert.equal(
    next.intelligence.operationalFriction,
    "Follow-up is inconsistent",
  );
  assert.equal(opportunityScore(next.intelligence.scores), 85);
  assert.equal(p.calls.length, 0);
  const second = applyDebrief(
    next,
    { ...blankDebrief, emailRequested: true },
    "call-2",
    now,
  );
  assert.equal(second.calls.length, 2);
  assert.equal(
    second.intelligence.desiredOutcome,
    next.intelligence.desiredOutcome,
  );
});
test("Priority ordering is score, follow-up urgency, then status and does not mutate input", () => {
  const high = withScore(85);
  const a = withScore(70);
  a.id = "a";
  a.status = "New";
  a.calls = [
    {
      ...blankDebrief,
      id: "a-call",
      createdAt: now,
      followUpRequired: true,
      followUpDate: "2026-10-06",
      recommendedNextAction: "Call Tomorrow",
    },
  ];
  const b = structuredClone(a);
  b.id = "b";
  b.status = "Call Now";
  b.calls[0].followUpDate = "2026-10-08";
  const input = [b, a, high];
  assert.deepEqual(
    rankProspects(input).map((p) => p.id),
    [high.id, "a", "b"],
  );
  b.calls[0].followUpDate = "2026-10-06";
  assert.deepEqual(
    rankProspects([a, b]).map((p) => p.id),
    ["b", "a"],
  );
  assert.equal(input[0].id, "b");
  assert.match(followUpLabel(a, "2026-10-07"), /Overdue/);
  assert.equal(followUpLabel(a, "2026-10-06"), "Follow-up due today");
});
test("Each ICP has exactly five distinct deterministic questions and an editable safe template", () => {
  const seeds = seedProspects(now);
  assert.deepEqual(
    seeds.map((p) => p.icp),
    [...ICP_VALUES],
  );
  for (const p of seeds) {
    const a = callTemplate(p);
    assert.equal(a.discoveryQuestions.length, 5);
    assert.equal(new Set(a.discoveryQuestions).size, 5);
    assert.ok(a.opener.includes(p.companyName));
    assert.ok(a.claimsToAvoid.length > 0);
    assert.deepEqual(a, callTemplate(p));
    a.discoveryQuestions[0] = "Operator edit";
    assert.notEqual(callTemplate(p).discoveryQuestions[0], "Operator edit");
  }
});
test("Workspace round-trip retains all fields and rejects corrupt, duplicate, invalid-score, or unsupported data", () => {
  const workspace = {
    version: 3,
    prospects: seedProspects(now),
    assets: seedSalesAssets(now),
  };
  assert.deepEqual(parseWorkspace(JSON.stringify(workspace)), {
    ...workspace,
    version: 3,
  });
  assert.throws(() => parseWorkspace("not json"));
  assert.throws(() =>
    parseWorkspace(JSON.stringify({ ...workspace, version: 4 })),
  );
  assert.throws(() =>
    parseWorkspace(
      JSON.stringify({
        version: 1,
        prospects: [workspace.prospects[0], workspace.prospects[0]],
      }),
    ),
  );
  workspace.prospects[0].intelligence.scores.money = 26;
  assert.throws(() => parseWorkspace(JSON.stringify(workspace)));
});
test("Follow-up date is required only when follow-up is requested and must be a real calendar date", () => {
  assert.equal(
    debriefFieldsSchema.safeParse({ ...blankDebrief, followUpRequired: true })
      .success,
    false,
  );
  assert.equal(
    debriefFieldsSchema.safeParse({
      ...blankDebrief,
      followUpRequired: true,
      followUpDate: "2026-10-08",
    }).success,
    true,
  );
  assert.equal(
    debriefFieldsSchema.safeParse({
      ...blankDebrief,
      followUpDate: "2026-99-99",
    }).success,
    false,
  );
  assert.equal(
    debriefFieldsSchema.safeParse({
      ...blankDebrief,
      followUpDate: "2026-02-30",
    }).success,
    false,
  );
});

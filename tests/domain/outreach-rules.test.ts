import { test } from "node:test";
import assert from "node:assert/strict";
import { seedProspects } from "@/data/seed-prospects";
import {
  blankDebrief,
  blankIntelligence,
} from "@/features/prospects/domain/defaults";
import {
  applyDebrief,
  recommendedNextAction,
} from "@/features/prospects/domain/call-outcome";
import {
  followUpsDue,
  pipelineCounts,
  followUpDate,
} from "@/features/prospects/domain/priorities";
import { applyOutreach } from "@/features/outreach/domain/activity";
import {
  generateOutreachPack,
  resolveMessage,
  copyText,
} from "@/features/outreach/domain/messages";
import {
  ICP_OFFERS,
  recommendedOffer,
} from "@/features/outreach/domain/offers";
import { parseWorkspace } from "@/services/workspace-schema";
import { MESSAGE_TYPES } from "@/types/outreach";
import type { DebriefFields, ICP } from "@/types/prospect";
const now = "2026-10-07T18:00:00.000Z";
function soccer(fields: Partial<DebriefFields> = {}) {
  return applyDebrief(
    seedProspects(now)[1],
    {
      ...blankDebrief,
      answered: true,
      meaningfulConversation: true,
      ...fields,
    },
    "call-1",
    now,
  );
}
for (const [fields, kind, primary, cta] of [
  [{ demoRequested: true }, "Demo Send Pack", "Demo Email", /demo/],
  [
    { emailRequested: true },
    "Information Send Pack",
    "Post-Call Follow-Up Email",
    /priority/,
  ],
  [
    { meetingRequested: true, demoRequested: true },
    "Scheduling Response",
    "Post-Call Follow-Up Email",
    /times/,
  ],
  [
    { proposalRequested: true, meetingRequested: true, demoRequested: true },
    "Proposal Acknowledgment",
    "Post-Call Follow-Up Email",
    /scope, owner, budget/,
  ],
  [{}, "Relevant Follow-Up", "Post-Call Follow-Up Email", /explore/],
] as const) {
  test(`${kind} follows the requested outcome and earns the next conversation`, () => {
    const p = soccer(fields);
    const pack = generateOutreachPack(p);
    assert.equal(pack.kind, kind);
    assert.equal(pack.primaryEmail, primary);
    assert.match(pack.cta, cta);
    assert.equal(pack.messages.length, 9);
    assert.deepEqual(
      pack.messages.map((m) => m.messageType),
      [...MESSAGE_TYPES],
    );
    assert.match(pack.recommendedDemo, /inquiry/);
    assert.ok(pack.offer.name);
    assert.match(pack.offer.reason, /confirmation/);
    for (const m of pack.messages) {
      assert.ok(m.messageBody.trim());
      assert.ok(m.messageBody.includes(p.contactFirstName));
      assert.ok(m.messageBody.includes(p.companyName));
    }
  });
}
test("Templates are deterministic, concise, context-specific, and do not invent delivery, familiarity, or results", () => {
  for (const p of seedProspects(now)) {
    const pack = generateOutreachPack(p);
    assert.deepEqual(pack, generateOutreachPack(p));
    assert.equal(pack.kind, "Initial Outreach");
    for (const m of pack.messages) {
      assert.doesNotMatch(
        m.messageBody,
        /monitoring|guarantee|we have sent|we've sent|pleasure speaking|hope this finds|\bAI-powered\b/i,
      );
      assert.ok(m.messageBody.split(/\s+/).length < 220);
      assert.ok(!m.messageBody.includes("Thanks for the conversation"));
    }
    assert.notEqual(
      generateOutreachPack({ ...p, companyName: "Different company" })
        .messages[0].messageBody,
      pack.messages[0].messageBody,
    );
  }
});
test("ICP recommendations select every supported offer without inventing offers", () => {
  const signals: Record<ICP, string[]> = {
    "Founder / Local Business": [
      "review",
      "manual capacity",
      "lead inquiries",
      "CRM follow-up",
    ],
    "Soccer Club / Academy": [
      "review",
      "enrollment trial",
      "manual capacity",
      "command visibility",
    ],
    "College Athletics": [
      "review",
      "manual capacity",
      "command visibility",
      "cross-system integration",
    ],
  };
  for (const p of seedProspects(now)) {
    for (const [index, signal] of signals[p.icp].entries()) {
      const x = {
        ...p,
        intelligence: { ...blankIntelligence, desiredOutcome: signal },
      };
      assert.equal(recommendedOffer(x).name, ICP_OFFERS[p.icp][index]);
    }
  }
});
test("Disqualified and closed prospects suppress drafts even if an earlier call requested a demo", () => {
  for (const status of ["Lost", "Won"] as const) {
    const p = { ...soccer({ demoRequested: true }), status };
    assert.deepEqual(generateOutreachPack(p).messages, []);
    assert.throws(() => resolveMessage(p, "Demo Email"), /suppressed/);
    assert.throws(
      () =>
        applyOutreach(
          p,
          {
            messageType: "Demo Email",
            channel: "Email",
            subject: "x",
            messageBody: "x",
          },
          "Sent",
          "a",
          now,
        ),
      /suppressed/,
    );
  }
  const p = soccer({
    notInterested: true,
    demoRequested: true,
    proposalRequested: true,
  });
  assert.equal(p.status, "Lost");
  assert.equal(recommendedNextAction(p), "Disqualify");
  assert.deepEqual(generateOutreachPack(p).messages, []);
});
test("Draft → Prepared → Sent retains edits, history, timestamps, and schedules a follow-up", () => {
  const p = soccer({ demoRequested: true });
  const msg = {
    ...resolveMessage(p, "Demo Email"),
    subject: "Operator subject",
    messageBody: "Operator copy",
  };
  const draft = applyOutreach(p, msg, "Draft", "activity-1", now);
  const prepared = applyOutreach(draft, msg, "Prepared", "unused", now);
  const sentAt = "2026-10-07T18:01:00.000Z";
  const sent = applyOutreach(prepared, msg, "Sent", "unused", sentAt);
  assert.equal(p.outreachActivities.length, 0);
  assert.equal(sent.outreachActivities.length, 1);
  assert.deepEqual(sent.outreachActivities[0], {
    ...msg,
    id: "activity-1",
    prospectId: p.id,
    sourceCallId: "call-1",
    createdAt: now,
    sentAt,
    status: "Sent",
  });
  assert.equal(sent.lastOutreachAt, sentAt);
  assert.equal(sent.status, "Follow-Up");
  assert.equal(sent.nextFollowUpDate, "2026-10-08");
  assert.equal(resolveMessage(sent, "Demo Email").messageBody, "Operator copy");
  assert.equal(recommendedNextAction(sent), "Call Tomorrow");
  assert.equal(generateOutreachPack(sent).kind, "Follow-Up Pack");
  assert.equal(applyOutreach(sent, msg, "Sent", "duplicate", sentAt), sent);
  const secondDraft = applyOutreach(
    sent,
    { ...msg, messageBody: "A new version" },
    "Draft",
    "activity-2",
    sentAt,
  );
  assert.equal(secondDraft.outreachActivities.length, 2);
  assert.equal(secondDraft.outreachActivities[0].messageBody, "Operator copy");
  assert.equal(copyText(msg), "Subject: Operator subject\n\nOperator copy");
});
test("A fresh call uses fresh drafts, while sent history and explicit follow-up dates remain intact", () => {
  const p = soccer({ demoRequested: true });
  const sent = applyOutreach(
    { ...p, nextFollowUpDate: "2026-10-10", followUpReason: "Agreed review" },
    resolveMessage(p, "Demo Email"),
    "Sent",
    "a",
    now,
  );
  const next = applyDebrief(
    sent,
    { ...blankDebrief, demoRequested: true },
    "call-2",
    now,
  );
  assert.equal(generateOutreachPack(next).kind, "Demo Send Pack");
  assert.equal(recommendedNextAction(next), "Send Demo");
  assert.equal(next.outreachActivities.length, 1);
  assert.equal(next.nextFollowUpDate, "2026-10-10");
  assert.equal(next.followUpReason, "Agreed review");
  for (const fields of [
    { meetingRequested: true },
    { proposalRequested: true },
  ]) {
    const x = soccer(fields);
    const sent = applyOutreach(
      x,
      resolveMessage(x, "Post-Call Follow-Up Email"),
      "Sent",
      "a",
      now,
    );
    assert.equal(sent.status, x.status);
  }
});
test("Follow-ups rank oldest first and real pipeline counts exclude closed prospects", () => {
  const a = soccer({ demoRequested: true });
  a.nextFollowUpDate = "2026-10-07";
  const b = {
    ...soccer({ meetingRequested: true }),
    id: "b",
    nextFollowUpDate: "2026-10-01",
  };
  const c = {
    ...soccer({ proposalRequested: true }),
    id: "c",
    nextFollowUpDate: "2026-10-08",
  };
  const lost = { ...a, id: "lost", status: "Lost" as const };
  const input = [a, c, lost, b];
  assert.deepEqual(
    followUpsDue(input, "2026-10-07").map((p) => p.id),
    ["b", a.id],
  );
  assert.deepEqual(pipelineCounts(input, "2026-10-07"), {
    priorities: 3,
    followUps: 2,
    demos: 1,
    meetings: 1,
    proposals: 1,
  });
  assert.equal(followUpDate({ ...a, nextFollowUpDate: "" }), null);
});
test("Version-one migration preserves calls, scores, prep and every prospect while adding outreach defaults", () => {
  const old = soccer({ demoRequested: true });
  const {
    outreachActivities,
    lastOutreachAt,
    nextFollowUpDate,
    followUpReason,
    ...oldFields
  } = old;
  const { notInterested, ...oldCall } = oldFields.calls[0];
  const legacy = { ...oldFields, calls: [oldCall] };
  const migrated = parseWorkspace(
    JSON.stringify({ version: 1, prospects: [legacy] }),
  );
  assert.equal(migrated.version, 3);
  assert.deepEqual(migrated.prospects, [
    {
      ...old,
      outreachActivities: [],
      lastOutreachAt: null,
      nextFollowUpDate: null,
      followUpReason: "",
    },
  ]);
  assert.deepEqual(migrated.prospects[0].intelligence, old.intelligence);
  void outreachActivities;
  void lastOutreachAt;
  void nextFollowUpDate;
  void followUpReason;
  void notInterested;
});

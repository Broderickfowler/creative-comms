import { test, expect, type Page } from "@playwright/test";
import type { Prospect } from "../../src/types/prospect";
const storageKey = "sekairos.revenue-command.v1";
let runtimeErrors: string[] = [];
test.beforeEach(async ({ page, context }) => {
  runtimeErrors = [];
  page.on("pageerror", (e) => runtimeErrors.push(e.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
});
test.afterEach(() => expect(runtimeErrors).toEqual([]));
async function logOutcome(page: Page, requests: string[]) {
  await page.goto("/prospects/fictional-soccer/debrief");
  for (const label of [
    "Answered",
    "Decision Maker Reached",
    "Meaningful Conversation",
    ...requests,
  ])
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  await page
    .getByRole("button", { name: "Save call debrief", exact: true })
    .click();
}
async function stored(page: Page): Promise<Prospect> {
  return page.evaluate(
    (key) =>
      JSON.parse(localStorage.getItem(key)!).prospects.find(
        (p: { id: string }) => p.id === "fictional-soccer",
      ),
    storageKey,
  );
}
async function clipboard(page: Page) {
  return page.evaluate(() => navigator.clipboard.readText());
}

test("Soccer demo → edit → refresh → real clipboard → Sent → due follow-up and pipeline", async ({
  page,
}) => {
  await logOutcome(page, ["Demo Requested"]);
  const savedAt = Date.now();
  await expect(page.getByTestId("debrief-status")).toHaveText("Demo Requested");
  await expect(page.getByTestId("debrief-next-action")).toHaveText("Send Demo");
  await expect(page.getByTestId("revenue-action-label")).toHaveText(
    "SEND DEMO",
  );
  await page.getByRole("link", { name: "Open Send Pack", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Demo Send Pack", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("recommended-offer")).toHaveText(
    "Player Enrollment System",
  );
  await expect(page.getByTestId("recommended-demo")).toContainText(
    "parent inquiry",
  );
  for (const label of [
    "Demo Email body",
    "WhatsApp Message body",
    "LinkedIn DM body",
  ])
    await expect(page.getByLabel(label, { exact: true })).not.toHaveValue("");
  const subject = "Sierra enrollment walkthrough";
  const body =
    "Hi Diego,\n\nThanks for the conversation. Would Thursday work for a short enrollment workflow demo?\n\n— Sekairos";
  await page.getByLabel("Demo Email subject", { exact: true }).fill(subject);
  await page.getByLabel("Demo Email body", { exact: true }).fill(body);
  await page.reload();
  await expect(
    page.getByLabel("Demo Email subject", { exact: true }),
  ).toHaveValue(subject);
  await expect(page.getByLabel("Demo Email body", { exact: true })).toHaveValue(
    body,
  );
  await page.getByRole("button", { name: "Copy Email", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Demo Email copied");
  expect(await clipboard(page)).toBe(`Subject: ${subject}\n\n${body}`);
  expect(Date.now() - savedAt).toBeLessThan(60_000);
  expect(
    (await stored(page)).outreachActivities.find(
      (a) => a.messageType === "Demo Email",
    )?.status,
  ).toBe("Prepared");
  const whatsApp = await page
    .getByLabel("WhatsApp Message body", { exact: true })
    .inputValue();
  await page
    .getByRole("button", { name: "Copy WhatsApp", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "WhatsApp Message copied",
  );
  expect(await clipboard(page)).toBe(whatsApp);
  const dm = await page
    .getByLabel("LinkedIn DM body", { exact: true })
    .inputValue();
  await page.getByRole("button", { name: "Copy DM", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("LinkedIn DM copied");
  expect(await clipboard(page)).toBe(dm);
  await page
    .getByTestId("next-revenue-action")
    .getByRole("button", { name: "Mark Sent", exact: true })
    .click();
  await expect(page.getByTestId("outreach-activity")).toContainText("Sent");
  await expect(page.getByTestId("last-outreach-at")).not.toHaveText(
    "No outreach marked sent",
  );
  let p = await stored(page);
  expect(p.status).toBe("Follow-Up");
  expect(p.lastOutreachAt).toBeTruthy();
  expect(
    p.outreachActivities.find((a) => a.messageType === "Demo Email"),
  ).toMatchObject({
    prospectId: p.id,
    channel: "Email",
    subject,
    messageBody: body,
    status: "Sent",
    sentAt: p.lastOutreachAt,
  });
  await expect(page.getByLabel("Next Follow-Up Date")).not.toHaveValue("");
  await page.getByLabel("Next Follow-Up Date").fill("2000-01-01");
  await page
    .getByLabel("Follow-Up Reason")
    .fill("Confirm the enrollment demo and agree the next conversation.");
  await page
    .getByRole("button", { name: "Save follow-up", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Follow-up saved." }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Next Follow-Up Date")).toHaveValue(
    "2000-01-01",
  );
  await page.goto("/command");
  const due = page
    .getByTestId("follow-up-card")
    .filter({ hasText: "Sierra Football Academy" });
  await expect(due).toContainText("Overdue");
  await expect(due).toContainText("Confirm the enrollment demo");
  await expect(page.getByTestId("pipeline-follow-ups")).toContainText("1");
  await expect(page.getByTestId("pipeline-demos")).toContainText("0");
  await expect(page.getByTestId("pipeline-priorities")).toContainText("3");
  await due.getByRole("link", { name: "Open Send Pack", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Follow-Up Pack", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/outreach-mobile.png",
    fullPage: true,
  });
  p = await stored(page);
  expect(p.outreachActivities.filter((a) => a.status === "Sent")).toHaveLength(
    1,
  );
});

for (const [request, kind, status, action, cta, count] of [
  [
    "Email Requested",
    "Information Send Pack",
    "Contacted",
    "Send Email",
    "right priority",
    null,
  ],
  [
    "Meeting Requested",
    "Scheduling Response",
    "Meeting Requested",
    "Schedule Meeting",
    "two times",
    "meetings",
  ],
  [
    "Proposal Requested",
    "Proposal Acknowledgment",
    "Proposal",
    "Create Proposal",
    "scope, owner, budget",
    "proposals",
  ],
] as const) {
  test(`${request} produces the correct editable pack and preserves pipeline stage after acknowledgment`, async ({
    page,
  }) => {
    await logOutcome(page, [request]);
    await expect(page.getByTestId("debrief-status")).toHaveText(status);
    await expect(page.getByTestId("debrief-next-action")).toHaveText(action);
    await page
      .getByRole("link", { name: "Open Send Pack", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: kind, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByLabel("Post-Call Follow-Up Email body", { exact: true }),
    ).toHaveValue(new RegExp(cta));
    await page.getByRole("button", { name: "Copy Email", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("copied");
    expect(await clipboard(page)).toContain(cta);
    await page
      .getByTestId("next-revenue-action")
      .getByRole("button", { name: "Mark Sent", exact: true })
      .click();
    expect((await stored(page)).status).toBe(
      request === "Email Requested" ? "Follow-Up" : status,
    );
    await page.goto("/command");
    if (count)
      await expect(page.getByTestId(`pipeline-${count}`)).toContainText("1");
  });
}

test("Every channel can edit, persist, copy actual text and reset without changing sent history", async ({
  page,
}) => {
  await page.goto("/prospects/fictional-soccer/outreach");
  await page
    .getByText("Other channel drafts & follow-ups", { exact: false })
    .click();
  await expect(page.getByTestId("message-editor")).toHaveCount(9);
  for (const type of [
    "Initial Email",
    "Post-Call Follow-Up Email",
    "Demo Email",
    "Follow-Up Email 1",
    "Follow-Up Email 2",
    "WhatsApp Message",
    "LinkedIn DM",
    "Instagram / Facebook DM",
    "Voicemail",
  ]) {
    const card = page
      .getByTestId("message-editor")
      .filter({ has: page.getByRole("heading", { name: type, exact: true }) });
    const input = card.getByLabel(`${type} body`, { exact: true });
    const original = await input.inputValue();
    await input.fill(`Edited ${type}`);
    await card.getByRole("button", { name: "Copy", exact: true }).click();
    await expect(card.getByRole("status")).toContainText("copied");
    expect(await clipboard(page)).toContain(`Edited ${type}`);
    await card
      .getByRole("button", { name: "Reset to generated version", exact: true })
      .click();
    await expect(input).toHaveValue(original);
  }
  await page.reload();
  await page
    .getByText("Other channel drafts & follow-ups", { exact: false })
    .click();
  await expect(
    page.getByLabel("Voicemail body", { exact: true }),
  ).not.toHaveValue("Edited Voicemail");
  expect((await stored(page)).outreachActivities).toHaveLength(9);
});

test("Not interested suppresses quick actions and all persuasive drafts", async ({
  page,
}) => {
  await logOutcome(page, ["Demo Requested", "Not interested / Disqualified"]);
  await expect(page.getByTestId("debrief-status")).toHaveText("Lost");
  await expect(page.getByTestId("revenue-action-label")).toHaveText(
    "DISQUALIFY / STOP OUTREACH",
  );
  await expect(
    page.getByRole("button", { name: "Copy Email", exact: true }),
  ).toHaveCount(0);
  await page.goto("/prospects/fictional-soccer/outreach");
  await expect(
    page.getByRole("heading", { name: "Outreach Suppressed", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("message-editor")).toHaveCount(0);
  await page.goto("/command");
  await expect(
    page
      .getByTestId("priority-card")
      .filter({ hasText: "Sierra Football Academy" }),
  ).toHaveCount(0);
});

test("Copy failure shows no prepared success and draft write failure preserves saved data", async ({
  page,
}) => {
  await page.goto("/prospects/fictional-soccer/outreach");
  await expect(
    page.getByLabel("Initial Email body", { exact: true }),
  ).toBeVisible();
  const original = await page
    .getByLabel("Initial Email body", { exact: true })
    .inputValue();
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: async () => {
        throw new Error("Clipboard blocked");
      },
    });
    Object.defineProperty(document, "execCommand", { value: () => false });
  });
  await page.getByRole("button", { name: "Copy Email", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Copy failed",
  );
  expect((await stored(page)).outreachActivities).toHaveLength(0);
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    }),
  );
  await page
    .getByLabel("Initial Email body", { exact: true })
    .fill("Must not be saved");
  await expect(
    page
      .getByRole("main")
      .getByRole("alert")
      .filter({ hasText: "Changes were not saved" }),
  ).toBeVisible();
  expect((await stored(page)).outreachActivities).toHaveLength(0);
  await page.reload();
  await expect(
    page.getByLabel("Initial Email body", { exact: true }),
  ).toHaveValue(original);
});

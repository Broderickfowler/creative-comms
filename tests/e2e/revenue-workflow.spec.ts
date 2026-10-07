import { test, expect, type Page } from "@playwright/test";

let runtimeErrors: string[] = [];
test.beforeEach(({ page }) => {
  runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
});
test.afterEach(() => expect(runtimeErrors).toEqual([]));

async function score(page: Page, total: number) {
  const values = [
    20,
    20,
    Math.min(25, total - 40),
    Math.min(15, Math.max(0, total - 65)),
    Math.max(0, total - 80),
    0,
  ];
  for (const [index, label] of [
    "DESIRE",
    "VISION",
    "MONEY",
    "FRICTION",
    "TIMING",
    "SEKAIROS FIT",
  ].entries()) {
    await page
      .getByLabel(`${label} score`, { exact: true })
      .fill(String(values[index]));
  }
}

test("complete prospect → intelligence → priority → prep → demo debrief → persistent next action", async ({
  page,
}) => {
  await page.goto("/prospects");
  await expect(
    page.getByText("Fictional example", { exact: true }),
  ).toHaveCount(3);
  await page
    .getByRole("link", { name: "Create prospect", exact: true })
    .click();
  const fields = {
    "Company name": "Acceptance Studio",
    Website: "https://acceptance-studio.example",
    Industry: "B2B creative services",
    Location: "Monterrey, Mexico",
    Source: "Operator research",
    "Contact first name": "Elena",
    "Contact last name": "Vega",
    "Contact role": "Founder",
    Email: "elena@acceptance-studio.example",
    Phone: "+52 81 5555 0140",
    Notes: "Fictional acceptance-test record",
    "Estimated opportunity value (USD)": "12000",
  };
  for (const [label, value] of Object.entries(fields))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page
    .getByLabel("ICP", { exact: true })
    .selectOption("Founder / Local Business");
  await page.getByLabel("Status", { exact: true }).selectOption("Researching");
  await page
    .getByRole("button", { name: "Create prospect", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Acceptance Studio", exact: true }),
  ).toBeVisible();
  const detailUrl = page.url();
  const id = new URL(detailUrl).pathname.split("/").at(-1)!;
  await page.getByRole("link", { name: "Edit prospect", exact: true }).click();
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Acceptance Studio Updated");
  await page.getByLabel("Phone", { exact: true }).fill("+52 81 5555 0141");
  await page
    .getByRole("button", { name: "Save prospect", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Acceptance Studio Updated",
      exact: true,
    }),
  ).toBeVisible();
  const intelligence = {
    "Desired Outcome": "Book 12 qualified retainer conversations each month.",
    "Vision Signal": "A predictable pipeline without founder-owned follow-up.",
    "Money Signal": "Two US$6,000/month retainers; budget needs verification.",
    "Operational Friction": "Inbound inquiries lack an owner.",
    "Timing Signal": "New account lead starts next month.",
    "Sekairos Opportunity": "A focused inquiry-to-next-action workflow.",
    "Verification Needed": "Confirm the decision maker and budget.",
  };
  for (const [label, value] of Object.entries(intelligence))
    await page.getByLabel(label, { exact: true }).fill(value);
  for (const [total, classification] of [
    [54, "LOW PRIORITY"],
    [55, "NURTURE"],
    [69, "NURTURE"],
    [70, "ACTIVE PURSUIT"],
    [84, "ACTIVE PURSUIT"],
    [85, "CALL NOW"],
  ] as const) {
    await score(page, total);
    await expect(page.getByTestId("score-total")).toHaveText(String(total));
    await expect(page.getByTestId("score-classification")).toHaveText(
      classification,
    );
  }
  await page
    .getByRole("button", { name: "Save intelligence", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Intelligence saved");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: /^Command/ })
    .click();
  const card = page
    .getByTestId("priority-card")
    .filter({ hasText: "Acceptance Studio Updated" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("85");
  await expect(card).toContainText(intelligence["Desired Outcome"]);
  await expect(card).toContainText(intelligence["Money Signal"]);
  await card.getByRole("link", { name: "Call Prep", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Call Prep", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("30-second opener", { exact: true }),
  ).toHaveValue(/Acceptance Studio Updated/);
  for (let i = 1; i <= 5; i++)
    await expect(
      page.getByLabel(`Discovery question ${i}`, { exact: true }),
    ).not.toHaveValue("");
  await page
    .getByLabel("30-second opener", { exact: true })
    .fill("Elena, may I ask about your current inquiry handoff?");
  await page
    .getByLabel("Discovery question 1", { exact: true })
    .fill("Who owns the first follow-up today?");
  await page
    .getByRole("button", { name: "Save Call Prep", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Call Prep saved");
  await page.reload();
  await expect(
    page.getByLabel("30-second opener", { exact: true }),
  ).toHaveValue("Elena, may I ask about your current inquiry handoff?");
  await expect(
    page.getByLabel("Discovery question 1", { exact: true }),
  ).toHaveValue("Who owns the first follow-up today?");
  await page.getByRole("link", { name: "Log a call", exact: true }).click();
  for (const label of [
    "Answered",
    "Decision Maker Reached",
    "Meaningful Conversation",
    "Email Requested",
    "Demo Requested",
    "Budget Mentioned",
    "Follow-Up Required",
  ])
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  const debrief = {
    "Current Process": "Spreadsheet and inbox",
    "Primary Problem": "Follow-up ownership is unclear",
    "Desired Outcome": "A repeatable inquiry handoff",
    "Money Signal": "Budget discussed; amount not yet approved",
    Timing: "Evaluate next week",
    "Current Technology": "Google Sheets",
    Objection: "Concerned about extra admin",
    "Next Action": "Send a relevant demo and confirm fit",
    Notes: "Operator call notes — fictional test",
  };
  for (const [label, value] of Object.entries(debrief))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("Follow-Up Date", { exact: true }).fill("2026-10-08");
  await page
    .getByRole("button", { name: "Save call debrief", exact: true })
    .click();
  await expect(page.getByTestId("debrief-status")).toHaveText("Demo Requested");
  await expect(page.getByTestId("debrief-next-action")).toHaveText("Send Demo");
  await page.getByRole("link", { name: "View prospect", exact: true }).click();
  await expect(page.getByTestId("prospect-status")).toHaveText(
    "Demo Requested",
  );
  await expect(page.getByTestId("next-action")).toHaveText("Send Demo");
  await page.reload();
  await expect(page.getByTestId("prospect-status")).toHaveText(
    "Demo Requested",
  );
  await expect(page.getByTestId("next-action")).toHaveText("Send Demo");
  await expect(page.getByLabel("Desired Outcome", { exact: true })).toHaveValue(
    debrief["Desired Outcome"],
  );
  const stored = await page.evaluate(
    (prospectId) =>
      JSON.parse(
        localStorage.getItem("sekairos.revenue-command.v1")!,
      ).prospects.find((p: { id: string }) => p.id === prospectId),
    id,
  );
  expect(stored.companyName).toBe("Acceptance Studio Updated");
  expect(stored.phone).toBe("+52 81 5555 0141");
  expect(stored.estimatedOpportunityValue).toBe(12000);
  expect(stored.createdAt).toBeTruthy();
  expect(stored.updatedAt).toBeTruthy();
  expect(stored.callPrep.discoveryQuestions).toHaveLength(5);
  expect(stored.calls).toHaveLength(1);
  expect(stored.calls[0]).toMatchObject({
    demoRequested: true,
    followUpDate: "2026-10-08",
    recommendedNextAction: "Send Demo",
    nextAction: debrief["Next Action"],
    notes: debrief.Notes,
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: /^Command/ })
    .click();
  await expect(
    page
      .getByTestId("priority-card")
      .filter({ hasText: "Acceptance Studio Updated" }),
  ).toContainText("Send Demo");
  await page.screenshot({
    path: "test-results/revenue-command-desktop.png",
    fullPage: true,
  });
});

test("search, filters, mobile navigation, delete cancellation and deletion persist", async ({
  page,
}) => {
  await page.goto("/prospects");
  await page.getByLabel("Filter by ICP").selectOption("Soccer Club / Academy");
  await expect(
    page.getByRole("link", { name: "Sierra Football Academy", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Norte Studio", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Filter by ICP").selectOption("All ICPs");
  await page.getByLabel("Filter by status").selectOption("Researching");
  await expect(
    page.getByRole("link", {
      name: "Westbridge College Athletics",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Filter by status").selectOption("All statuses");
  await page.getByLabel("Search prospects").fill("Mariana");
  await page.getByRole("link", { name: "Norte Studio", exact: true }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "Delete prospect", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Norte Studio", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /^Command/ })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "TODAY'S REVENUE PRIORITIES" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/revenue-command-mobile.png",
    fullPage: true,
  });
  await page
    .getByTestId("priority-card")
    .filter({ hasText: "Norte Studio" })
    .getByRole("link", { name: "Open prospect" })
    .click();
  await expect(page).toHaveURL(/\/prospects\/fictional-founder$/);
  const deletedUrl = page.url();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Delete prospect", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Prospects", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Norte Studio", exact: true }),
  ).toHaveCount(0);
  await page.goto(deletedUrl);
  await expect(
    page.getByRole("heading", { name: "Prospect not found in this workspace" }),
  ).toBeVisible();
});

test("meaningful, demo, meeting, and proposal transitions preserve the strongest requested outcome", async ({
  page,
}) => {
  await page.goto("/prospects/fictional-soccer/debrief");
  await page.getByRole("checkbox", { name: "Answered", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "Meaningful Conversation", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Save call debrief", exact: true })
    .click();
  await expect(page.getByTestId("debrief-status")).toHaveText("Contacted");
  await page.reload();
  for (const label of ["Answered", "Demo Requested", "Meeting Requested"])
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  await page
    .getByRole("button", { name: "Save call debrief", exact: true })
    .click();
  await expect(page.getByTestId("debrief-status")).toHaveText(
    "Meeting Requested",
  );
  await expect(page.getByTestId("debrief-next-action")).toHaveText(
    "Schedule Meeting",
  );
  await page.reload();
  for (const label of [
    "Demo Requested",
    "Meeting Requested",
    "Proposal Requested",
  ])
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  await page
    .getByRole("button", { name: "Save call debrief", exact: true })
    .click();
  await expect(page.getByTestId("debrief-status")).toHaveText("Proposal");
  await expect(page.getByTestId("debrief-next-action")).toHaveText(
    "Create Proposal",
  );
  await page.getByRole("link", { name: "View prospect", exact: true }).click();
  await expect(page.getByText(/Call history/)).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("sekairos.revenue-command.v1")!,
        ).prospects.find((p: { id: string }) => p.id === "fictional-soccer")
          .calls.length,
    ),
  ).toBe(3);
});

test("invalid saved data is preserved and cannot silently reseed", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("sekairos.revenue-command.v1", "{invalid-workspace}"),
  );
  await page.goto("/command");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Existing data has not been replaced",
  );
  await page.getByRole("button", { name: "Retry opening workspace" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("sekairos.revenue-command.v1"),
    ),
  ).toBe("{invalid-workspace}");
});

test("write failures show an error instead of a successful create", async ({
  page,
}) => {
  await page.goto("/prospects");
  await expect(
    page.getByRole("link", { name: "Norte Studio", exact: true }),
  ).toBeVisible();
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    }),
  );
  await page
    .getByRole("link", { name: "Create prospect", exact: true })
    .click();
  await page
    .getByLabel("Company name", { exact: true })
    .fill("Must not persist");
  await page
    .getByRole("button", { name: "Create prospect", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "not saved",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("sekairos.revenue-command.v1")!)
          .prospects.length,
    ),
  ).toBe(3);
});

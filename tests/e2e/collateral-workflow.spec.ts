import { test, expect, type Page } from "@playwright/test";
import type { Workspace } from "../../src/types/prospect";
const storageKey = "sekairos.revenue-command.v1";
let runtimeErrors: string[] = [];
test.beforeEach(async ({ page, context }) => {
  runtimeErrors = [];
  page.on("pageerror", (e) => runtimeErrors.push(e.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() =>
    Object.defineProperty(window, "print", {
      value: () => {
        document.documentElement.dataset.printCalls = String(
          Number(document.documentElement.dataset.printCalls ?? "0") + 1,
        );
      },
    }),
  );
});
test.afterEach(() => expect(runtimeErrors).toEqual([]));
async function workspace(page: Page): Promise<Workspace> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as Workspace,
    storageKey,
  );
}
async function requestDemo(page: Page, id: string, desiredOutcome: string) {
  await page.goto(`/prospects/${id}/debrief`);
  for (const label of [
    "Answered",
    "Decision Maker Reached",
    "Meaningful Conversation",
    "Demo Requested",
  ])
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  await page
    .getByLabel("Desired Outcome", { exact: true })
    .fill(desiredOutcome);
  await page
    .getByRole("button", { name: "Save call debrief", exact: true })
    .click();
  await expect(page.getByTestId("debrief-status")).toHaveText("Demo Requested");
}
function pageCount(pdf: Buffer) {
  return (pdf.toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
}

test("Soccer intelligence → matched demo → editable brief → one-page print → send-ready material", async ({
  page,
}) => {
  await requestDemo(page, "fictional-soccer", "Increase player enrollment");
  const readyAt = Date.now();
  await expect(page.getByTestId("revenue-action-label")).toHaveText(
    "Send Demo + Opportunity Brief",
  );
  await page.getByRole("link", { name: "Open Send Pack", exact: true }).click();
  const material = page.getByTestId("recommended-material");
  await expect(material.getByTestId("primary-asset")).toContainText(
    "Player Enrollment Demo",
  );
  await expect(material).toContainText(
    "application-to-trial-to-payment-to-enrollment",
  );
  const assetUrl = "https://example.com/sekairos/soccer-enrollment";
  await expect(
    material.getByRole("link", { name: "Open Asset", exact: true }),
  ).toHaveAttribute("href", assetUrl);
  await material
    .getByRole("button", { name: "Copy Asset Link", exact: true })
    .click();
  await expect(material.getByRole("status")).toContainText("asset link copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    assetUrl,
  );
  await material
    .getByRole("link", { name: "Open Opportunity Brief", exact: true })
    .click();
  await expect(page.getByTestId("brief-company")).toHaveText(
    "Sierra Football Academy",
  );
  const p = (await workspace(page)).prospects.find(
    (p) => p.id === "fictional-soccer",
  )!;
  const signalFields = {
    desiredOutcome: p.intelligence.desiredOutcome,
    vision: p.intelligence.visionSignal,
    moneyInMotion: p.intelligence.moneySignal,
    executionFriction: p.intelligence.operationalFriction,
    whyNow: p.intelligence.timingSignal,
    sekairosOpportunity: p.intelligence.sekairosOpportunity,
    verificationNeeded: p.intelligence.verificationNeeded,
  };
  for (const [key, value] of Object.entries(signalFields))
    await expect(page.getByTestId(`brief-${key}`)).toContainText(value);
  await expect(page.getByTestId("brief-recommendedFirstMove")).toContainText(
    "Player Enrollment System",
  );
  await expect(page.getByTestId("brief-potentialBusinessImpact")).toContainText(
    "Requires discovery.",
  );
  await expect(page.getByTestId("brief-score")).toContainText("76");
  await expect(page.getByTestId("brief-score")).toContainText("ACTIVE PURSUIT");
  await expect(page.getByTestId("brief-recommended-asset")).toContainText(
    "Player Enrollment Demo",
  );
  expect(Date.now() - readyAt).toBeLessThan(60_000);
  await page.getByRole("button", { name: "Edit brief", exact: true }).click();
  const vision =
    "An owned enrollment journey, with each parent inquiry assigned to a clear next step.";
  await page.getByLabel("VISION", { exact: true }).fill(vision);
  await page.getByRole("button", { name: "Save brief", exact: true }).click();
  await expect(page.getByTestId("brief-vision")).toContainText(vision);
  await page.reload();
  await expect(page.getByTestId("brief-vision")).toContainText(vision);
  const saved = (await workspace(page)).prospects.find(
    (p) => p.id === "fictional-soccer",
  )!;
  expect(saved.brief?.overrides).toEqual({ vision });
  expect(saved.intelligence.visionSignal).toBe(p.intelligence.visionSignal);
  await page
    .getByRole("button", { name: "Print / Save as PDF", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-print-calls", "1");
  await page.getByRole("button", { name: "Edit brief", exact: true }).click();
  await page.emulateMedia({ media: "print" });
  await expect(
    page.locator('aside[aria-label="Workspace sidebar"]'),
  ).toBeHidden();
  await expect(page.locator(".brief-controls")).toBeHidden();
  await expect(page.locator("form[data-print-internal]")).toBeHidden();
  await expect(page.locator(".app-content > header")).toBeHidden();
  await expect(page.locator(".app-content > footer")).toBeHidden();
  await expect(page.getByTestId("brief-document")).toBeVisible();
  const pdf = await page.pdf({
    path: "test-results/soccer-opportunity-brief.pdf",
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pageCount(pdf)).toBe(1);
  await page.screenshot({
    path: "test-results/opportunity-brief-print.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Close editor", exact: true }).click();
  await page.screenshot({
    path: "test-results/opportunity-brief-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Back to Outreach", exact: true })
    .click();
  await expect(page.getByTestId("revenue-action-label")).toHaveText(
    "Send Demo + Opportunity Brief",
  );
  const email = page.getByTestId("message-editor").filter({
    has: page.getByRole("heading", { name: "Demo Email", exact: true }),
  });
  await email
    .getByRole("button", { name: "Add Asset Link", exact: true })
    .click();
  await expect(page.getByLabel("Demo Email body", { exact: true })).toHaveValue(
    new RegExp(assetUrl),
  );
  await page.getByRole("button", { name: "Copy Email", exact: true }).click();
  await expect(
    page.getByTestId("next-revenue-action").getByRole("status"),
  ).toContainText("copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    assetUrl,
  );
  await page.goto("/command");
  const pending = page
    .getByTestId("material-card")
    .filter({ hasText: "Sierra Football Academy" });
  await expect(pending).toContainText("Demo Requested");
  await expect(pending).toContainText("Player Enrollment Demo");
  await expect(pending).toContainText("Send Demo + Opportunity Brief");
  await pending
    .getByRole("link", { name: "Open Send Pack", exact: true })
    .click();
  await page
    .getByTestId("next-revenue-action")
    .getByRole("button", { name: "Mark Sent", exact: true })
    .click();
  await page.goto("/command");
  await expect(
    page
      .getByTestId("material-card")
      .filter({ hasText: "Sierra Football Academy" }),
  ).toHaveCount(0);
  await page.goto("/prospects/fictional-soccer/outreach");
  await page
    .getByTestId("recommended-material")
    .getByRole("link", { name: "Print / Save PDF", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-print-calls", "1");
  await expect(page.getByTestId("brief-vision")).toContainText(vision);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/opportunity-brief-mobile.png",
    fullPage: true,
  });
});

test("Sales asset create, edit, delete, example URL replacement, filters, and Open Asset work", async ({
  page,
  context,
}) => {
  await page.goto("/command");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: /^Sales Assets/ })
    .click();
  await expect(page.getByTestId("asset-card")).toHaveCount(11);
  await expect(page.getByText("Example asset", { exact: true })).toHaveCount(
    11,
  );
  await page
    .getByLabel("Filter assets by ICP")
    .selectOption("Soccer Club / Academy");
  await expect(page.getByTestId("asset-card")).toHaveCount(4);
  await page.getByLabel("Filter assets by type").selectOption("Demo");
  await expect(page.getByTestId("asset-card")).toHaveCount(3);
  await page
    .getByLabel("Filter assets by offer")
    .selectOption("Player Enrollment System");
  await expect(page.getByTestId("asset-card")).toHaveCount(1);
  const enrollment = page.getByTestId("asset-card");
  await enrollment
    .getByRole("link", { name: "Edit asset", exact: true })
    .click();
  const url = "http://127.0.0.1:3200/command";
  await page.getByLabel("Asset URL", { exact: true }).fill(url);
  await page.getByRole("button", { name: "Save asset", exact: true }).click();
  const replaced = page.getByTestId("asset-card").filter({
    has: page.getByRole("heading", {
      name: "Player Enrollment Demo",
      exact: true,
    }),
  });
  await expect(
    replaced.getByText("Example asset", { exact: true }),
  ).toHaveCount(0);
  const popupPromise = context.waitForEvent("page");
  await replaced.getByRole("link", { name: "Open Asset", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(url);
  await expect(
    popup.getByRole("heading", { name: "TODAY'S REVENUE PRIORITIES" }),
  ).toBeVisible();
  await popup.close();
  await page.getByRole("link", { name: "Create asset", exact: true }).click();
  for (const [label, value] of Object.entries({
    "Asset name": "Operator Information Pack",
    "Asset URL": url,
    Offer: "Capacity Sprint",
    Description: "Operator-approved information material.",
    "Use when": "A capacity constraint needs a first conversation.",
  }))
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("Asset type").selectOption("PDF");
  await page.getByLabel("Asset ICP").selectOption("Universal");
  await page.getByRole("button", { name: "Create asset", exact: true }).click();
  await expect(page).toHaveURL(/\/sales-assets$/);
  await expect(
    page
      .getByTestId("asset-card")
      .filter({ hasText: "Operator Information Pack" }),
  ).toBeVisible();
  await page.reload();
  await page.getByLabel("Filter assets by ICP").selectOption("Universal");
  await page.getByLabel("Filter assets by type").selectOption("PDF");
  await page
    .getByLabel("Filter assets by offer")
    .selectOption("Capacity Sprint");
  const card = page.getByTestId("asset-card");
  await expect(card).toContainText("Operator Information Pack");
  await card.getByRole("link", { name: "Edit asset", exact: true }).click();
  await page.getByLabel("Asset name").fill("Edited Information Pack");
  await page.getByLabel("Asset status").selectOption("Inactive");
  await page.getByRole("button", { name: "Save asset", exact: true }).click();
  const edited = page
    .getByTestId("asset-card")
    .filter({ hasText: "Edited Information Pack" });
  await expect(edited).toContainText("Inactive");
  page.once("dialog", (d) => d.dismiss());
  await edited
    .getByRole("button", {
      name: "Delete Edited Information Pack",
      exact: true,
    })
    .click();
  await expect(edited).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await edited
    .getByRole("button", {
      name: "Delete Edited Information Pack",
      exact: true,
    })
    .click();
  await page.reload();
  await expect(
    page
      .getByTestId("asset-card")
      .filter({ hasText: "Edited Information Pack" }),
  ).toHaveCount(0);
  await page
    .getByLabel("Filter assets by ICP")
    .selectOption("Founder / Local Business");
  await page
    .getByLabel("Filter assets by offer")
    .selectOption("Player Enrollment System");
  await expect(
    page.getByRole("heading", { name: "No matching assets" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByTestId("asset-card")).toHaveCount(11);
});

for (const [id, desired, asset] of [
  [
    "fictional-founder",
    "Own each CRM follow-up",
    "CRM / Follow-Up System Demo",
  ],
  [
    "fictional-college",
    "Resolve cross-system handoffs",
    "Cross-System Operations Layer",
  ],
] as const) {
  test(`${id} receives appropriate collateral and a one-page brief`, async ({
    page,
  }) => {
    await requestDemo(page, id, desired);
    await page
      .getByRole("link", { name: "Open Send Pack", exact: true })
      .click();
    await expect(page.getByTestId("primary-asset")).toContainText(asset);
    await expect(page.getByTestId("revenue-action-label")).toHaveText(
      "Send Demo + Opportunity Brief",
    );
    await page
      .getByRole("link", { name: "Open Opportunity Brief", exact: true })
      .click();
    await expect(page.getByTestId("brief-desiredOutcome")).toContainText(
      desired,
    );
    await expect(page.getByTestId("brief-recommended-asset")).toContainText(
      asset,
    );
    const pdf = await page.pdf({
      path: `test-results/${id}-brief.pdf`,
      preferCSSPageSize: true,
      printBackground: true,
    });
    expect(pageCount(pdf)).toBe(1);
  });
}

test("Brief reset restores live defaults without changing intelligence or scores", async ({
  page,
}) => {
  await page.goto("/prospects/fictional-founder/brief");
  await expect(page.getByTestId("brief-document")).toBeVisible();
  const before = (await workspace(page)).prospects[0];
  await page.getByRole("button", { name: "Edit brief", exact: true }).click();
  await page
    .getByLabel("DESIRED OUTCOME", { exact: true })
    .fill("Customized executive wording");
  await page.getByRole("button", { name: "Save brief", exact: true }).click();
  await page.reload();
  await expect(page.getByTestId("brief-desiredOutcome")).toContainText(
    "Customized executive wording",
  );
  await page
    .getByRole("button", { name: "Reset to generated version", exact: true })
    .click();
  await page.reload();
  await expect(page.getByTestId("brief-desiredOutcome")).toContainText(
    before.intelligence.desiredOutcome,
  );
  const after = (await workspace(page)).prospects[0];
  expect(after.brief).toBeNull();
  expect(after.intelligence).toEqual(before.intelligence);
});

test("Existing version-two prospects and sent outreach survive browser migration without duplicate seeds", async ({
  page,
}) => {
  await requestDemo(page, "fictional-soccer", "Increase player enrollment");
  await page.getByRole("link", { name: "Open Send Pack", exact: true }).click();
  await page
    .getByTestId("next-revenue-action")
    .getByRole("button", { name: "Mark Sent", exact: true })
    .click();
  const before = await workspace(page);
  const legacy = {
    version: 2,
    prospects: before.prospects.map((p) => {
      const { brief, ...old } = p;
      void brief;
      return old;
    }),
  };
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: storageKey, data: legacy },
  );
  await page.reload();
  await expect(page.getByTestId("outreach-activity")).toContainText("Sent");
  const migrated = await workspace(page);
  expect(migrated.version).toBe(3);
  expect(migrated.prospects).toEqual(before.prospects);
  expect(migrated.assets).toHaveLength(11);
  await page.goto("/sales-assets");
  await page.reload();
  expect((await workspace(page)).assets).toHaveLength(11);
});

test("Brief and asset write failures cannot claim success or discard existing data", async ({
  page,
}) => {
  await page.goto("/sales-assets");
  await expect(page.getByTestId("asset-card")).toHaveCount(11);
  const before = await workspace(page);
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    }),
  );
  await page.getByRole("link", { name: "Create asset", exact: true }).click();
  await page.getByLabel("Asset name").fill("Must not save");
  await page.getByLabel("Asset URL").fill("https://example.com/no-save");
  await page.getByRole("button", { name: "Create asset", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "not saved",
  );
  expect(await workspace(page)).toEqual(before);
  await page.goto("/prospects/fictional-founder/brief");
  await page.evaluate(() =>
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    }),
  );
  await page.getByRole("button", { name: "Edit brief", exact: true }).click();
  await page.getByLabel("VISION", { exact: true }).fill("Must not persist");
  await page.getByRole("button", { name: "Save brief", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "not saved",
  );
  expect(await workspace(page)).toEqual(before);
  await page.reload();
  await expect(page.getByTestId("brief-vision")).toContainText(
    before.prospects[0].intelligence.visionSignal,
  );
});

# Current sprint — build/revenue-command-v1

## Goal

Create a prospect-specific executive Opportunity Brief and automatically match the prospect to the most appropriate Sekairos demo, offer, case study, website, or sales asset. When a prospect asks for information or a demo, the operator should be able to prepare the right material in under 60 seconds.

PROSPECT INTELLIGENCE → OPPORTUNITY BRIEF → SALES ASSET MATCHING → SEND-READY COLLATERAL.

## Completed work

- Read AGENTS.md, PRODUCT.md, ARCHITECTURE.md, and the prior sprint record before changes; recorded this sprint goal first.
- Kept the existing checkout and workflows on build/revenue-command-v1 from 3812c6ad8dc5d502c78bfcd303a5589bfe125003. Main remains the foundation baseline 8f29d395e4b98313d7a737417224d9494fc9af40 and must not be modified or merged.
- Added a local Sales Asset Library with all specified fields, eight asset types, the three ICPs plus Universal, Active/Inactive status, URL-based create/edit/delete, and ICP/type/offer filters.
- Seeded eleven clearly labeled example assets covering the requested Founder, Soccer, and College material. Replacing an example URL with a real link removes its example label; inactive/deleted assets stop matching.
- Added deterministic primary/secondary matching and reasons based on ICP, recommended offer, desired outcome, Sekairos Opportunity, and demo/email/proposal requests. Matching logic lives outside UI components.
- Added `/prospects/[id]/brief` with premium executive styling, all requested fields, score/classification, matched asset, and working Open Asset links. Generated business impact is Requires discovery.; no ROI or revenue results are invented.
- Added Edit, Save, and Reset for separately persisted brief overrides. Underlying intelligence and scores remain intact; non-overridden fields use live defaults.
- Added browser Print / Save as PDF and direct print access from Outreach. Print hides navigation, shell controls, forms, and internal action buttons, while retaining required context and example labels. Standard briefs fit one A4 page without a PDF dependency.
- Integrated Recommended Material, Copy Asset Link, secondary material, Open Opportunity Brief, Print / Save PDF, and Add Asset Link into Outreach. Message edits remain intact and duplicate URLs are avoided.
- Improved NEXT REVENUE ACTION labels to Send Demo + Opportunity Brief, Send Information Pack, and Prepare Proposal. Existing stored call recommendations remain intact.
- Added MATERIAL TO SEND on Command for current demo/email/proposal requests without relevant Sent activity. Prepared drafts remain visible; a relevant manual send clears the request, and a new call can reopen it.
- Migrated the existing workspace to schema version three using the same storage key, preserving prospects, intelligence, prep, calls, outreach edits/history, and follow-up dates. Empty libraries remain empty; failed writes preserve saved data.
- Updated README, PRODUCT.md, and ARCHITECTURE.md with behavior, rules, and limits.

## Validation

- `npm test`: 45 passing domain/persistence tests, covering matching across all ICPs, Universal/inactive assets, safe URL schemes, brief generation/overrides/reset, no invented impact, material queue behavior, migration, asset CRUD, and write failures, plus all prior scoring/workflow rules.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: 19 passing production-browser tests in isolated contexts on port 3200, with no browser runtime errors.
- Soccer acceptance passed: Increase player enrollment + Demo Requested → Player Enrollment Demo and Player Enrollment System → all brief signals and score → edit/refresh persistence → print controls hidden → actual URL clipboard read-back → Add Asset Link → Send Demo + Opportunity Brief → Sent activity removes the prospect from Material to Send. Automated material copy and brief preparation passed the under-60-second assertion.
- Founder CRM and College cross-system matching passed. All three exported briefs were verified as one-page PDFs. Soccer PDF metadata confirms A4; extracted text contains the prospect/asset context and excludes internal controls. Desktop and print screenshots were visually reviewed; mobile has no horizontal overflow.
- Asset creation/edit/deletion, cancellation, all filters, example URL replacement, and actual Open Asset navigation passed. Brief reset and storage-failure UI passed. Version-two sent activity survived browser migration without duplicate seeds.
- All previous prospect/outreach browser regressions passed, including score thresholds, persistence, copy/reset, call outcomes, filters, mobile navigation, corrupted storage, and failed writes.
- `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build`: passed. Browser test sequencing was corrected to await navigation and initial workspace hydration and reinject simulated storage failures after document navigation.

## Active work

No active product development. Implementation and validation are complete.

## Git persistence

Commit with `feat: build opportunity briefs and sales assets` and push only origin/build/revenue-command-v1. Verify the remote branch and clean working tree. Do not modify or merge main.

## Next work

Await the next explicitly scoped revenue task. No additional functionality is included in this sprint.

## Known limitations

Storage and brief routes are browser/origin-local, without backup or cross-device sharing. Seed URLs are examples, not live Sekairos collateral; the operator supplies real URLs. Browser print settings determine the exported PDF, and long custom content may paginate beyond one page. The operator reviews claims, attaches the PDF, and sends manually. No upload, AI API, external service, automatic delivery, or PDF library was added.

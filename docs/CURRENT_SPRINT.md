# Current sprint — build/revenue-command-v1

## Goal

Build the first complete revenue vertical slice: PROSPECT → INTELLIGENCE → OPPORTUNITY SCORE → REVENUE PRIORITY → CALL PREP → CALL DEBRIEF → NEXT ACTION.

## Completed work

- Read the required instructions/docs and recorded this sprint goal before implementation. The baseline on main remains 8f29d395e4b98313d7a737417224d9494fc9af40.
- Built prospect list, create, edit, detail, and confirmed deletion with every requested field, ICP, and status; added company/contact/email search and ICP/status filters.
- Added versioned browser-local persistence with validated input/data, write-before-success semantics, refresh persistence, cross-tab updates, and explicit errors without overwriting malformed data.
- Added three labeled fictional prospects: Founder / Local Business, Soccer Club / Academy, and College Athletics. An emptied workspace stays empty instead of silently reseeding.
- Added all seven intelligence fields and bounded whole-number scores. Totals and classifications calculate automatically; changing scores does not change status.
- Replaced placeholder Command with TODAY'S REVENUE PRIORITIES: score first, follow-up urgency second, current status third. All requested prospect context and next actions are shown. Won/Lost remain in Prospects but are excluded from active priorities.
- Added editable, persistent deterministic ICP Call Prep with opener, reason, five discovery questions, objections, ideal next step, claims to avoid, and demo guidance. No AI API.
- Added fast Call Debrief with every requested field, append-only history, required follow-up dates when selected, and automatic status and next-action rules.
- Kept scoring, ranking, templates, status transitions, and next-action rules outside UI components. Updated product, architecture, roadmap, and README to match the implemented slice.

## Validation completed

- `npm test`: 18 tests passed, 0 failed/skipped; scoring limits, all six classification boundaries, ranking tie-breaks, every next-action value, requested-outcome precedence, templates, schema validation, CRUD persistence, write failures, corrupt-data preservation, and deletion persistence.
- `npm run test:e2e` against the production server using cloud Chromium: 5 tests passed, 0 failed/skipped. Browser contexts were isolated from the operator's development data.
- Full acceptance flow: create → edit → add intelligence → verify math and classification → Command → Call Prep → save edited prep → refresh → Call Debrief → Demo Requested → save → status Demo Requested → next action Send Demo → refresh → verify data persists.
- Scores exactly 54, 55, 69, 70, 84, and 85 tested in both domain tests and browser UI.
- Browser checks also covered search, filters, mobile navigation/layout, delete cancel/confirm, missing ids, meaningful/meeting/proposal outcomes, malformed saved data, failed writes, and absence of runtime errors.
- `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` passed. Inspected desktop and mobile screenshots.

## Active work

Implementation and acceptance validation are complete. The authorized delivery step is to commit with `feat: build revenue prospecting workflow` and push only `origin/build/revenue-command-v1`; the task's final report records the resulting SHA and push verification.

## Next work

Await the next scoped revenue task. Do not merge main, add unrelated features, or add external services without explicit instruction.

## Known limitations

- Data is saved only in this browser and origin/port; clearing site data loses it. No server backup, export, cross-device sync, or authentication was added. Concurrent edits are last-write-wins.
- Scores are operator-assigned; intelligence is not externally verified. Estimated opportunity values are USD hypotheses. The seed records are fictional.
- Call Prep and recommended actions are deterministic. Recommendations do not send emails/demos, make calls, schedule meetings, or create proposals. Call Tomorrow is a fixed recommendation label; an operator-selected follow-up date stays visible separately.
- Call history is append-only in this slice; call editing and automated follow-up completion are not implemented. Opportunities and Playbooks remain the existing planned workspaces, outside this task.

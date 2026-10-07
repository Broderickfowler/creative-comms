# SEKAIROS REVENUE COMMAND

An internal revenue execution system for Sekairos. The first working vertical slice is:

**PROSPECT → INTELLIGENCE → OPPORTUNITY SCORE → REVENUE PRIORITY → CALL PREP → CALL DEBRIEF → NEXT ACTION**

## Develop

Use Node.js 24 LTS and npm. Versions are captured in `package-lock.json`.

```bash
npm ci
npm run dev
```

No environment variables or external services are required. `.env.example` documents this. In the cloud machine, use `NPM_CONFIG_CACHE=/workspace/.npm-cache` for npm installation commands. Do not commit credentials.

## What works

- Prospect creation, editing, detail, and deletion with confirmation. All specified contact/company fields, the three ICPs, and thirteen statuses are supported.
- Search by company, contact, or email; filter by ICP and status.
- Editable intelligence with six bounded integer scores, automatic totals out of 100, and exact classification thresholds.
- Command priorities sorted by score, follow-up urgency, then status. Won and Lost are excluded from active priorities but retained in Prospects.
- ICP-specific deterministic Call Prep: editable opener, reason, exactly five questions, objections, next step, claims to avoid, and demo guidance. Draft templates and saved customizations remain distinct.
- Fast Call Debrief with requested outcomes, conversation context, follow-up date, operator action notes, immutable history, automatic status changes, and a recommended next action.
- Persistent local workspace, including deleted records staying deleted and edits surviving refresh. Three clearly labeled fictional examples seed only a new workspace.
- Responsive desktop/mobile navigation and recovery for missing prospect ids.

## Persistence

Records are stored in `localStorage` under `sekairos.revenue-command.v1`, scoped to one browser and origin (including the port). Refreshing preserves data. Another browser, device, hostname, or port has a separate workspace. Clearing browser data removes the workspace. There is no server copy, multi-user synchronization, backup/export, or authentication in this slice. Do not treat this as a hardened system for sensitive records.

Writes complete before the UI reports success. Invalid saved data is left untouched and shows an error instead of being replaced. Storage access/quota failures show errors. Other tabs receive storage updates; simultaneous edits use last-write-wins semantics and are not a collaboration feature.

Estimated opportunity values and fixture money signals are hypotheses in USD, not confirmed revenue. Example websites use the reserved `.example` domain. Recommendations do not send messages, make calls, create proposals, or schedule meetings.

## Routes

| Route                          | Behavior                                                           |
| ------------------------------ | ------------------------------------------------------------------ |
| `/`                            | Redirect to Command                                                |
| `/command`                     | Today's ranked revenue priorities                                  |
| `/prospects`                   | Searchable/filterable list                                         |
| `/prospects/new`               | Create prospect                                                    |
| `/prospects/[id]`              | Contact detail, intelligence, score, next action, and call history |
| `/prospects/[id]/edit`         | Edit prospect fields                                               |
| `/prospects/[id]/call-prep`    | Editable deterministic ICP template                                |
| `/prospects/[id]/debrief`      | Log a call and calculate the next action                           |
| `/opportunities`, `/playbooks` | Retained planned workspaces, outside this slice                    |

## Validate

```bash
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

The type check generates route types before compiling. Domain tests use Node's test runner with tsx. Stop development before production build validation.

The committed browser acceptance suite starts the production server on port 3200 and uses isolated browser contexts, separate from the operator's development workspace. Build first and install a Playwright browser once:

```bash
npx playwright install chromium
npm run test:e2e
```

In the supplied cloud environment, use its Chromium installation:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

This test-only variable is optional. Browser traces/screenshots are ignored local artifacts. Tests cover the complete requested workflow, score boundaries, persistence, filters, mobile navigation, delete confirmation, strong outcome precedence, corrupted data, and failed writes.

## Stack and conventions

Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, lucide-react, and Zod runtime validation. System fonts remove remote font dependencies. Feature rules live in `src/features/prospects/domain`; browser I/O lives in `src/services`; routes remain thin.

Read [Product](docs/PRODUCT.md), [Architecture](docs/ARCHITECTURE.md), [Roadmap](docs/ROADMAP.md), and [Current sprint](docs/CURRENT_SPRINT.md). Follow [AGENTS.md](AGENTS.md). Development stays on `build/revenue-command-v1`; do not merge main without instruction.

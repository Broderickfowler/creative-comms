# Application architecture

## Working approach

Use one Next.js application with the App Router. Keep routes thin and develop one revenue workflow at a time. Strict TypeScript and a committed npm lockfile provide predictable tooling. Tailwind CSS owns styling; shadcn/ui supplies accessible primitives; lucide-react supplies icons.

## Code ownership

| Directory        | Responsibility                                                           |
| ---------------- | ------------------------------------------------------------------------ |
| `src/app`        | Route files, layouts, metadata, errors, and global styles                |
| `src/components` | Shared application shell and UI primitives                               |
| `src/features`   | Feature screens, local domain rules, and interaction                     |
| `src/lib`        | Small shared utilities and navigation definitions                        |
| `src/services`   | I/O boundaries when persistence or integrations are explicitly requested |
| `src/types`      | Shared domain contracts                                                  |
| `src/data`       | Clearly labeled example fixtures                                         |

The root layout renders the shared shell. `/` redirects to `/command`; other workspace routes render feature screens. Interactive revenue screens use client boundaries for forms and browser-local data; their route wrappers and root layout remain server components. Dynamic route params are awaited in the route wrapper. Next.js route files should not become containers for business rules.

## Data and services

`src/types/prospect.ts` defines contact/company fields, intelligence, scores, call-prep edits, call history, outreach activities, and follow-up context. `src/types/outreach.ts` defines the nine message types, channels, and activity/pack contracts. `src/features/prospects/domain` owns pure scoring, classification, priority ranking, call status transitions, next-action recommendations, defaults, and deterministic ICP templates. UI components collect input and render results; they do not own these rules.

`src/services/prospect-store.ts` provides a small external store consumed through `useSyncExternalStore`. Server snapshots show a loading state; browser initialization reads the versioned workspace and seeds fictional examples only when no workspace exists. `workspace-schema.ts` uses Zod to validate all persisted fields, score limits, dates, and ids. A malformed/unsupported workspace is preserved and surfaces an error. Successful mutations write before emitting a new UI snapshot. Reads before mutation reduce stale-tab overwrites; simultaneous editing is still last-write-wins, not transactional collaboration.

The store uses `localStorage` at `sekairos.revenue-command.v1`. No external database, auth provider, AI API, or other integration is added. Clearing site data loses records; browsers and origins have separate workspaces. Do not add generic storage abstractions before a concrete need.

`src/features/outreach/domain` owns deterministic message generation, outcome-specific pack selection, ICP offer recommendations, and activity/status transitions. `src/services/clipboard.ts` owns browser copy, with a user-initiated fallback and explicit failure reporting. `use-outreach-actions` connects successful clipboard writes to Prepared activity and records manual sends; it never delivers messages. Components keep presentation and editable drafts separate from these rules.

Workspace schema version 2 adds outreach activity, Last Outreach At, Next Follow-Up Date, Follow-Up Reason, and a default false notInterested call flag. The existing storage key is deliberately retained. Valid version-one records migrate additively in place without changing ids, scores, contacts, prep, or calls. Migration write failures preserve the old saved payload and surface an error. Invalid or unsupported data is never reseeded. Activities validate ownership, call context, unique ids, statuses and sent timestamps. Drafts can be temporarily empty while editing; Prepared/Sent messages cannot.

Draft edits autosave on change. A message is keyed by prospect, message type, and latest call id, so new calls generate fresh drafts while older activity remains available. Draft/Prepared records update in place until marked Sent; subsequent edits append a new draft and preserve the sent content. Next Follow-Up Date uses null for legacy call-date fallback and an empty string for an explicitly cleared date. Dates use the browser's local calendar, with due/overdue ordering implemented in the prospect domain.

Call histories are append-only within this slice. Debriefs update selected nonempty intelligence signals while retaining operator scores. Custom prep persists until edited/reset. Recommendations are pure decisions; no action is executed externally.

## Collateral slice

`src/types/sales-asset.ts` owns asset fields, supported types/ICPs/statuses, and matching results. `src/types/opportunity-brief.ts` defines editable brief fields and the saved customization contract. `src/features/sales-assets/domain` owns URL validation/example detection, deterministic matching, and the pending-material queue. `src/features/briefs/domain` generates briefs from recorded signals, resolves overrides, and calculates only changed fields for persistence. Domain functions do not fetch external URLs, calculate ROI, or deliver messages.

The same external store now owns assets and prospect brief customizations. Schema version 3 retains `sekairos.revenue-command.v1`; versions 1/2 migrate additively with seeded example assets and null brief defaults. Prospects, scores, calls, draft edits, sent activity, and follow-up dates are preserved. Version-three assets are required, so an invalid missing library is not silently recreated. Empty libraries remain empty. Asset ids are unique; links must use HTTP/HTTPS without embedded credentials or whitespace. Writes validate and persist the whole workspace before emitting either asset or prospect changes, preserving both collections on failure.

A brief stores `{ overrides, updatedAt }` on its prospect. Generated content is derived at read time; no duplicate copy of intelligence or matched assets is stored. Asset updates/deletion and non-overridden intelligence changes appear immediately. Overrides affect collateral wording without changing the prospect, score, or matcher inputs.

Routes are `/sales-assets`, `/sales-assets/new`, `/sales-assets/[id]/edit`, and `/prospects/[id]/brief`. The brief route awaits both params and searchParams; `?print=1` starts browser printing once local data and the document are rendered. The server route only passes the intent to the client. Print rules apply when the brief document is present, hide marked internal shell/form/action elements, reset application margins, and use an A4 document layout. No PDF generation dependency or upload service is added. Browser acceptance uses Chromium PDF output only to verify pagination and exported content.

## UI conventions

Use the shared neutral/teal tokens, responsive layout, readable spacing, and shadcn/ui components. Navigation must expose the current page through `aria-current`. Mobile navigation uses an accessible drawer. Links navigate; buttons perform implemented actions. Planned work is text, not a disabled or misleading control. Use system fonts so application startup and builds do not need Google Fonts access.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build` before declaring completion. Verify actual page rendering and navigation on desktop and mobile. Run `npm test` for domain and persistence rules. After building, `npm run test:e2e` exercises the production browser workflow in isolated contexts. Browser test artifacts are ignored. See README for Chromium installation or the cloud executable override. Run builds with adequate resources and without a simultaneous development build sharing `.next`.

## Deployment boundary

This task does not deploy the system. Authentication, access control, persistence, operational monitoring, and deployment configuration are future explicitly scoped work. The shell is not a secure system for real customer information yet. Keep secrets out of source and do not introduce credentials merely to initialize the app.

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

`src/types/prospect.ts` defines contact/company fields, intelligence, scores, call-prep edits, and call history. `src/features/prospects/domain` owns pure scoring, classification, priority ranking, call status transitions, next-action recommendations, defaults, and deterministic ICP templates. UI components collect input and render results; they do not own these rules.

`src/services/prospect-store.ts` provides a small external store consumed through `useSyncExternalStore`. Server snapshots show a loading state; browser initialization reads the versioned workspace and seeds fictional examples only when no workspace exists. `workspace-schema.ts` uses Zod to validate all persisted fields, score limits, dates, and ids. A malformed/unsupported workspace is preserved and surfaces an error. Successful mutations write before emitting a new UI snapshot. Reads before mutation reduce stale-tab overwrites; simultaneous editing is still last-write-wins, not transactional collaboration.

The store uses `localStorage` at `sekairos.revenue-command.v1`. No external database, auth provider, AI API, or other integration is added. Clearing site data loses records; browsers and origins have separate workspaces. Do not add generic storage abstractions before a concrete need.

Call histories are append-only within this slice. Debriefs update selected nonempty intelligence signals while retaining operator scores. Custom prep persists until edited/reset. Recommendations are pure decisions; no action is executed externally.

## UI conventions

Use the shared neutral/teal tokens, responsive layout, readable spacing, and shadcn/ui components. Navigation must expose the current page through `aria-current`. Mobile navigation uses an accessible drawer. Links navigate; buttons perform implemented actions. Planned work is text, not a disabled or misleading control. Use system fonts so application startup and builds do not need Google Fonts access.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build` before declaring completion. Verify actual page rendering and navigation on desktop and mobile. Run `npm test` for domain and persistence rules. After building, `npm run test:e2e` exercises the production browser workflow in isolated contexts. Browser test artifacts are ignored. See README for Chromium installation or the cloud executable override. Run builds with adequate resources and without a simultaneous development build sharing `.next`.

## Deployment boundary

This task does not deploy the system. Authentication, access control, persistence, operational monitoring, and deployment configuration are future explicitly scoped work. The shell is not a secure system for real customer information yet. Keep secrets out of source and do not introduce credentials merely to initialize the app.

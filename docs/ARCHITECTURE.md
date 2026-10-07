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

The root layout renders the shared shell. `/` redirects to `/command`; other workspace routes render feature screens. Only the sidebar/mobile drawer needs a client boundary. Display-only pages remain server components. Next.js route files should not become containers for business rules.

## Data and services

The Command example is a typed, fictional local fixture, not a live record. No backend, authentication, storage abstraction, or API is necessary for this foundation. When a later task introduces data behavior, keep domain rules in the feature and calls to external systems in `src/services`. Do not create generic repositories, event buses, or dependency injection frameworks ahead of a concrete need. Do not add external services without explicit instruction.

## UI conventions

Use the shared neutral/teal tokens, responsive layout, readable spacing, and shadcn/ui components. Navigation must expose the current page through `aria-current`. Mobile navigation uses an accessible drawer. Links navigate; buttons perform implemented actions. Planned work is text, not a disabled or misleading control. Use system fonts so application startup and builds do not need Google Fonts access.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build` before declaring completion. Verify actual page rendering and navigation on desktop and mobile. For future business logic, add meaningful tests at its boundary when behavior warrants them; do not add a test framework only to test static placeholders. Run builds with adequate resources and without a simultaneous development build sharing `.next`.

## Deployment boundary

This task does not deploy the system. Authentication, access control, persistence, operational monitoring, and deployment configuration are future explicitly scoped work. The shell is not a secure system for real customer information yet. Keep secrets out of source and do not introduce credentials merely to initialize the app.

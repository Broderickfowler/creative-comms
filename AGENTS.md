# Codex working instructions — Sekairos Revenue Command

1. This product is an internal revenue execution system for Sekairos.
2. Revenue-producing functionality takes priority over architectural perfection.
3. Do not overengineer.
4. Prefer simple, reversible implementation decisions.
5. Use TypeScript strictly. Do not introduce `any` or suppress type errors to bypass checks.
6. Keep business logic separate from UI components. Place domain rules in the owning feature and I/O in `src/services`.
7. Avoid massive components. Extract components around clear responsibilities.
8. Every interactive control must work. Use real links, handlers, and accessible states; omit controls for unimplemented actions.
9. Never use lorem ipsum.
10. Use realistic business data. Clearly label fictional examples; never present them as live operational records.
11. Before declaring a feature complete, run applicable lint, type-check, and build commands: `npm run lint`, `npm run typecheck`, and `npm run build`. Exercise the affected user flow as well.
12. Fix errors caused by your changes. Report remaining limitations precisely.
13. Do not add external services without explicit instruction. This includes databases, authentication providers, analytics, email, CRM, and AI APIs.
14. Do not put secrets in the repository. Document variable names in `.env.example`; keep actual values in ignored `.env.local` or secure environment settings.
15. Keep `docs/CURRENT_SPRINT.md` updated with completed work, active work, and next work.
16. Preserve the Sekairos product terminology defined in `docs/PRODUCT.md`, especially DESIRE, VISION, MONEY, FRICTION, TIMING, and SEKAIROS FIT.

## Start here

Read `docs/PRODUCT.md`, `docs/CURRENT_SPRINT.md`, and `docs/ARCHITECTURE.md` before implementation. Use the existing isolated checkout; do not create a Git worktree unless explicitly requested. Install with `npm ci`, run `npm run dev`, and keep the npm lockfile current when changing dependencies. Node.js 24 LTS is the working runtime. In this cloud machine, set `NPM_CONFIG_CACHE=/workspace/.npm-cache` for install commands.

Keep routes thin, colocate feature code, use shadcn/ui primitives from `src/components/ui`, and use lucide-react icons. Prefer server components; add client boundaries only for interaction. Follow existing visual tokens and accessible navigation patterns. Do not expand a foundation task into the complete product. Do not claim deployment or production hardening without evidence.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

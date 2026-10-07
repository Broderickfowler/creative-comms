# SEKAIROS REVENUE COMMAND

An internal revenue execution system for Sekairos. It helps one operator move from prospect context to a clear next revenue action.

This repository contains the application foundation: a responsive shell, working navigation, a placeholder Command page, and planned workspace pages. The illustrative brief is fictional. No live prospect data, CRM, authentication, database, or external service is connected.

## Develop

Use Node.js 24 LTS and npm. Package versions are captured in `package-lock.json`.

```bash
npm ci
npm run dev
```

No environment variables are required for the foundation. `.env.example` documents this; never commit actual secrets. If cloud npm cache access is restricted, prefix install commands with `NPM_CONFIG_CACHE=/workspace/.npm-cache`.

## Validate

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

`typecheck` generates Next.js route types before running TypeScript so it also works in a fresh checkout. Stop the development server before production build/start validation. Build output and running processes are local state, not source. The default port is 3000; pass `-- --port 3100` to `dev` or `start` if needed.

## Current routes

| Route            | Behavior                                                              |
| ---------------- | --------------------------------------------------------------------- |
| `/`              | Redirects to Command                                                  |
| `/command`       | Foundation overview, six intelligence lenses, fictional example brief |
| `/prospects`     | Explicit placeholder for prospect context                             |
| `/opportunities` | Explicit placeholder for revenue opportunities                        |
| `/playbooks`     | Explicit placeholder for offers and messaging                         |

The desktop sidebar and mobile drawer navigate to actual pages, highlight the active route, and support keyboard navigation. The mobile drawer closes on selection or Escape. There are no inactive action buttons.

## Stack and structure

Next.js App Router, strict TypeScript, Tailwind CSS, shadcn/ui, and lucide-react. The app uses system fonts and has no runtime dependency on remote fonts.

- `src/app`: routes, layouts, global styles, metadata.
- `src/components`: shared shell and shadcn/ui primitives.
- `src/features`: feature-specific screens and behavior.
- `src/lib`: small shared utilities and navigation definitions.
- `src/services`: future I/O adapters; no integrations yet.
- `src/types`: shared domain types.
- `src/data`: explicitly labeled fictional fixtures.

Read [Product](docs/PRODUCT.md), [Architecture](docs/ARCHITECTURE.md), [Roadmap](docs/ROADMAP.md), and [Current sprint](docs/CURRENT_SPRINT.md). Codex contributors must follow [AGENTS.md](AGENTS.md).

## Scope and limitations

This is a production repository foundation, not a complete or deployed production system. Prospect editing, prioritization, persistent data, authentication, offers, outreach, and follow-up automation are not implemented. Those decisions belong to later feature tasks. No external services have been added.

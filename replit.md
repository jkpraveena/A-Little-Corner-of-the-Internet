# A Little Corner of the Internet

A private, password-gated birthday time capsule with a persistent snapshot, future letter, memories, and open-when messages.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/birthday-corner` — responsive React/Vite experience
- `artifacts/api-server/src/routes` — authenticated API routes
- `artifacts/api-server/src/lib/seed-content.ts` — replace sample name, birthday date, memories, open-when letters, final letter, and birthday message before sharing
- `lib/db/src/schema/birthday.ts` — PostgreSQL schema
- `lib/api-spec/openapi.yaml` — API source of truth

## Architecture decisions

- The birthday person's single password is verified server-side from `BIRTHDAY_PASSWORD`; the browser only receives a short-lived HTTP-only session cookie.
- Snapshot and future-letter writes are final and server-guarded against duplicate saves.
- Uploaded media uses private App Storage objects; PostgreSQL stores only metadata and object paths.

## Product

The app opens with a private password gate, then unfolds as a single scrolling keepsake experience. It stores the once-only current snapshot and future letter in PostgreSQL, serves seeded memories and letters from PostgreSQL, and calculates the next birthday countdown from the stored date.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

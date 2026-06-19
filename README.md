# Lane

**Realtime team boards with guest links.** Drag a card and your whole team sees it move instantly; share a read-only link and clients watch progress live — no account needed. Lane is a production-shaped SaaS MVP: multi-tenant auth, realtime collaboration, plan-gated billing, and a marketing landing page, on a CQRS NestJS backend and a Next.js front end.

![Lane demo](assets/demo.png)

## Features

- **Realtime sync** — Socket.IO room per board; every domain event is mapped to a typed wire message (`realtime/wire.ts`, a registry — adding an event there is the single step to broadcast it) and fanned out to everyone viewing the board.
- **Optimistic drag & drop** — the client predicts the server's outcome with the *same* deterministic fractional-ranking function, applies it instantly through the same reducer that handles server events, and rolls back if the API rejects. In the common case the confirming broadcast is a visual no-op.
- **Conflict-safe ordering** — fractional ranking keys over `a–z` (`kanban/ranking/rank.ts`): a move writes only the moved row, so concurrent drags from different users can't trample each other. Verified with a randomized 2000-insert invariant test.
- **Live presence** — join a board with a name and color; avatars update live on join, leave, and disconnect.
- **Workspaces & auth** — JWT in an http-only `lane_token` cookie; every board, column, card, and label is scoped to an account.
- **Guest share links** — publish a board as a read-only, live `/share/[token]` page with optional expiry; guests join the socket room through a token-validated path, no account required.
- **Cards in depth** — labels, assignees, due dates, checklists/subtasks, comments with @mentions, an activity feed, and in-app notifications.
- **Plans & billing** — Free / Pro / Business via Stripe Checkout + customer portal + a signature-verified webhook, with a keyless mock provider for local runs. Limits are enforced server-side.
- **Board tooling** — per-column WIP limits and text/label/assignee/due filtering mirrored to the URL.
- **Marketing landing** — animated, SSR'd landing page at `/` with self-playing live-board demos and pricing.

## Plans

| | Free | Pro ($19/mo) | Business ($49/mo) |
| --- | --- | --- | --- |
| Boards | 1 | 3 | Unlimited |
| Guest share links | — | ✓ | ✓ |
| Custom labels | — | ✓ | ✓ |
| Activity history | 1 day | 14 days | Unlimited |

Limits live in `billing/plan.limits.ts` and are enforced in the command handlers (e.g. `kanban/commands/board.handlers.ts`, `share/share.command-handlers.ts`), not just the UI.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript, Mantine, Zustand, React Hook Form, dnd-kit, Framer Motion, socket.io-client |
| Backend | NestJS, `@nestjs/cqrs`, Socket.IO, Passport JWT, class-validator, Swagger |
| Database | PostgreSQL, Drizzle ORM (drizzle-kit migrations) |
| Billing | Stripe (Checkout, customer portal, webhooks) |
| Tooling | pnpm workspaces, Biome, Vitest, Husky, GitHub Actions |

## Architecture

```
   REST (commands & queries)                    Socket.IO
┌──────────┐   POST /api/v1/cards/:id/move   ┌─────────────┐
│  Next.js │ ───────────────────────────────▶│  Controller │
│  client  │                                 └──────┬──────┘
└────▲─────┘                                  CommandBus
     │                                        ┌──────▼──────┐     ┌────────────┐
     │  board:event                           │   Handler   │────▶│  Postgres  │
     │  (room broadcast)                      └──────┬──────┘     └────────────┘
     │                                          EventBus
┌────┴─────┐                                  ┌──────▼──────┐
│ Gateway  │◀─────────────────────────────────│ EventsRelay │
└──────────┘         toWire(event)            └─────────────┘
```

- Write path: controller → `CommandBus` → handler → repository → `EventBus`.
- Read path: `QueryBus` → `GetBoard` assembles the board view in rank order.
- `KanbanEventsRelay` is the only bridge between domain events and sockets — command handlers never touch a socket.
- Auth is a Passport JWT strategy over the `lane_token` cookie; account scoping is checked in the handlers.
- Billing swaps a `StripeBillingProvider` for a `MockBillingProvider` at module init based on whether `STRIPE_SECRET_KEY` is set.
- The client feeds both server broadcasts *and* its own optimistic predictions through one pure reducer (`stores/apply-event.ts`).

## Run it with Docker

```bash
docker compose up --build
```

- Web → [localhost:3002](http://localhost:3002)
- API → [localhost:4000](http://localhost:4000)
- Swagger UI → [localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)

Migrations run automatically when the API container starts, and billing runs in mock mode unless you supply Stripe keys (`STRIPE_SECRET_KEY=sk_test_… docker compose up --build`).

## Local development

```bash
pnpm install
docker compose up -d postgres          # POSTGRES_PORT=5433 docker compose up -d postgres   # if 5432 is taken
cp .env.example .env                    # set JWT_SECRET; adjust DATABASE_URL if you changed the port
pnpm --filter @kanban/api db:migrate
pnpm dev                                # API on :4000, web on :3002
```

To exercise real Stripe checkout, drop test keys into `.env` and run `pnpm --filter @kanban/api stripe:setup` to create the Pro/Business prices and write their IDs back.

## Environment

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | — | Postgres connection string |
| `JWT_SECRET` | yes | — | ≥16 chars; signs the `lane_token` cookie |
| `PORT` | no | `4000` | API port |
| `CORS_ORIGIN` | no | `http://localhost:3002` | Browser origin allowed to send credentials |
| `APP_URL` | no | = `CORS_ORIGIN` | Public origin for billing return URLs |
| `STRIPE_SECRET_KEY` | no | — | Unset ⇒ keyless mock billing |
| `STRIPE_WEBHOOK_SECRET` | no | — | Verifies webhook signatures |
| `STRIPE_PRICE_PRO` / `STRIPE_PRICE_BUSINESS` | no | — | Stripe Price IDs (`stripe:setup` generates them) |
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:4000/api/v1` | Browser-facing API base, inlined into the web build |

## Layout

```
apps/
  api/   NestJS + CQRS + Drizzle + Socket.IO + Stripe billing
  web/   Next.js App Router + Mantine (app, share view, landing)
```

## Tests

```bash
pnpm test                                  # unit: ranking invariants, handlers, presence, billing
pnpm --filter @kanban/api test:integration # REST lifecycle + two-socket realtime e2e (needs Postgres)
pnpm type-check && pnpm lint
```

CI runs type-check → lint → unit → migrate → integration → build on every PR.

## Production notes (honest)

This is a portfolio showcase; a few choices trade production completeness for clarity, and here is what would replace them:

- **Single-instance Socket.IO + in-memory presence** → `@socket.io/redis-adapter` and Redis-backed presence for horizontal scaling.
- **Fractional ranks** are plenty for board-sized collaboration; an editor-grade product (Figma-scale concurrency) would reach for CRDTs.
- **Stripe** — the webhook is signature-verified and checkout is reconciled on return, but a real deployment should handle the full subscription lifecycle (dunning, cancellations, proration) via the customer portal and webhook events.
- **Guest links** carry a bearer token in the URL; they support expiry, but sensitive boards would want rotation and per-link scopes.
- **No TanStack Query on purpose** — the socket plus a Zustand store is the single source of truth; a second client cache would compete with it.

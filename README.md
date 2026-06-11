# Realtime Kanban

A realtime collaborative Kanban board. Multiple people open the same board, drag cards around, and see each other's changes instantly — with optimistic updates, conflict-safe ordering, and live presence.

> Status: in development.

## Highlights

- **CQRS backend** — commands, queries, and domain events via `@nestjs/cqrs`; the realtime layer subscribes to events and never touches the write path
- **Realtime sync** — Socket.IO rooms per board; every mutation is broadcast to everyone viewing it
- **Optimistic drag & drop** — the UI moves instantly, the server confirms or rolls back
- **Conflict-safe ordering** — fractional ranking keys, so concurrent drags from different users don't trample each other
- **Presence** — see who's on the board right now

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript, Mantine, Zustand, React Hook Form, dnd-kit |
| Backend | NestJS, CQRS, Socket.IO, class-validator |
| Database | PostgreSQL, Drizzle ORM |
| Tooling | pnpm workspaces, Biome, Vitest, GitHub Actions |

## Development

```bash
pnpm install
docker compose up -d postgres
pnpm dev
```

More detailed docs land with the first release.

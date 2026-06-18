# Build context is the repo root: docker build -f apps/web/Dockerfile .
FROM node:22-slim

RUN corepack enable
ENV HUSKY=0
WORKDIR /repo

# NEXT_PUBLIC_* is inlined at build time, so the API URL must be set before `next build`.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile --filter @kanban/web...

COPY tsconfig.base.json ./
COPY apps/web ./apps/web
RUN pnpm --filter @kanban/web build

WORKDIR /repo/apps/web
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]

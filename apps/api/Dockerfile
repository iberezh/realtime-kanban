# Build context is the repo root: docker build -f apps/api/Dockerfile .
FROM node:22-slim

RUN corepack enable
ENV HUSKY=0
WORKDIR /repo

# Install deps first for layer caching; both workspace manifests are needed
# so pnpm can resolve the lockfile under --frozen-lockfile.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @kanban/api...

COPY tsconfig.base.json ./
COPY apps/api ./apps/api
RUN pnpm --filter @kanban/api build

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 4000

# Apply migrations (drizzle-kit, dev dependency — present in this image), then start.
CMD ["sh", "-c", "pnpm db:migrate && node dist/main.js"]

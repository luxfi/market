FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

# Static export served by the hanzoai/spa scratch server (PORT 3000, ROOT /public).
# Pinned amd64 digest tag — cluster nodes are amd64; never a floating tag in a cluster.
FROM ghcr.io/hanzoai/spa:sha-b9d3a13-amd64
COPY --from=build /app/out /public

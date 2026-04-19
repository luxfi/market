FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm build

FROM ghcr.io/hanzoai/spa
COPY --from=build /app/out /public

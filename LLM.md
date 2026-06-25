# Hanzo Marketplace

## Overview
Lux NFT Marketplace - Genesis NFTs, trading, and NFT AMM

## Tech Stack
- **Language**: TypeScript/JavaScript

## Build & Run
```bash
pnpm install && pnpm build
pnpm test
```

## Structure
```
marketplace/
  CLAUDE.md
  Dockerfile
  Dockerfile.package
  next-env.d.ts
  next.config.ts
  out/
  package.json
  pnpm-lock.yaml
  postcss.config.mjs
  public/
  src/
  tsconfig.json
  tsconfig.tsbuildinfo
  yarn.lock
```

## Key Files
- `package.json` -- Dependencies and scripts
- `Dockerfile` -- Container build

## Deployment — app.lux.market (lux-k8s)

Migrated OFF Vercel (was HTTP 402 DEPLOYMENT_DISABLED) ONTO lux-k8s DOKS
(`do-sfo3-lux-k8s`). This repo is the Next.js 15 (wagmi/viem) NFT marketplace
SPA served at **app.lux.market** (marketing `lux.market` is `lux-apps/market`).

- **Image type**: static export. `next build` with `output: 'export'` -> `out/`,
  served by `hanzoai/spa` (PORT 3000, ROOT /public). `Dockerfile` pins the spa
  base to an immutable amd64 tag, `COPY out /public`.
- **CI**: `.github/workflows/build.yml` is a SELF-CONTAINED inline
  `docker/build-push-action` build on `runs-on: lux-build` (the ARC scale-set).
  market is a PUBLIC repo, so it CANNOT call the private `luxfi/.github`
  reusable workflow ("workflow was not found") — the build is inlined. Triggers
  on `v*` tags, amd64-only, pushes `ghcr.io/luxfi/market:<semver>-amd64`+`latest`.
  (Pkg had to be repo-linked: a stale unlinked GHCR `market` package denied the
  repo GITHUB_TOKEN `write_package`; deleting it let the push recreate it linked.)
- **K8s**: namespace `app-lux-market` — deployment (2 replicas, containerPort
  3000, `ghcr-pull`), service 80->3000, ingress class `ingress`, issuer
  `letsencrypt-prod`, host `app.lux.market`, TLS `app-lux-market-tls` (issued).
- **DNS**: Cloudflare `A app.lux.market -> 134.199.138.27` proxied, SSL `full`.
- **Fix shipped during migration**: Header + portfolio hardcoded chain id
  `494949` had no `CHAIN_INFO` entry -> reading `info.name` threw and
  white-screened the app. Now derived from `CHAIN_INFO` (single source of truth).
  Verified: real headless browser HTTP 200, full marketplace UI + chain switcher
  + Connect, no client-side exception, no 402.

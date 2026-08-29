// Plain ESM, not TypeScript, on purpose.
//
// Next 15's `next.config.ts` loader calls `ts.sys.fileExists` / `ts.findConfigFile`
// off the app's own `typescript`. This repo is on TypeScript 7 (native preview),
// whose module exports neither, so booting died before the first request with
// `TypeError: Cannot read properties of undefined (reading 'fileExists')` and
// `Failed to load next.config.ts`. A config file gains nothing from types it
// only uses to annotate one object literal.

import path from 'path'
import { withLuxUi } from '@luxfi/ui/next'

// `withLuxUi` is the ONE place the gui engine's bundler wiring lives — transpile
// list, react-native → react-native-web alias in both bundlers, platform
// defines. Every Next surface needed the identical incantation; the ones that
// hand-rolled it each transpiled a different subset, which is how one app
// renders a Sheet and the next throws on the same component.
const nextConfig = {
  output: 'export',
  // Without this the export writes `collections.html` and `support.html`, and
  // the host has to be told to map `/collections` onto one of them. `/support`
  // was worse than that: `support.html` and a `support/` directory both exist,
  // so a host that prefers the directory serves a listing where a page belongs.
  // Trailing slashes make every route its own `index.html`, which every static
  // host resolves without being configured.
  trailingSlash: true,
  outputFileTracingRoot: path.resolve(import.meta.dirname ?? __dirname),
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '*.lux.network' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: '*.ipfs.io' },
      { protocol: 'https', hostname: 'cloudflare-ipfs.com' },
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'dweb.link' },
      { protocol: 'https', hostname: 'w3s.link' },
      { protocol: 'https', hostname: 'nft-cdn.alchemy.com' },
      { protocol: 'https', hostname: '*.nftstorage.link' },
    ],
  },
}

export default withLuxUi(nextConfig)

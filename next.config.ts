import path from 'path'
import type { NextConfig } from 'next'
import { withLuxUi } from '@luxfi/ui/next'

// `withLuxUi` is the ONE place the gui engine's bundler wiring lives — transpile
// list, react-native → react-native-web alias in both bundlers, platform
// defines. Every Next surface needed the identical incantation; the ones that
// hand-rolled it each transpiled a different subset, which is how one app
// renders a Sheet and the next throws on the same component.
const nextConfig: NextConfig = {
  output: 'export',
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

export default withLuxUi(nextConfig as never) as NextConfig

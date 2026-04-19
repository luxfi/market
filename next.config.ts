import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: path.resolve(import.meta.dirname ?? __dirname),
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
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

export default nextConfig

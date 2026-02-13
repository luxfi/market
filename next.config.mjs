/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'standalone',
  experimental: {
    transpilePackages: ['@reservoir0x/reservoir-kit-ui'],
  },
}

export default nextConfig

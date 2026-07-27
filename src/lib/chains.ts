import type { Chain } from 'viem'

// Public RPC form is `/v1/bc/<alias>/rpc` on each network's api host.
// Every URL below except SPC was verified live against eth_chainId.
export const luxMainnet: Chain = {
  id: 96369,
  name: 'Lux',
  nativeCurrency: { name: 'Lux', symbol: 'LUX', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.lux.network/v1/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore', url: 'https://explore.lux.network' } },
}

export const zooMainnet: Chain = {
  id: 200200,
  name: 'Zoo',
  nativeCurrency: { name: 'Zoo', symbol: 'ZOO', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.zoo.network/v1/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore Zoo', url: 'https://explore.zoo.network' } },
}

export const hanzoMainnet: Chain = {
  id: 36963,
  name: 'Hanzo',
  nativeCurrency: { name: 'Hanzo', symbol: 'HANZO', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.hanzo.network/v1/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore Hanzo', url: 'https://explore.hanzo.network' } },
}

// SPC has no public RPC yet — the indexer reaches it in-cluster only.
export const spcMainnet: Chain = {
  id: 36911,
  name: 'SPC',
  nativeCurrency: { name: 'SPC', symbol: 'SPC', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.lux.network/v1/bc/spc/rpc'] } },
  blockExplorers: { default: { name: 'Explore SPC', url: 'https://explore-spc.lux.network' } },
}

export const parsMainnet: Chain = {
  id: 494949,
  name: 'Pars',
  nativeCurrency: { name: 'Pars', symbol: 'PARS', decimals: 18 },
  rpcUrls: { default: { http: ['https://api.pars.network/v1/bc/C/rpc'] } },
  blockExplorers: { default: { name: 'Explore Pars', url: 'https://explore.pars.network' } },
}

export const supportedChains = [luxMainnet, zooMainnet, hanzoMainnet, spcMainnet, parsMainnet] as const

// One unified indexer serves every chain behind a per-chain slug:
//   GET https://api-explore.lux.network/v1/indexer/<slug>/<resource>
// Slugs are the indexer's own, from GET /v1/explorer/admin/chains.
const INDEXER_ROOT = 'https://api-explore.lux.network/v1/indexer'

export const INDEXER_SLUG: Record<number, string> = {
  [luxMainnet.id]: 'cchain',
  [zooMainnet.id]: 'zoo',
  [hanzoMainnet.id]: 'hanzo',
  [spcMainnet.id]: 'spc',
  [parsMainnet.id]: 'pars',
}

export const EXPLORER_API: Record<number, string> = Object.fromEntries(
  Object.entries(INDEXER_SLUG).map(([id, slug]) => [Number(id), `${INDEXER_ROOT}/${slug}`]),
)

/** Human-facing explorer for a chain. Single source of truth is the chain object. */
export function explorerUrl(chainId: number): string {
  const chain = supportedChains.find((c) => c.id === chainId)
  return chain?.blockExplorers?.default.url ?? luxMainnet.blockExplorers!.default.url
}

export const CHAIN_INFO: Record<number, { name: string; symbol: string; color: string }> = {
  [luxMainnet.id]: { name: 'Lux', symbol: 'LUX', color: '#55ccff' },
  [zooMainnet.id]: { name: 'Zoo', symbol: 'ZOO', color: '#7ee787' },
  [hanzoMainnet.id]: { name: 'Hanzo', symbol: 'HANZO', color: '#d2a8ff' },
  [spcMainnet.id]: { name: 'SPC', symbol: 'SPC', color: '#ffa657' },
  [parsMainnet.id]: { name: 'Pars', symbol: 'PARS', color: '#ff7b72' },
}

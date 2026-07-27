// Read path for NFT data. The unified Lux indexer serves a Blockscout-shaped
// REST API per chain; EXPLORER_API maps chainId -> its base URL.
import { EXPLORER_API } from '@/lib/chains'

export type NFTTrait = { trait_type: string; value: string | number }

export type NFTMetadata = {
  name?: string
  description?: string
  image?: string
  image_url?: string
  animation_url?: string
  attributes?: NFTTrait[]
}

export type ExplorerToken = {
  address: string
  name: string | null
  symbol: string | null
  type: string
  decimals: string | null
  holders: string | null
  total_supply: string | null
  icon_url: string | null
}

export type ExplorerTokenInstance = {
  id: string
  token: ExplorerToken
  owner: { hash: string } | null
  image_url: string | null
  animation_url: string | null
  metadata: NFTMetadata | null
}

export type ExplorerTransfer = {
  block_number: number
  timestamp: string | null
  transaction_hash: string
  method?: string
  from: { hash: string }
  to: { hash: string }
  token: ExplorerToken
  total: { value: string | null; token_id: string | null; decimals: string | null } | null
}

export type ExplorerAddressToken = {
  token: ExplorerToken
  token_id: string | null
  token_instance?: ExplorerTokenInstance | null
  value: string
}

export type PaginatedResponse<T> = { items: T[]; next_page_params: null }

const NFT_TYPES = new Set(['ERC-721', 'ERC-1155'])

const empty = <T,>(): PaginatedResponse<T> => ({ items: [], next_page_params: null })

async function get<T>(chainId: number, path: string, fallback: T): Promise<T> {
  const base = EXPLORER_API[chainId]
  if (!base) return fallback
  try {
    const res = await fetch(`${base}${path}`, { headers: { accept: 'application/json' } })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

/**
 * NFT collections on a chain. The indexer ignores `?type=`, so the ERC-721 /
 * ERC-1155 filter is applied here.
 */
export async function getCollections(
  chainId: number,
  search?: string,
): Promise<PaginatedResponse<ExplorerToken>> {
  const page = await get(chainId, '/tokens', empty<ExplorerToken>())
  const q = search?.trim().toLowerCase()
  const items = page.items.filter(
    (t) =>
      NFT_TYPES.has(t.type) &&
      (!q || `${t.name ?? ''} ${t.symbol ?? ''} ${t.address}`.toLowerCase().includes(q)),
  )
  return { items, next_page_params: null }
}

export const getToken = (chainId: number, address: string) =>
  get<ExplorerToken | null>(chainId, `/tokens/${address}`, null)

export const getTokenInstances = (chainId: number, address: string) =>
  get(chainId, `/tokens/${address}/instances`, empty<ExplorerTokenInstance>())

export const getTokenInstance = (chainId: number, address: string, id: string) =>
  get<ExplorerTokenInstance | null>(chainId, `/tokens/${address}/instances/${id}`, null)

export const getTokenTransfers = (chainId: number, address: string) =>
  get(chainId, `/tokens/${address}/transfers`, empty<ExplorerTransfer>())

/** Chain-wide NFT activity feed. The indexer has no type filter, so filter here. */
export async function getNftTransfers(
  chainId: number,
): Promise<PaginatedResponse<ExplorerTransfer>> {
  const page = await get(chainId, '/token-transfers', empty<ExplorerTransfer>())
  return { items: page.items.filter((t) => NFT_TYPES.has(t.token?.type)), next_page_params: null }
}

export const getTokenInstanceTransfers = (chainId: number, address: string, id: string) =>
  get(chainId, `/tokens/${address}/instances/${id}/transfers`, empty<ExplorerTransfer>())

export const getAddressTokens = (chainId: number, address: string) =>
  get(chainId, `/addresses/${address}/tokens`, empty<ExplorerAddressToken>())

/** NFTs held by an address — the same holdings feed, minus fungible rows. */
export async function getAddressTokenInstances(
  chainId: number,
  address: string,
): Promise<PaginatedResponse<ExplorerAddressToken>> {
  const page = await getAddressTokens(chainId, address)
  return { items: page.items.filter((r) => NFT_TYPES.has(r.token?.type)), next_page_params: null }
}

export async function searchTokens(
  chainId: number,
  query: string,
): Promise<PaginatedResponse<ExplorerToken>> {
  if (!query.trim()) return empty<ExplorerToken>()
  return getCollections(chainId, query)
}

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.slice(7)}`
  if (url.startsWith('ar://')) return `https://arweave.net/${url.slice(5)}`
  return url
}

export function getNftImageUrl(instance: ExplorerTokenInstance | null | undefined): string | null {
  if (!instance) return null
  const m = instance.metadata
  return resolveMediaUrl(
    instance.image_url ??
      m?.image_url ??
      m?.image ??
      instance.animation_url ??
      m?.animation_url ??
      null,
  )
}

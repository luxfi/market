// Stubs for @luxfi/chains/explorer — inline until the package is published.
// UI pages using these will render empty states until a real implementation is wired.

export type ExplorerToken = Record<string, unknown>
export type ExplorerTokenInstance = Record<string, unknown>
export type NFTMetadata = Record<string, unknown>
export type NFTTrait = { trait_type: string; value: string | number }
export type ExplorerTransfer = Record<string, unknown>
export type ExplorerAddress = Record<string, unknown>
export type PaginatedResponse<T> = { items: T[]; next_page_params: null }

const empty = <T,>(): PaginatedResponse<T> => ({ items: [], next_page_params: null })

export const getCollections = async () => empty()
export const getToken = async (_id: string) => null
export const getTokenInstances = async () => empty()
export const getTokenInstance = async () => null
export const getTokenInstanceTransfers = async () => empty()
export const getTokenInstanceHolders = async () => empty()
export const getTokenTransfers = async () => empty()
export const getAddressTokenInstances = async () => empty()
export const getAddressTokens = async () => empty()
export const searchTokens = async () => empty()

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.slice(7)}`
  if (url.startsWith('ar://')) return `https://arweave.net/${url.slice(5)}`
  return url
}

export function getNftImageUrl(metadata: NFTMetadata | null | undefined): string | null {
  if (!metadata) return null
  const m = metadata as { image?: string; image_url?: string; animation_url?: string }
  return resolveMediaUrl(m.image_url || m.image || m.animation_url || null)
}

// The read path. One unified indexer serves every chain behind its slug, in a
// Blockscout-shaped REST API.
//
// A failed read THROWS here rather than resolving to an empty page. The two
// states look identical once they reach a list — and they mean opposite things,
// so the screens above have to be able to tell "there are none" from "we could
// not ask". Every caller runs through react-query, which carries the error.
import { INDEXER, type Chain } from '@/lib/registry'

const NFT = new Set(['ERC-721', 'ERC-1155'])

export const isNft = (type: string | undefined) => NFT.has(type ?? '')

export type Token = {
  address: string
  name: string | null
  symbol: string | null
  type: string
  /** total_supply — for a collection, the number of items minted. */
  supply: string | null
  holders: string | null
  decimals: string | null
  icon: string | null
}

export type Transfer = {
  block: number
  /** EVM log index. With `block` it identifies the Transfer log exactly. */
  logIndex: number
  time: string | null
  tx: string
  from: string
  to: string
  token: { address: string; type: string }
}

export type Holding = {
  token: Token
  /** Decimal token id, or null on a fungible row. */
  id: string | null
  /** Raw balance: 1 for an NFT, an undivided amount for a fungible token. */
  value: string
}

export type Holder = { address: string; count: string }

export type Counters = { holders: number; transfers: number }

export type Stats = {
  blocks: string | null
  transactions: string | null
  addresses: string | null
}

type Page<T> = { items: T[] }

async function read<T>(chain: Chain, path: string): Promise<T> {
  const res = await fetch(`${INDEXER}/${chain.slug}${path}`, {
    headers: { accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${chain.slug}${path} → ${res.status}`)
  return (await res.json()) as T
}

/**
 * The indexer names a token's address `address_hash` under /tokens and
 * `address` under /addresses/{hash}/tokens. Both shapes are normalised here,
 * once, so nothing above this file has to know which endpoint it came from.
 */
type RawToken = {
  address_hash?: string
  address?: string
  name: string | null
  symbol: string | null
  type: string
  total_supply: string | null
  holders_count?: string | null
  decimals: string | null
  icon_url: string | null
}

const token = (t: RawToken): Token => ({
  address: (t.address_hash ?? t.address ?? '').toLowerCase(),
  name: t.name,
  symbol: t.symbol,
  type: t.type,
  supply: t.total_supply,
  holders: t.holders_count ?? null,
  decimals: t.decimals,
  icon: t.icon_url,
})

type RawTransfer = {
  block_number: number
  log_index: number
  timestamp: string | null
  transaction_hash: string
  from: { hash: string }
  to: { hash: string }
  token: { address_hash: string; type: string }
}

const transfer = (t: RawTransfer): Transfer => ({
  block: t.block_number,
  logIndex: t.log_index,
  time: t.timestamp,
  tx: t.transaction_hash,
  from: t.from.hash,
  to: t.to.hash,
  token: { address: t.token.address_hash.toLowerCase(), type: t.token.type },
})

/** A 32-byte hex token id as the decimal a person reads. */
const id = (raw: string | null): string | null => {
  if (raw === null) return null
  try {
    return BigInt(raw).toString()
  } catch {
    return null
  }
}

/** Every token the chain indexes, fungible and not. */
export async function tokens(chain: Chain): Promise<Token[]> {
  const page = await read<Page<RawToken>>(chain, '/tokens')
  return page.items.map(token)
}

/** The NFT collections among them. The indexer ignores `?type=`. */
export async function collections(chain: Chain, search?: string): Promise<Token[]> {
  const q = search?.trim().toLowerCase()
  return (await tokens(chain)).filter(
    (t) =>
      isNft(t.type) &&
      (!q || `${t.name ?? ''} ${t.symbol ?? ''} ${t.address}`.toLowerCase().includes(q)),
  )
}

export async function collection(chain: Chain, address: string): Promise<Token> {
  return token(await read<RawToken>(chain, `/tokens/${address}`))
}

export async function counters(chain: Chain, address: string): Promise<Counters> {
  const c = await read<{ token_holders_count: string; transfers_count: string }>(
    chain,
    `/tokens/${address}/counters`,
  )
  return { holders: Number(c.token_holders_count), transfers: Number(c.transfers_count) }
}

export async function holders(chain: Chain, address: string): Promise<Holder[]> {
  const page = await read<Page<{ address: { hash: string }; value: string }>>(
    chain,
    `/tokens/${address}/holders`,
  )
  return page.items.map((h) => ({ address: h.address.hash.toLowerCase(), count: h.value }))
}

export async function transfers(chain: Chain, address: string): Promise<Transfer[]> {
  const page = await read<Page<RawTransfer>>(chain, `/tokens/${address}/transfers`)
  return page.items.map(transfer)
}

/** Chain-wide NFT movement. The feed has no type filter, so it is applied here. */
export async function activity(chain: Chain): Promise<Transfer[]> {
  const page = await read<Page<RawTransfer>>(chain, '/token-transfers')
  return page.items.filter((t) => isNft(t.token?.type)).map(transfer)
}

/**
 * What an address holds. This is the ONE indexer route that carries an item's
 * identity: every row names its token id.
 */
export async function holdings(chain: Chain, address: string): Promise<Holding[]> {
  const page = await read<Page<{ token: RawToken; token_id: string | null; value: string }>>(
    chain,
    `/addresses/${address}/tokens`,
  )
  return page.items.map((r) => ({ token: token(r.token), id: id(r.token_id), value: r.value }))
}

export async function stats(chain: Chain): Promise<Stats> {
  const s = await read<{
    total_blocks: string | null
    total_transactions: string | null
    total_addresses: string | null
  }>(chain, '/stats')
  return {
    blocks: s.total_blocks,
    transactions: s.total_transactions,
    addresses: s.total_addresses,
  }
}

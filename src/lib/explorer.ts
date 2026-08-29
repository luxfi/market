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
  /**
   * Rows the indexer records in its holdings table for this token: one per
   * holder on a fungible token, one per held ITEM on a collection. So it is a
   * holder count for an ERC-20 (verified against the resource: 11 rows, 11
   * distinct addresses) and is not one for an ERC-721 (Lux Genesis reads 3
   * across two addresses). Only a screen that knows the standard may print it.
   */
  holdings: string | null
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

export type Holder = { address: string; count: number }

/**
 * The holders read, and whether the indexer served all of it.
 *
 * The resource pages at fifty rows and reports `next_page_params: null` on the
 * page that fills, so a full page cannot be told from a complete one. `whole`
 * is false there and a screen says "at least" rather than a flat count.
 */
export type Holders = { list: Holder[]; whole: boolean }

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
 *
 * `holders_count` arrives as `holdings`, which is what it counts. See the field.
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
  holdings: t.holders_count ?? null,
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
  return (await tokens(chain))
    .filter(
      (t) =>
        isNft(t.type) &&
        (!q || `${t.name ?? ''} ${t.symbol ?? ''} ${t.address}`.toLowerCase().includes(q)),
    )
    // The indexer answers in its own order, which is by holder count. Printing
    // that unlabelled ranks one collection above another on a figure nobody
    // asked to sort by, so the list arrives by name and any order a reader
    // wants is one they chose.
    .sort((a, b) => (a.name ?? a.address).localeCompare(b.name ?? b.address))
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

/**
 * THE HOLDERS RESOURCE IS ONE ROW PER HOLDING, NOT ONE PER HOLDER.
 *
 * On an ERC-20 the two coincide and the rows are distinct. On a collection they
 * do not: Lux Genesis returns three rows for two addresses, and the Uniswap
 * position manager returns fifty rows that are all the SAME address, one per
 * token it holds. Printing them as they arrive draws one holder fifty times and
 * calls it fifty holders.
 *
 * So the rows are folded by address here, which is also what makes a holder
 * count countable: `list.length` is the number of addresses, and `count` is how
 * many of the collection each one holds.
 */
export async function holders(chain: Chain, address: string): Promise<Holders> {
  const page = await read<Page<{ address: { hash: string }; value: string }>>(
    chain,
    `/tokens/${address}/holders`,
  )
  const held = new Map<string, number>()
  for (const row of page.items) {
    const hash = row.address.hash.toLowerCase()
    held.set(hash, (held.get(hash) ?? 0) + Number(row.value))
  }
  return {
    list: [...held].map(([address, count]) => ({ address, count })).sort((a, b) => b.count - a.count),
    whole: page.items.length < PAGE,
  }
}

/** Rows the indexer serves in one page. A full page may not be the whole set. */
const PAGE = 50

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

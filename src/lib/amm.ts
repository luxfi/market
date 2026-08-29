// The AMM subgraph. Every chain the registry serves declares one; only the two
// with a factory deployed have anything in it.
//
// This is the deepest data on the surface by a wide margin — pools carry both
// tokens with symbol and decimals, the fee tier, locked value, traded volume
// and a transaction count, and the factory carries the totals directly, so the
// headline numbers are read rather than summed over a partial page.
import { GRAPH, type Chain } from '@/lib/registry'

export type Factory = {
  pools: number
  locked: string
  volume: string
  transactions: number
}

export type Pool = {
  address: string
  /** Hundredths of a basis point, as Uniswap writes it: 3000 = 0.30%. */
  fee: number
  locked: string
  volume: string
  transactions: number
  tokens: [Side, Side]
}

export type Side = { address: string; symbol: string; name: string }

async function query<T>(chain: Chain, subgraph: string, text: string): Promise<T> {
  const res = await fetch(`${GRAPH}/${chain.slug}/${subgraph}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query: text }),
  })
  if (!res.ok) throw new Error(`${chain.slug}/${subgraph} → ${res.status}`)
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (body.errors?.length) throw new Error(body.errors[0].message)
  if (!body.data) throw new Error(`${chain.slug}/${subgraph} returned no data`)
  return body.data
}

type RawSide = { id: string; symbol: string; name: string }

const side = (t: RawSide): Side => ({ address: t.id, symbol: t.symbol, name: t.name })

/** Chain-wide totals, or null where no factory is deployed. */
export async function factory(chain: Chain): Promise<Factory | null> {
  const data = await query<{
    factories: { poolCount: number; totalValueLockedUSD: string; totalVolumeUSD: string; txCount: number }[]
  }>(chain, 'amm', '{ factories { poolCount totalValueLockedUSD totalVolumeUSD txCount } }')
  const f = data.factories[0]
  if (!f) return null
  return {
    pools: f.poolCount,
    locked: f.totalValueLockedUSD,
    volume: f.totalVolumeUSD,
    transactions: f.txCount,
  }
}

export async function pools(chain: Chain): Promise<Pool[]> {
  const data = await query<{
    pools: {
      id: string
      feeTier: number
      totalValueLockedUSD: string
      volumeUSD: string
      txCount: number
      token0: RawSide
      token1: RawSide
    }[]
  }>(
    chain,
    'amm',
    `{ pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id feeTier totalValueLockedUSD volumeUSD txCount
        token0 { id symbol name } token1 { id symbol name }
      } }`,
  )
  return data.pools.map((p) => ({
    address: p.id,
    fee: p.feeTier,
    locked: p.totalValueLockedUSD,
    volume: p.volumeUSD,
    transactions: p.txCount,
    tokens: [side(p.token0), side(p.token1)],
  }))
}

/** 3000 → "0.30%". */
export const feeLabel = (fee: number) => `${(fee / 10_000).toFixed(2)}%`

/** The subgraph reports value as a decimal string of dollars. */
export const usd = (value: string) =>
  `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

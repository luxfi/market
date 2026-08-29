// THE INDEXER DROPS THE ITEM ID, AND IT IS ONE FIELD.
//
// Every ERC-721 transfer row arrives with the ERC-20 shape — total.value "1",
// no token id — because the indexer writes topics[3] nowhere. So a feed built
// on it can name the collection and the two addresses and nothing else, which
// is how a page ends up printing a column of anonymous rows.
//
// The chain still has it. eth_getLogs on the Transfer topic returns the id in
// topics[3], and the indexer's own `log_index` is the EVM log index, so
// (block, logIndex) joins a row to its log exactly. Verified against the
// Uniswap position manager, whose logs land at indices 1, 3, 5, 7 … in one
// block and match row for row.
//
// This is a read, not a workaround for a missing system: fixing the indexer to
// keep topics[3] would make it unnecessary, and until then the browser can ask
// the chain directly.
import type { Chain } from '@/lib/registry'

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

/**
 * Blocks per request, and requests per lookup. Wide ranges make the node time
 * out — a 500k-block window failed where both narrower and wider ones answered
 * — so the window is small enough to be reliable and the count is bounded.
 * Rows beyond the budget simply have no id, which the screens report as such.
 */
const WINDOW = 1024
const REQUESTS = 8

/** A transfer row, narrowed to what naming its item needs. */
export type Row = {
  block: number
  logIndex: number
  token: { address: string; type: string }
  /** The id the indexer gave, when it gave one. */
  id: string | null
}

/**
 * Does this row still need its item read out of the chain?
 *
 * One predicate, named once: the hook uses it to decide whether to make a
 * request at all, and the read below uses it to decide which rows to ask about.
 * Written twice it becomes two answers to the same question the day one of them
 * changes.
 */
export const unnamed = (r: Row) => r.id === null

const key = (block: number, logIndex: number) => `${block}:${logIndex}`

type Log = { blockNumber: string; logIndex: string; topics: string[] }

async function logs(rpc: string, address: string, from: number, to: number): Promise<Log[]> {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getLogs',
      params: [
        {
          address,
          topics: [TRANSFER],
          fromBlock: `0x${from.toString(16)}`,
          toBlock: `0x${to.toString(16)}`,
        },
      ],
    }),
  })
  if (!res.ok) throw new Error(`eth_getLogs ${res.status}`)
  const body = (await res.json()) as { result?: Log[]; error?: { message: string } }
  if (body.error) throw new Error(body.error.message)
  return body.result ?? []
}

/** Contiguous windows covering `blocks`, each at most WINDOW wide. */
function windows(blocks: number[]): [number, number][] {
  const sorted = [...new Set(blocks)].sort((a, b) => a - b)
  const out: [number, number][] = []
  for (const b of sorted) {
    const last = out[out.length - 1]
    if (last && b - last[0] <= WINDOW) last[1] = b
    else out.push([b, b])
  }
  return out
}

/**
 * Token ids for indexer transfer rows, keyed `block:logIndex`.
 *
 * ERC-721 only. ERC-1155 announces itself with TransferSingle/TransferBatch and
 * carries the id in the data rather than a topic; no ERC-1155 contract is
 * indexed on any Lux chain, so reading one would be code for a case that does
 * not exist.
 */
export async function transferIds(chain: Chain, rows: Row[]): Promise<Map<string, string>> {
  const found = new Map<string, string>()
  if (!chain.rpc) return found

  const byContract = new Map<string, number[]>()
  for (const r of rows) {
    // When the indexer names every row this loop leaves `asks` empty, no
    // request is made, and the fallback has retired itself.
    if (!unnamed(r)) continue
    if (r.token.type !== 'ERC-721') continue
    const blocks = byContract.get(r.token.address) ?? []
    blocks.push(r.block)
    byContract.set(r.token.address, blocks)
  }

  const asks: { address: string; from: number; to: number }[] = []
  for (const [address, blocks] of byContract)
    for (const [from, to] of windows(blocks)) asks.push({ address, from, to })

  const results = await Promise.all(
    asks.slice(0, REQUESTS).map((a) =>
      logs(chain.rpc!, a.address, a.from, a.to).catch(() => [] as Log[]),
    ),
  )

  for (const batch of results)
    for (const log of batch) {
      if (log.topics.length < 4) continue
      found.set(
        key(Number(BigInt(log.blockNumber)), Number(BigInt(log.logIndex))),
        BigInt(log.topics[3]).toString(),
      )
    }
  return found
}

/**
 * The item a row moved, or undefined when neither source names it.
 *
 * ONE function answers this for every screen, and it asks the indexer first.
 * The log read exists because the indexer drops the field; it is the fallback,
 * not the source, and nothing above this line needs to know which one answered.
 */
export const idFor = (ids: Map<string, string>, row: Row) =>
  row.id ?? ids.get(key(row.block, row.logIndex))

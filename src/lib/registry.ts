// WHICH CHAINS EXIST IS NOT A CONSTANT IN THIS APP.
//
// The indexer publishes its own registry and that is the authority. It carries
// the slug the indexer answers on, the chain id, the coin, the browser RPC and
// the AMM contracts, so these pages cannot drift from the indexer the way a
// hand-kept array does. The array this replaced had drifted twice: it missed
// Osage, and it offered SPC, whose RPC 404s and which the registry has never
// served.
const REGISTRY = 'https://api-explore.lux.network/v1/explorer/admin/chains'

/** One unified indexer, one slug per chain: `/v1/indexer/<slug>/<resource>`. */
export const INDEXER = 'https://api-explore.lux.network/v1/indexer'

/** One graph per chain and subgraph: `/v1/graph/<slug>/<name>/graphql`. */
export const GRAPH = 'https://api-explore.lux.network/v1/graph'

/** Uniswap-shaped contracts, present only where an AMM is deployed. */
export type Amm = {
  factoryV2: string
  factoryV3: string
  router: string
  quoter: string
  /** Wrapped native token — the AMM quotes against it. */
  native: string
}

export type Chain = {
  slug: string
  name: string
  id: number
  coin: string
  /** Reachable from a browser, or null. See `browserRpc`. */
  rpc: string | null
  /** Human explorer, or null when no public host can be derived. */
  explorer: string | null
  /** Subgraph names this chain answers on, from the registry. */
  graphs: string[]
  amm: Amm | null
}

/**
 * THE REGISTRY'S `rpc` IS THE INDEXER'S OWN ROUTE AND IS NOT ALWAYS A BROWSER'S.
 *
 * For Lux it reads http://luxd-headless.lux-mainnet.svc.cluster.local:9630/…,
 * an in-cluster name over plain HTTP that no page can reach, and the public
 * route arrives separately as `public_rpc`. The other four chains publish an
 * https api.* host in `rpc` and leave `public_rpc` empty. So take the public
 * route when there is one, take `rpc` when it is already public, and otherwise
 * admit there is none rather than render a URL that cannot answer.
 */
function browserRpc(c: { rpc: string; public_rpc?: string }): string | null {
  if (c.public_rpc) return c.public_rpc
  return c.rpc.startsWith('https://') ? c.rpc : null
}

/**
 * The explorer host follows the api host, so it is derived rather than kept in
 * a second list that can disagree with the first. Verified 200 on every chain
 * the registry serves: api.lux.network → explore.lux.network, api.zoo.ngo →
 * explore.zoo.ngo, and the same for hanzo, pars and osage.
 */
function explorerFor(rpc: string | null): string | null {
  if (!rpc) return null
  const host = new URL(rpc).host
  return host.startsWith('api.') ? `https://explore.${host.slice(4)}` : null
}

function amm(c: Record<string, string>): Amm | null {
  if (!c.factory_v2 && !c.factory_v3) return null
  return {
    factoryV2: c.factory_v2,
    factoryV3: c.factory_v3,
    router: c.router,
    quoter: c.quoter_v2,
    native: c.native,
  }
}

type Row = {
  slug: string
  name: string
  chain_id: number
  coin: string
  enabled: boolean
  default?: boolean
  rpc: string
  public_rpc?: string
  factory_v2: string
  factory_v3: string
  router: string
  quoter_v2: string
  native: string
  graph?: { subgraphs?: { name: string; enabled: boolean }[] }
}

export async function readChains(): Promise<Chain[]> {
  const res = await fetch(REGISTRY, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`registry ${res.status}`)
  const body = (await res.json()) as { chains: Row[] }
  const rows = body.chains.filter((c) => c.enabled)
  // The registry answers from a Go map, so the order it publishes changes
  // between requests — the chain switcher would reshuffle on every load. The
  // one chain it names as default leads; the rest go alphabetically.
  rows.sort(
    (a, b) =>
      Number(Boolean(b.default)) - Number(Boolean(a.default)) || a.name.localeCompare(b.name),
  )
  return rows.map((c) => {
    const rpc = browserRpc(c)
    return {
      slug: c.slug,
      name: c.name,
      id: c.chain_id,
      coin: c.coin,
      rpc,
      explorer: explorerFor(rpc),
      graphs: (c.graph?.subgraphs ?? []).filter((g) => g.enabled).map((g) => g.name),
      amm: amm(c as unknown as Record<string, string>),
    }
  })
}

/** Address page on a chain's explorer, or null when it has no public host. */
export const addressUrl = (chain: Chain, hash: string) =>
  chain.explorer ? `${chain.explorer}/address/${hash}` : null

/** Transaction page on a chain's explorer, or null. */
export const txUrl = (chain: Chain, hash: string) =>
  chain.explorer ? `${chain.explorer}/tx/${hash}` : null

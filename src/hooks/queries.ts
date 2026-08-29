'use client'

// React-query wrappers over the read modules. Nothing here fetches; each one
// names a cache key and delegates, so there is one place that knows how to ask
// the indexer and one place that knows how long an answer stays fresh.
import { useQuery } from '@tanstack/react-query'
import * as amm from '@/lib/amm'
import * as explorer from '@/lib/explorer'
import { transferIds, unnamed } from '@/lib/logs'
import type { Chain } from '@/lib/registry'

export const useCollections = (chain: Chain, search?: string) =>
  useQuery({
    queryKey: ['collections', chain.slug, search ?? ''],
    queryFn: () => explorer.collections(chain, search),
  })

export const useCollection = (chain: Chain, address: string) =>
  useQuery({
    queryKey: ['collection', chain.slug, address],
    queryFn: () => explorer.collection(chain, address),
    enabled: Boolean(address),
  })

export const useCounters = (chain: Chain, address: string) =>
  useQuery({
    queryKey: ['counters', chain.slug, address],
    queryFn: () => explorer.counters(chain, address),
    enabled: Boolean(address),
  })

export const useHolders = (chain: Chain, address: string) =>
  useQuery({
    queryKey: ['holders', chain.slug, address],
    queryFn: () => explorer.holders(chain, address),
    enabled: Boolean(address),
  })

export const useInstances = (chain: Chain, address: string) =>
  useQuery({
    queryKey: ['instances', chain.slug, address],
    queryFn: () => explorer.instances(chain, address),
    enabled: Boolean(address),
  })

export const useTransfers = (chain: Chain, address: string) =>
  useQuery({
    queryKey: ['transfers', chain.slug, address],
    queryFn: () => explorer.transfers(chain, address),
    enabled: Boolean(address),
  })

export const useActivity = (chain: Chain) =>
  useQuery({ queryKey: ['activity', chain.slug], queryFn: () => explorer.activity(chain) })

export const useHoldings = (chain: Chain, address?: string) =>
  useQuery({
    queryKey: ['holdings', chain.slug, address ?? ''],
    queryFn: () => explorer.holdings(chain, address!),
    enabled: Boolean(address),
  })

export const useStats = (chain: Chain) =>
  useQuery({ queryKey: ['stats', chain.slug], queryFn: () => explorer.stats(chain) })

/**
 * Token ids read back from the chain's own Transfer logs, for the rows the
 * indexer did not name. Depends on the rows, so it runs after them and never
 * blocks the list.
 *
 * Only the unnamed rows are asked about, and the query does not run at all when
 * there are none — so the day the indexer carries the id, this stops making
 * requests without anything being switched off.
 */
export const useTransferIds = (chain: Chain, rows: explorer.Transfer[] | undefined) => {
  const asking = rows?.filter(unnamed) ?? []
  return useQuery({
    queryKey: ['ids', chain.slug, asking.map((r) => `${r.block}:${r.logIndex}`).join(',')],
    queryFn: () => transferIds(chain, asking),
    enabled: Boolean(chain.rpc && asking.length),
    // With nothing to ask, the answer is the empty join rather than a pending
    // read: a screen that waits on a query that will never run reads "loading"
    // for ever.
    initialData: asking.length ? undefined : () => new Map<string, string>(),
  })
}

export const useFactory = (chain: Chain) =>
  useQuery({ queryKey: ['factory', chain.slug], queryFn: () => amm.factory(chain) })

export const usePools = (chain: Chain) =>
  useQuery({ queryKey: ['pools', chain.slug], queryFn: () => amm.pools(chain) })

'use client'

// React-query wrappers over the read modules. Nothing here fetches; each one
// names a cache key and delegates, so there is one place that knows how to ask
// the indexer and one place that knows how long an answer stays fresh.
import { useQuery } from '@tanstack/react-query'
import * as amm from '@/lib/amm'
import * as explorer from '@/lib/explorer'
import { transferIds } from '@/lib/logs'
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
 * Token ids for a set of transfer rows, read from the chain's own Transfer
 * logs. Depends on the rows, so it runs after them and never blocks the list.
 */
export const useTransferIds = (chain: Chain, rows: explorer.Transfer[] | undefined) =>
  useQuery({
    queryKey: ['ids', chain.slug, rows?.map((r) => `${r.block}:${r.logIndex}`).join(',') ?? ''],
    queryFn: () => transferIds(chain, rows!),
    enabled: Boolean(chain.rpc && rows?.length),
  })

export const useFactory = (chain: Chain) =>
  useQuery({ queryKey: ['factory', chain.slug], queryFn: () => amm.factory(chain) })

export const usePools = (chain: Chain) =>
  useQuery({ queryKey: ['pools', chain.slug], queryFn: () => amm.pools(chain) })

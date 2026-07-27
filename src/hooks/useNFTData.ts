'use client'

// React-query wrappers over the one data-access layer in @/lib/explorer.
import { useQuery } from '@tanstack/react-query'
import {
  getAddressTokenInstances,
  getCollections,
  getNftTransfers,
  getToken,
  getTokenInstance,
  getTokenInstances,
  getTokenInstanceTransfers,
  getTokenTransfers,
  searchTokens,
} from '@/lib/explorer'

export const useCollections = (chainId: number, search?: string) =>
  useQuery({
    queryKey: ['collections', chainId, search ?? ''],
    queryFn: () => getCollections(chainId, search),
  })

export const useCollection = (chainId: number, address: string) =>
  useQuery({
    queryKey: ['collection', chainId, address],
    queryFn: () => getToken(chainId, address),
    enabled: Boolean(address),
  })

export const useTokenInstances = (chainId: number, address: string) =>
  useQuery({
    queryKey: ['instances', chainId, address],
    queryFn: () => getTokenInstances(chainId, address),
    enabled: Boolean(address),
  })

export const useTokenInstance = (chainId: number, address: string, id: string) =>
  useQuery({
    queryKey: ['instance', chainId, address, id],
    queryFn: () => getTokenInstance(chainId, address, id),
    enabled: Boolean(address && id),
  })

export const useTokenInstanceTransfers = (chainId: number, address: string, id: string) =>
  useQuery({
    queryKey: ['instance-transfers', chainId, address, id],
    queryFn: () => getTokenInstanceTransfers(chainId, address, id),
    enabled: Boolean(address && id),
  })

export const useCollectionTransfers = (chainId: number, address: string) =>
  useQuery({
    queryKey: ['collection-transfers', chainId, address],
    queryFn: () => getTokenTransfers(chainId, address),
    enabled: Boolean(address),
  })

/** Chain-wide NFT activity — used by /activity when no collection is selected. */
export const useNftActivity = (chainId: number) =>
  useQuery({ queryKey: ['nft-activity', chainId], queryFn: () => getNftTransfers(chainId) })

export const usePortfolioNFTs = (chainId: number, address?: string) =>
  useQuery({
    queryKey: ['portfolio', chainId, address ?? ''],
    queryFn: () => getAddressTokenInstances(chainId, address!),
    enabled: Boolean(address),
  })

export const useSearchCollections = (chainId: number, query: string) =>
  useQuery({
    queryKey: ['search', chainId, query],
    queryFn: () => searchTokens(chainId, query),
    enabled: query.trim().length > 0,
  })

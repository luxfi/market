// Routes that carry a chain and an address.
//
// `output: 'export'` renders every route ahead of time, so a path segment can
// only exist for a value known at build. Collections and items are neither —
// a contract deployed after the build has to be reachable, and a dynamic
// segment would 404 on it. The chain and the address ride in the query instead:
// one page each, no build-time list of what may be looked at.
import type { Chain } from '@/lib/registry'

export const collection = (chain: Chain, address: string) =>
  `/collection?chain=${chain.slug}&address=${address}`

export const item = (chain: Chain, address: string, id: string) =>
  `/item?chain=${chain.slug}&address=${address}&id=${id}`

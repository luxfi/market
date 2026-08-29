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

/**
 * Is `href` the page being read?
 *
 * `trailingSlash` makes the router report `/support/` for a link written
 * `/support`, so comparing the raw strings matched nothing and every nav item
 * read inactive. Both sides lose the trailing slash first.
 *
 * The match is exact, not by prefix. Every link in both navs is a leaf, and a
 * prefix match lights the wrong ones: `/support` under `/support/projects`, and
 * `/launch` under `/launches`.
 */
export const here = (pathname: string, href: string) => trim(pathname) === trim(href)

const trim = (v: string) => (v.length > 1 && v.endsWith('/') ? v.slice(0, -1) : v)

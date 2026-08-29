'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import * as links from '@/lib/links'
import type { Chain } from '@/lib/registry'

// NO ITEM ON ANY LUX CHAIN HAS AN IMAGE TO SHOW, AND THE TILE SAYS SO.
//
// The indexer answers /tokens/{addr}/instances with an empty list for every
// collection — the three-token one and the 149-token one alike — so there is no
// image, no trait and no name for a single token anywhere on the read path. The
// only collection with a tokenURI points all three of its tokens at one
// malformed string on a host that no longer resolves.
//
// So the tile leads with the identity that does exist, the id, and names what
// is missing rather than drawing a grey square that reads as still loading.
// `title` and `image` arrive from the instance record when there is one, which
// is what this tile looks like the day the indexer keeps items.

/** ipfs:// and ar:// are addresses, not URLs. A gateway makes them fetchable. */
const resolve = (uri: string) =>
  uri.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${uri.slice(7)}`
    : uri.startsWith('ar://')
      ? `https://arweave.net/${uri.slice(5)}`
      : uri

export function ItemCard({
  chain,
  address,
  id,
  collection,
  title,
  image,
}: {
  chain: Chain
  address: string
  id: string
  collection?: string | null
  /** The item's own name, when the indexer records one. */
  title?: string | null
  /** The item's image, when the indexer records one. */
  image?: string | null
}) {
  return (
    <Link href={links.item(chain, address, id)} className="text-inherit no-underline">
      <Card className="overflow-hidden transition-colors hover:border-muted-foreground/30">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolve(image)}
            alt={title ?? `#${id}`}
            className="aspect-square w-full bg-secondary object-cover"
          />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-secondary">
            <span className="font-mono text-3xl font-bold">#{id}</span>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              no image published
            </span>
          </div>
        )}
        <div className="px-3 py-2.5">
          <div className="truncate text-sm font-semibold">
            {title ?? collection ?? 'Unnamed collection'}
          </div>
          <div className="mt-0.5 flex justify-between gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="truncate">{title ? (collection ?? chain.name) : chain.name}</span>
            {image ? <span className="shrink-0 font-mono">#{id}</span> : null}
          </div>
        </div>
      </Card>
    </Link>
  )
}

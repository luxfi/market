'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import * as links from '@/lib/links'
import type { Chain } from '@/lib/registry'

// NO ITEM ON ANY LUX CHAIN HAS AN IMAGE TO SHOW.
//
// The indexer never populates /tokens/{addr}/instances — it is empty on the
// three-token collection and equally empty on the 149-token one — so there is
// no image, no trait and no name for a single token anywhere on the read path.
// The only collection with a tokenURI points all three of its tokens at one
// malformed string on a host that no longer resolves.
//
// So the tile leads with the identity that does exist, the id, and says what is
// missing rather than drawing a grey square and letting it read as loading.

export function ItemCard({
  chain,
  address,
  id,
  collection,
}: {
  chain: Chain
  address: string
  id: string
  collection?: string | null
}) {
  return (
    <Link href={links.item(chain, address, id)} className="text-inherit no-underline">
      <Card className="overflow-hidden transition-colors hover:border-muted-foreground/30">
        <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-secondary">
          <span className="font-mono text-3xl font-bold">#{id}</span>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            no image published
          </span>
        </div>
        <div className="px-3 py-2.5">
          <div className="truncate text-sm font-semibold">{collection ?? 'Unnamed collection'}</div>
          <div className="mt-0.5 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
            {chain.name}
          </div>
        </div>
      </Card>
    </Link>
  )
}

'use client'

import Link from 'next/link'
import * as links from '@/lib/links'
import type { Token } from '@/lib/explorer'
import type { Chain } from '@/lib/registry'

// Item count comes from `total_supply`, which the indexer sends and the
// contract agrees with. There is deliberately no holder count on this card:
// the indexer's `holders_count` on a collection counts holdings rather than
// holders, and it disagrees with the chain — Lux Genesis reads 3 where two
// addresses hold the three tokens. The collection page counts the addresses
// itself and prints the answer there.

function Figure({ value, unit }: { value: string | null; unit: string }) {
  if (value === null) return <span className="text-muted-foreground">no {unit} reported</span>
  return <>{Number(value).toLocaleString()} {unit}</>
}

export function CollectionCard({ token, chain }: { token: Token; chain: Chain }) {
  return (
    <Link href={links.collection(chain, token.address)} className="text-inherit no-underline">
      <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30 hover:bg-secondary/50">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-xl font-bold text-muted-foreground">
          {token.symbol?.charAt(0) ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">
            {token.name ?? token.address}
          </div>
          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span>{token.type}</span>
            <span className="font-mono">{token.symbol}</span>
          </div>
        </div>
        <div className="shrink-0 text-right text-[13px]">
          <Figure value={token.supply} unit="items" />
        </div>
      </div>
    </Link>
  )
}

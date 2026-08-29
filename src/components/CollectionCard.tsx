'use client'

import Link from 'next/link'
import * as links from '@/lib/links'
import type { Token } from '@/lib/explorer'
import type { Chain } from '@/lib/registry'

// Supply and holder count come from `total_supply` and `holders_count`. The
// card used to read `token.address` and `token.holders`, which the indexer does
// not send under those names, so every link pointed at `undefined`, every row
// shared one React key, and every holder count printed three dashes.

function Figure({ value, unit }: { value: string | null; unit: string }) {
  if (value === null) return <span className="text-muted-foreground">no {unit} reported</span>
  return <>{Number(value).toLocaleString()} {unit}</>
}

export function CollectionCard({
  token,
  chain,
  rank,
}: {
  token: Token
  chain: Chain
  rank?: number
}) {
  return (
    <Link href={links.collection(chain, token.address)} className="text-inherit no-underline">
      <div className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30 hover:bg-secondary/50">
        {rank !== undefined && (
          <div className="w-6 text-center font-mono text-sm font-bold text-muted-foreground">
            {rank}
          </div>
        )}
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
          <div>
            <Figure value={token.holders} unit="holders" />
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            <Figure value={token.supply} unit="items" />
          </div>
        </div>
      </div>
    </Link>
  )
}

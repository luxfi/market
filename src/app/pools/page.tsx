'use client'

import { ExternalLink } from '@luxfi/ui/icons'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Stat } from '@/components/Stat'
import { Card } from '@/components/ui/card'
import { useFactory, usePools } from '@/hooks/queries'
import { feeLabel, usd, type Pool } from '@/lib/amm'
import { addressUrl, type Chain } from '@/lib/registry'

// The deepest data on this surface, by a distance.
//
// Two chains have a Uniswap-shaped AMM deployed and their subgraph answers with
// both sides of every pool, the fee tier, locked value, traded volume and a
// transaction count. The chain totals come from the factory entity rather than
// a sum over one page of pools, so the headline figures are read rather than
// added up from a partial list.
//
// Nothing here swaps. Quoting and routing are lux.exchange's job and duplicating
// them would put a second, disagreeing router on the estate.

function Row({ pool, chain }: { pool: Pool; chain: Chain }) {
  const href = addressUrl(chain, pool.address)
  const [a, b] = pool.tokens
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 text-[13px]">
      <div className="min-w-0 flex-1">
        <div className="font-medium">
          {a.symbol} / {b.symbol}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {a.name} and {b.name}
        </div>
      </div>
      <div className="w-16 text-right font-mono text-xs text-muted-foreground">
        {feeLabel(pool.fee)}
      </div>
      <div className="w-28 text-right font-mono">{usd(pool.locked)}</div>
      <div className="w-28 text-right font-mono text-muted-foreground">{usd(pool.volume)}</div>
      <div className="w-24 text-right font-mono text-muted-foreground">
        {pool.transactions.toLocaleString()}
      </div>
      <div className="w-5 text-right">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the pool on the explorer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

function Liquidity({ chain }: { chain: Chain }) {
  const factory = useFactory(chain)
  const pools = usePools(chain)

  if (factory.isLoading)
    return (
      <Card className="p-6 text-sm text-muted-foreground">Reading the {chain.name} subgraph…</Card>
    )

  if (factory.isError)
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        The subgraph did not answer: {(factory.error as Error).message}
      </Card>
    )

  if (!factory.data)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        No AMM factory is deployed on {chain.name}. The registry lists no factory address for it and
        its subgraph holds no pools, so there is no liquidity to report — not zero liquidity in
        deployed pools, no pools.
      </Card>
    )

  return (
    <>
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Stat label="Pools" value={factory.data.pools.toLocaleString()} />
        <Stat label="Value locked" value={usd(factory.data.locked)} />
        <Stat label="Volume" value={usd(factory.data.volume)} note="all time" />
        <Stat label="Swaps" value={factory.data.transactions.toLocaleString()} note="all time" />
      </div>

      <div className="flex items-center gap-3 border-b border-border py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <div className="flex-1">Pair</div>
        <div className="w-16 text-right">Fee</div>
        <div className="w-28 text-right">Locked</div>
        <div className="w-28 text-right">Volume</div>
        <div className="w-24 text-right">Swaps</div>
        <div className="w-5" />
      </div>

      {pools.isLoading ? (
        <div className="py-6 text-sm text-muted-foreground">Reading pools…</div>
      ) : pools.isError ? (
        <div className="py-6 text-sm text-muted-foreground">
          The subgraph answered for the totals but not for the pools:{' '}
          {(pools.error as Error).message}
        </div>
      ) : (
        (pools.data ?? []).map((pool) => <Row key={pool.address} pool={pool} chain={chain} />)
      )}
    </>
  )
}

export default function PoolsPage() {
  return (
    <Page
      title="Pools"
      intro={
        <>
          Liquidity on the selected chain, read from its AMM subgraph. Swapping happens on{' '}
          <a href="https://lux.exchange" className="text-foreground hover:underline">
            lux.exchange
          </a>
          , which owns quoting and routing; this page only reports what the pools hold.
        </>
      }
    >
      {({ chain }) => (
        <>
          <Source>Read live from the {chain.name} AMM subgraph.</Source>
          <Liquidity chain={chain} />
        </>
      )}
    </Page>
  )
}

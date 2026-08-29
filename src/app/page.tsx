'use client'

import { ArrowRight } from '@luxfi/ui/icons'
import Link from 'next/link'
import { CollectionCard } from '@/components/CollectionCard'
import { Page } from '@/components/Page'
import { SearchBar } from '@/components/SearchBar'
import { Source } from '@/components/Source'
import { Stat } from '@/components/Stat'
import { Card } from '@/components/ui/card'
import { useCollections, useFactory } from '@/hooks/queries'
import { usd } from '@/lib/amm'
import type { Chain } from '@/lib/registry'

// WHAT THIS PAGE USED TO SAY, AND WHY NONE OF IT IS HERE.
//
// A row of four Genesis tiers — Genesis, Validator, Mini, Nano at 1B, 100M, 10M
// and 1M LUX with 10x to 1x rewards — none of which was read from anything. The
// real collection is three tokens with no per-token metadata at all; the one
// figure the tier table got right, a billion LUX bonded per token, is on
// /genesis now because the contract answers it.
//
// And a stat row asserting "Trading Protocol: Seaport" and "AMM Protocol:
// LSSVM". Neither is deployed on any Lux chain. The tiles below are the four
// numbers this surface can actually read.

function Headline({ chain }: { chain: Chain }) {
  const collections = useCollections(chain)
  const factory = useFactory(chain)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      <Stat
        label="Collections"
        value={collections.data ? collections.data.length.toLocaleString() : null}
        note={`ERC-721 and ERC-1155 on ${chain.name}`}
      />
      <Stat
        label="Pools"
        value={factory.isLoading ? null : (factory.data?.pools.toLocaleString() ?? '0')}
        note={factory.data ? 'Uniswap-shaped AMM' : 'no factory deployed'}
      />
      <Stat
        label="Value locked"
        value={factory.data ? usd(factory.data.locked) : null}
        note="reported by the subgraph"
      />
      <Stat
        label="Swaps"
        value={factory.data ? factory.data.transactions.toLocaleString() : null}
        note="all time"
      />
    </div>
  )
}

/**
 * How many collections the front page carries before the full list.
 *
 * They arrive by name, so a short prefix is a slice of an alphabet rather than
 * a shortlist — nothing here decides which collection deserves the front page.
 */
const LEAD = 10

function Collections({ chain }: { chain: Chain }) {
  const { data, isLoading, isError, error } = useCollections(chain)

  if (isLoading) return <Card className="p-6 text-sm text-muted-foreground">Reading {chain.name}…</Card>
  if (isError)
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        The indexer did not answer for {chain.name}: {(error as Error).message}
      </Card>
    )
  if (!data?.length)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        The indexer records no ERC-721 or ERC-1155 contract on {chain.name}. That is the chain, not
        the read — it has none. Deploy one and it appears here within a block or two, or{' '}
        <Link href="/launch" className="text-foreground hover:underline">
          apply
        </Link>{' '}
        if you want a hand doing it.
      </Card>
    )

  return (
    <div className="flex flex-col gap-2">
      {data.slice(0, LEAD).map((token) => (
        <CollectionCard key={token.address} token={token} chain={chain} />
      ))}
    </div>
  )
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="flex items-center gap-1 text-[13px] font-medium no-underline hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export default function Home() {
  return (
    <Page
      title="Lux Market"
      intro={
        <>
          Collections, the addresses that hold them and every transfer between them, read from the
          Lux indexer on each page load, alongside the AMM pools behind the tokens those chains
          trade. Nothing here is for sale: no marketplace contract is deployed on any Lux chain, so
          nothing has ever been listed, bid on or sold, and this surface will not pretend otherwise
          until one is.
        </>
      }
    >
      {({ chain, chains }) => (
        <>
          <Source>Read live from {chain.name}.</Source>

          <div className="mb-10 max-w-[480px]">
            <SearchBar chain={chain} />
          </div>

          <Section title={`Collections on ${chain.name}`} href="/collections">
            <Collections chain={chain} />
          </Section>

          <Section title="What this chain reports" href="/pools">
            <Headline chain={chain} />
          </Section>

          <Section title="Bring something here">
            <Card className="max-w-[76ch] space-y-3 p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every contract on{' '}
                {chains.map((c) => c.name).join(', ')}{' '}
                turns up on these pages without asking anyone, because they print what the indexer
                returns. Applying is for the parts a contract cannot do by existing — deploying one
                in the first place, running your own L1, or telling us that something here reads
                wrong.
              </p>
              <Link
                href="/launch"
                className="inline-flex items-center gap-1 text-sm font-medium no-underline hover:underline"
              >
                Apply <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </Section>
        </>
      )}
    </Page>
  )
}

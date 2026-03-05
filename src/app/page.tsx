'use client'

import { Header } from '@/components/Header'
import { SearchBar } from '@/components/SearchBar'
import { CollectionCard } from '@/components/CollectionCard'
import { useChainContext } from '@/hooks/useChain'
import { useCollections } from '@/hooks/useNFTData'
import Link from 'next/link'
import { CHAIN_INFO } from '@/lib/chains'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

const GENESIS_TIERS = [
  { name: 'Genesis', locked: '1B LUX', tier: 'Tier 1', multiplier: '10x' },
  { name: 'Validator', locked: '100M LUX', tier: 'Tier 2', multiplier: '5x' },
  { name: 'Mini', locked: '10M LUX', tier: 'Tier 3', multiplier: '2x' },
  { name: 'Nano', locked: '1M LUX', tier: 'Tier 4', multiplier: '1x' },
]

export default function Home() {
  const { chainId } = useChainContext()
  const { data: collections, isLoading } = useCollections(chainId)
  const chainInfo = CHAIN_INFO[chainId]

  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 tracking-tight">Lux Market</h1>
          <p className="text-base text-muted-foreground max-w-[560px] mx-auto mb-6">
            Trade NFTs across all Lux chains. Seaport-powered P2P trading with LSSVM AMM liquidity.
          </p>
          <div className="max-w-[480px] mx-auto">
            <SearchBar />
          </div>
        </section>

        {/* Genesis Featured */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Genesis Collection</h2>
            <Link href="/genesis" className="text-primary no-underline text-[13px] font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {GENESIS_TIERS.map((nft) => (
              <Link key={nft.name} href="/genesis" className="no-underline text-inherit group">
                <Card className="overflow-hidden transition-all duration-200 hover:border-muted-foreground/30 hover:-translate-y-0.5">
                  <div className="aspect-square bg-gradient-to-br from-secondary to-muted flex flex-col items-center justify-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
                      {nft.tier}
                    </span>
                    <span className="text-2xl font-bold">{nft.name}</span>
                    <span className="text-xs text-primary">{nft.multiplier} rewards</span>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="text-[11px] text-muted-foreground">Permanently Locked</div>
                    <div className="text-sm font-semibold mt-0.5">{nft.locked}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Collections on selected chain */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Collections on{' '}
              <span style={{ color: chainInfo?.color }}>{chainInfo?.name ?? 'Lux'}</span>
            </h2>
            <Link
              href="/collections"
              className="text-primary no-underline text-[13px] font-medium flex items-center gap-1 hover:underline"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading collections...</div>
          ) : !collections?.items?.length ? (
            <Card className="text-center py-8 text-muted-foreground">
              No NFT collections found on {chainInfo?.name ?? 'this chain'} yet. Deploy an ERC-721 or ERC-1155 to get started.
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {collections.items.slice(0, 10).map((token, i) => (
                <CollectionCard key={token.address} token={token} chainId={chainId} rank={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            {[
              { label: 'Supported Chains', value: '5' },
              { label: 'Collections', value: collections?.items?.length?.toString() ?? '---' },
              { label: 'Trading Protocol', value: 'Seaport' },
              { label: 'AMM Protocol', value: 'LSSVM' },
            ].map((stat) => (
              <Card key={stat.label} className="px-5 py-4">
                <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest">
                  {stat.label}
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

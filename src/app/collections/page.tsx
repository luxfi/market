'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { CollectionCard } from '@/components/CollectionCard'
import { useChainContext } from '@/hooks/useChain'
import { useCollections } from '@/hooks/useNFTData'
import { CHAIN_INFO } from '@/lib/chains'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default function CollectionsPage() {
  const { chainId } = useChainContext()
  const [search, setSearch] = useState('')
  const { data: collections, isLoading } = useCollections(chainId, search || undefined)
  const chainInfo = CHAIN_INFO[chainId]

  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Collections</h1>
        </div>
        <p className="text-muted-foreground mb-6 text-sm">
          Browse NFT collections on{' '}
          <span className="font-semibold" style={{ color: chainInfo?.color }}>{chainInfo?.name ?? 'Lux'}</span>.
          Collections with LSSVM pools have instant buy/sell liquidity.
        </p>

        {/* Search */}
        <div className="mb-6 relative max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections by name..."
            className="pl-9 h-10 rounded-[10px] bg-card"
          />
        </div>

        {/* Collection list */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading collections...</div>
        ) : !collections?.items?.length ? (
          <Card className="text-center py-12 text-muted-foreground">
            {search
              ? `No collections matching "${search}" on ${chainInfo?.name ?? 'this chain'}.`
              : `No NFT collections found on ${chainInfo?.name ?? 'this chain'} yet.`}
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {collections.items.map((token, i) => (
              <CollectionCard key={token.address} token={token} chainId={chainId} rank={i + 1} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

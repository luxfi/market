'use client'

import { use, useState, useMemo } from 'react'
import { Header } from '@/components/Header'
import { NFTCard } from '@/components/NFTCard'
import { TraitFilter } from '@/components/TraitFilter'
import { ActivityRow } from '@/components/ActivityRow'
import { useCollection, useTokenInstances, useCollectionTransfers } from '@/hooks/useNFTData'
import { CHAIN_INFO, EXPLORER_API } from '@/lib/chains'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

type Tab = 'items' | 'activity'

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ chainId: string; address: string }>
}) {
  const { chainId: chainIdStr, address } = use(params)
  const chainId = Number(chainIdStr)
  const chainInfo = CHAIN_INFO[chainId]
  const explorerBase = EXPLORER_API[chainId]?.replace('/api/v2', '') ?? 'https://explore.lux.network'

  const [tab, setTab] = useState<Tab>('items')
  const [selectedTraits, setSelectedTraits] = useState<Record<string, Set<string>>>({})

  const { data: collection } = useCollection(chainId, address)
  const { data: instances, isLoading: loadingInstances } = useTokenInstances(chainId, address)
  const { data: transfers } = useCollectionTransfers(chainId, address)

  const handleTraitToggle = (traitType: string, value: string) => {
    setSelectedTraits((prev) => {
      const next = { ...prev }
      const set = new Set(next[traitType] ?? [])
      if (set.has(value)) set.delete(value)
      else set.add(value)
      next[traitType] = set
      return next
    })
  }

  // Filter instances by selected traits
  const filteredInstances = useMemo(() => {
    const items = instances?.items ?? []
    const hasFilters = Object.values(selectedTraits).some((s) => s.size > 0)
    if (!hasFilters) return items

    return items.filter((inst) => {
      const attrs = inst.metadata?.attributes
      if (!attrs) return false
      for (const [traitType, values] of Object.entries(selectedTraits)) {
        if (values.size === 0) continue
        const match = attrs.some((a) => a.trait_type === traitType && values.has(String(a.value)))
        if (!match) return false
      }
      return true
    })
  }, [instances?.items, selectedTraits])

  return (
    <div>
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Collection header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-[72px] h-[72px] rounded-[14px] shrink-0 flex items-center justify-center text-2xl font-bold text-muted-foreground/30 bg-cover bg-center"
              style={
                collection?.icon_url
                  ? { backgroundImage: `url(${collection.icon_url})` }
                  : { background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)))' }
              }
            >
              {!collection?.icon_url && (collection?.symbol?.charAt(0) ?? '?')}
            </div>
            <div>
              <h1 className="text-[28px] font-bold">{collection?.name ?? 'Loading...'}</h1>
              <div className="flex gap-3 mt-1 text-[13px] text-muted-foreground">
                {chainInfo && <span style={{ color: chainInfo.color }}>{chainInfo.name}</span>}
                <span>{collection?.type}</span>
                <a
                  href={`${explorerBase}/token/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground no-underline hover:text-foreground flex items-center gap-1"
                >
                  <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mb-4">
            {[
              { label: 'Items', value: collection?.total_supply ? Number(collection.total_supply).toLocaleString() : '---' },
              { label: 'Holders', value: collection?.holders ? Number(collection.holders).toLocaleString() : '---' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-[11px] text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </div>
                <div className="text-xl font-bold mt-0.5 font-mono">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {(['items', 'activity'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-5 py-2.5 bg-transparent border-none text-sm font-semibold cursor-pointer capitalize transition-colors border-b-2',
                  tab === t
                    ? 'text-foreground border-foreground'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {t}
                {t === 'items' && instances?.items && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({filteredInstances.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'items' && (
          <div className="flex gap-6">
            {/* Trait sidebar */}
            <TraitFilter
              instances={instances?.items ?? []}
              selectedTraits={selectedTraits}
              onTraitToggle={handleTraitToggle}
              onClear={() => setSelectedTraits({})}
            />

            {/* NFT grid */}
            <div className="flex-1">
              {loadingInstances ? (
                <div className="text-center py-12 text-muted-foreground">Loading NFTs...</div>
              ) : filteredInstances.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No NFTs found</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  {filteredInstances.map((inst) => (
                    <NFTCard
                      key={`${inst.token.address}-${inst.id}`}
                      contractAddress={inst.token.address}
                      tokenId={inst.id}
                      chainId={chainId}
                      instance={inst}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div>
            {!transfers?.items?.length ? (
              <div className="text-center py-12 text-muted-foreground">No activity yet</div>
            ) : (
              transfers.items.map((t, i) => <ActivityRow key={`${t.tx_hash}-${i}`} transfer={t} chainId={chainId} />)
            )}
          </div>
        )}
      </main>
    </div>
  )
}

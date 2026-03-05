'use client'

import { Header } from '@/components/Header'
import { ActivityRow } from '@/components/ActivityRow'
import { useChainContext } from '@/hooks/useChain'
import { useQuery } from '@tanstack/react-query'
import { EXPLORER_API } from '@/lib/chains'

/** Fetch recent NFT transfers across all NFT contracts on the selected chain */
async function getRecentNftTransfers(chainId: number) {
  const base = EXPLORER_API[chainId] ?? EXPLORER_API[96369]
  const res = await fetch(`${base}/token-transfers?type=ERC-721,ERC-1155`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 15 },
  })
  if (!res.ok) return { items: [] }
  return res.json()
}

export default function ActivityPage() {
  const { chainId } = useChainContext()
  const { data, isLoading } = useQuery({
    queryKey: ['nft', 'activity', chainId],
    queryFn: () => getRecentNftTransfers(chainId),
    staleTime: 15_000,
  })

  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Activity</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Recent NFT transfers, mints, and sales across all collections.
        </p>

        {/* Column headers */}
        <div className="flex items-center gap-3 py-2 border-b border-border text-[11px] text-muted-foreground uppercase tracking-widest">
          <div className="w-[72px] text-center">Event</div>
          <div className="flex-1">Item</div>
          <div className="w-[200px] text-center">From / To</div>
          <div className="w-10 text-right">Chain</div>
          <div className="w-20 text-right">Date</div>
          <div className="w-5" />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading activity...</div>
        ) : !data?.items?.length ? (
          <div className="text-center py-12 text-muted-foreground">
            No NFT activity found on this chain yet.
          </div>
        ) : (
          data.items.map((transfer: any, i: number) => (
            <ActivityRow key={`${transfer.tx_hash}-${i}`} transfer={transfer} chainId={chainId} />
          ))
        )}
      </main>
    </div>
  )
}

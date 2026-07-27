'use client'

import { Header } from '@/components/Header'
import { ActivityRow } from '@/components/ActivityRow'
import { useChainContext } from '@/hooks/useChain'
import { useNftActivity } from '@/hooks/useNFTData'

export default function ActivityPage() {
  const { chainId } = useChainContext()
  const { data, isLoading } = useNftActivity(chainId)

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
          data.items.map((transfer, i) => (
            <ActivityRow
              key={`${transfer.transaction_hash}-${transfer.block_number}-${i}`}
              transfer={transfer}
              chainId={chainId}
            />
          ))
        )}
      </main>
    </div>
  )
}

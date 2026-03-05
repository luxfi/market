'use client'

import Link from 'next/link'
import { CHAIN_INFO } from '@/lib/chains'
import type { ExplorerToken } from '@/lib/explorer'

interface CollectionCardProps {
  token: ExplorerToken
  chainId: number
  rank?: number
}

export function CollectionCard({ token, chainId, rank }: CollectionCardProps) {
  const chainInfo = CHAIN_INFO[chainId]

  return (
    <Link
      href={`/collection/${chainId}/${token.address}`}
      className="no-underline text-inherit"
    >
      <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4 transition-colors cursor-pointer hover:border-muted-foreground/30 hover:bg-secondary/50">
        {rank !== undefined && (
          <div className="text-sm font-bold text-muted-foreground w-6 text-center font-mono">
            {rank}
          </div>
        )}
        {/* Collection icon */}
        <div
          className="w-14 h-14 rounded-[10px] shrink-0 flex items-center justify-center text-xl font-bold text-muted-foreground/30 bg-cover bg-center"
          style={
            token.icon_url
              ? { backgroundImage: `url(${token.icon_url})` }
              : { background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)))' }
          }
        >
          {!token.icon_url && (token.symbol?.charAt(0) ?? '?')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold truncate">
            {token.name}
          </div>
          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
            <span>{token.type}</span>
            {chainInfo && (
              <span style={{ color: chainInfo.color }}>{chainInfo.name}</span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[13px]">
            {token.holders ? Number(token.holders).toLocaleString() : '---'} holders
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {token.total_supply ? Number(token.total_supply).toLocaleString() : '---'} items
          </div>
        </div>
      </div>
    </Link>
  )
}

'use client'

import Link from 'next/link'
import { CHAIN_INFO, EXPLORER_API } from '@/lib/chains'
import { ExternalLink } from 'lucide-react'
import type { ExplorerTransfer } from '@/lib/explorer'
import { shortenAddress } from '@/lib/utils'

function getEventType(method: string): { label: string } {
  const m = method.toLowerCase()
  if (m.includes('mint') || m === 'transfer') return { label: 'Transfer' }
  if (m.includes('safe')) return { label: 'Transfer' }
  return { label: method || 'Transfer' }
}

interface ActivityRowProps {
  transfer: ExplorerTransfer
  chainId: number
}

export function ActivityRow({ transfer, chainId }: ActivityRowProps) {
  const chainInfo = CHAIN_INFO[chainId]
  const apiBase = EXPLORER_API[chainId]
  const explorerBase = apiBase?.replace('/api/v2', '') ?? 'https://explore.lux.network'
  const event = getEventType(transfer.method)
  const isMint = transfer.from.hash === '0x0000000000000000000000000000000000000000'
  const tokenId = transfer.total?.token_id ?? '?'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border text-[13px]">
      {/* Event type */}
      <div
        className={`px-2.5 py-1 rounded-md text-xs font-semibold w-[72px] text-center shrink-0 ${
          isMint
            ? 'bg-success/10 text-success'
            : 'bg-muted-foreground/10 text-muted-foreground'
        }`}
      >
        {isMint ? 'Mint' : event.label}
      </div>

      {/* Item */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/nft/${chainId}/${transfer.token.address}/${tokenId}`}
          className="text-foreground no-underline font-medium hover:underline"
        >
          {transfer.token.name} #{tokenId}
        </Link>
      </div>

      {/* From -> To */}
      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        <a
          href={`${explorerBase}/address/${transfer.from.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground no-underline font-mono text-xs hover:text-foreground"
        >
          {isMint ? 'NullAddress' : shortenAddress(transfer.from.hash)}
        </a>
        <span className="text-[10px]">&rarr;</span>
        <a
          href={`${explorerBase}/address/${transfer.to.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground no-underline font-mono text-xs hover:text-foreground"
        >
          {shortenAddress(transfer.to.hash)}
        </a>
      </div>

      {/* Chain */}
      {chainInfo && (
        <div
          className="text-[11px] font-semibold w-10 text-right shrink-0"
          style={{ color: chainInfo.color }}
        >
          {chainInfo.name}
        </div>
      )}

      {/* Time */}
      <div className="text-muted-foreground text-xs w-20 text-right shrink-0">
        {transfer.timestamp ? new Date(transfer.timestamp).toLocaleDateString() : '---'}
      </div>

      {/* Tx link */}
      <a
        href={`${explorerBase}/tx/${transfer.tx_hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground shrink-0 hover:text-foreground transition-colors"
        title="View on explorer"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

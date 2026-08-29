'use client'

import { ExternalLink } from '@luxfi/ui/icons'
import Link from 'next/link'
import type { Token, Transfer } from '@/lib/explorer'
import * as links from '@/lib/links'
import { addressUrl, txUrl, type Chain } from '@/lib/registry'
import { shortenAddress } from '@/lib/utils'

const ZERO = '0x0000000000000000000000000000000000000000'

function Hash({ chain, hash }: { chain: Chain; hash: string }) {
  const href = addressUrl(chain, hash)
  const text = hash === ZERO ? 'null address' : shortenAddress(hash)
  if (!href) return <span className="font-mono text-xs text-muted-foreground">{text}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-muted-foreground no-underline hover:text-foreground"
    >
      {text}
    </a>
  )
}

export function ActivityRow({
  transfer,
  chain,
  token,
  id,
}: {
  transfer: Transfer
  chain: Chain
  /** The collection, matched by address against the chain's token list. */
  token?: Token
  /** Token id read from the Transfer log, when the log was in reach. */
  id?: string
}) {
  const mint = transfer.from === ZERO
  const name = token?.name ?? token?.symbol ?? shortenAddress(transfer.token.address)
  const tx = txUrl(chain, transfer.tx)

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 text-[13px]">
      <div className="w-[72px] shrink-0 rounded-md bg-muted px-2.5 py-1 text-center text-xs font-semibold">
        {mint ? 'Mint' : 'Transfer'}
      </div>

      <div className="min-w-0 flex-1">
        {id !== undefined ? (
          <Link
            href={links.item(chain, transfer.token.address, id)}
            className="font-medium text-foreground no-underline hover:underline"
          >
            {name} #{id}
          </Link>
        ) : (
          <span>
            <Link
              href={links.collection(chain, transfer.token.address)}
              className="font-medium text-foreground no-underline hover:underline"
            >
              {name}
            </Link>
            <span className="ml-2 text-muted-foreground">item id not read</span>
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Hash chain={chain} hash={transfer.from} />
        <span className="text-[10px] text-muted-foreground">&rarr;</span>
        <Hash chain={chain} hash={transfer.to} />
      </div>

      <div className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {transfer.time ? new Date(transfer.time).toLocaleDateString() : 'no timestamp'}
      </div>

      <div className="w-5 shrink-0 text-right">
        {tx ? (
          <a
            href={tx}
            target="_blank"
            rel="noopener noreferrer"
            title="Open the transaction on the explorer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

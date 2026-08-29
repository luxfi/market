'use client'

import { useMemo } from 'react'
import { ActivityRow } from '@/components/ActivityRow'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Card } from '@/components/ui/card'
import { useActivity, useCollections, useTransferIds } from '@/hooks/queries'
import { idFor } from '@/lib/logs'
import type { Chain } from '@/lib/registry'

// THE FEED USED TO BE FORTY-FIVE ROWS OF "NFT #?".
//
// Two fields are missing from every transfer the indexer serves. It writes the
// ERC-20 shape into `total` and discards the token id, and it sends the token
// as an address and a type with no name on it. So the rows were
// indistinguishable: same collection, same pair of addresses, same day, no id.
//
// Both are recoverable without waiting on the indexer. The name comes from the
// chain's own token list, joined on the address. The id comes from the chain:
// eth_getLogs on the Transfer topic returns it in topics[3], and the indexer's
// log_index is the EVM log index, so a row joins its log exactly. Rows whose
// log fell outside the read say so rather than printing a question mark.

function Feed({ chain }: { chain: Chain }) {
  const activity = useActivity(chain)
  const tokens = useCollections(chain)
  const ids = useTransferIds(chain, activity.data)

  const byAddress = useMemo(
    () => new Map((tokens.data ?? []).map((t) => [t.address, t])),
    [tokens.data],
  )

  if (activity.isLoading)
    return <Card className="p-6 text-sm text-muted-foreground">Reading {chain.name}…</Card>
  if (activity.isError)
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        The indexer did not answer: {(activity.error as Error).message}
      </Card>
    )
  if (!activity.data?.length)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        No ERC-721 or ERC-1155 transfer appears in the feed the indexer returns for {chain.name}.
      </Card>
    )

  const unread = ids.data
    ? activity.data.filter((t) => idFor(ids.data, t) === undefined).length
    : activity.data.length

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        <div className="w-[72px] text-center">Event</div>
        <div className="flex-1">Item</div>
        <div className="w-[196px] text-center">From → to</div>
        <div className="w-24 text-right">Date</div>
        <div className="w-5" />
      </div>

      {activity.data.map((transfer) => (
        <ActivityRow
          key={`${transfer.block}:${transfer.logIndex}`}
          transfer={transfer}
          chain={chain}
          token={byAddress.get(transfer.token.address)}
          id={ids.data ? idFor(ids.data, transfer) : undefined}
        />
      ))}

      {unread > 0 ? (
        <p className="mt-4 max-w-[76ch] text-[13px] leading-relaxed text-muted-foreground">
          {unread} of {activity.data.length} rows show no item id. The indexer does not keep one, so
          each id is read back from the chain&rsquo;s Transfer logs, and that read is bounded — rows
          whose block fell outside it are left unnamed rather than guessed at.
        </p>
      ) : null}
    </>
  )
}

export default function ActivityPage() {
  return (
    <Page
      title="Activity"
      intro="Every ERC-721 and ERC-1155 transfer in the feed the indexer serves for the selected chain. Mints are transfers from the null address; there are no sales, because no marketplace contract is deployed to make one."
    >
      {({ chain }) => (
        <>
          <Source>Read live from {chain.name}.</Source>
          <Feed chain={chain} />
        </>
      )}
    </Page>
  )
}

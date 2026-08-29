'use client'

import { Search } from '@luxfi/ui/icons'
import Link from 'next/link'
import { useState } from 'react'
import { CollectionCard } from '@/components/CollectionCard'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCollections } from '@/hooks/queries'
import type { Chain } from '@/lib/registry'

function List({ chain, search }: { chain: Chain; search: string }) {
  const { data, isLoading, isError, error } = useCollections(chain, search || undefined)

  if (isLoading) return <Card className="p-6 text-sm text-muted-foreground">Reading {chain.name}…</Card>
  if (isError)
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        The indexer did not answer: {(error as Error).message}
      </Card>
    )
  if (!data?.length)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        {search
          ? `Nothing on ${chain.name} matches “${search}”.`
          : (
            <>
              The indexer records no ERC-721 or ERC-1155 contract on {chain.name}. Deploy one and it
              appears here within a block or two, or{' '}
              <Link href="/launch" className="text-foreground hover:underline">
                apply
              </Link>
              .
            </>
          )}
      </Card>
    )

  return (
    <div className="flex flex-col gap-2">
      {data.map((token, i) => (
        <CollectionCard key={token.address} token={token} chain={chain} rank={i + 1} />
      ))}
    </div>
  )
}

export default function CollectionsPage() {
  const [search, setSearch] = useState('')

  return (
    <Page
      title="Collections"
      intro="Every ERC-721 and ERC-1155 contract the indexer records on the selected chain, with the holder count and item count it reports for each."
    >
      {({ chain }) => (
        <>
          <Source>Read live from {chain.name}.</Source>

          <div className="relative mb-6 max-w-[400px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, symbol or address"
              className="h-10 rounded-[10px] bg-card pl-9"
            />
          </div>
          <List chain={chain} search={search} />
        </>
      )}
    </Page>
  )
}

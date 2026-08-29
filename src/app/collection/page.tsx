'use client'

import { ExternalLink } from '@luxfi/ui/icons'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { ItemCard } from '@/components/ItemCard'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Stat } from '@/components/Stat'
import { Card } from '@/components/ui/card'
import type { ChainState } from '@/hooks/chain'
import { useCollection, useCounters, useHolders, useTransfers, useTransferIds } from '@/hooks/queries'
import { ERC165_ABI, ERC2981_ABI, ERC721_ABI, INTERFACE, ONE, rateLabel } from '@/lib/contracts'
import { idFor } from '@/lib/logs'
import { addressUrl, type Chain } from '@/lib/registry'
import { shortenAddress } from '@/lib/utils'

// THE PAGE EVERY COLLECTION CARD ON THIS SITE LINKED TO AND WHICH DID NOT EXIST.
//
// The cards pointed at /collection/{chainId}/{address}; src/app had no dynamic
// segment at all, so every one of them returned 404. A path segment cannot hold
// a contract address under `output: 'export'` — the route would have to be
// listed at build time and a contract deployed afterwards could never be
// reached — so the chain and the address ride in the query instead.

type Ready = Extract<ChainState, { status: 'ready' }>

/** What the contract says it is. ERC-165 is the only self-description there is. */
function Declares({ chain, address }: { chain: Chain; address: string }) {
  const contract = { chainId: chain.id, address: address as `0x${string}` }
  const { data } = useReadContracts({
    allowFailure: true,
    contracts: [
      { ...contract, abi: ERC165_ABI, functionName: 'supportsInterface', args: [INTERFACE.erc721] },
      { ...contract, abi: ERC165_ABI, functionName: 'supportsInterface', args: [INTERFACE.erc1155] },
      { ...contract, abi: ERC165_ABI, functionName: 'supportsInterface', args: [INTERFACE.royalty] },
      { ...contract, abi: ERC2981_ABI, functionName: 'royaltyInfo', args: [0n, ONE] },
      { ...contract, abi: ERC721_ABI, functionName: 'totalSupply' },
    ],
    query: { enabled: Boolean(chain.rpc) },
  })

  if (!data) return null
  const [erc721, erc1155, royalty, quote, supply] = data
  const standards = [
    erc721.result === true ? 'ERC-721' : null,
    erc1155.result === true ? 'ERC-1155' : null,
    royalty.result === true ? 'ERC-2981' : null,
  ].filter(Boolean)

  const rate =
    royalty.result === true && quote.status === 'success'
      ? (quote.result as readonly [string, bigint])
      : null

  return (
    <Card className="mb-8 max-w-[76ch] space-y-2 p-6 text-sm">
      <div className="font-semibold">What the contract says it is</div>
      <p className="leading-relaxed text-muted-foreground">
        {standards.length
          ? `supportsInterface answers true for ${standards.join(', ')}.`
          : 'The contract answers supportsInterface for none of ERC-721, ERC-1155 or ERC-2981.'}{' '}
        {supply.status === 'success'
          ? `totalSupply is ${(supply.result as bigint).toLocaleString()}.`
          : 'totalSupply does not answer.'}
      </p>
      {rate ? (
        <p className="leading-relaxed text-muted-foreground">
          royaltyInfo quotes {rateLabel(rate[1])} of a sale to{' '}
          <code className="font-mono text-xs">{rate[0]}</code>. That is what the contract would
          enforce on a marketplace that honours it; none is deployed on Lux, so nothing enforces it
          today.
        </p>
      ) : null}
    </Card>
  )
}

function Items({
  chain,
  address,
  name,
  supply,
}: {
  chain: Chain
  address: string
  name: string | null
  supply: string | null
}) {
  const transfers = useTransfers(chain, address)
  const ids = useTransferIds(chain, transfers.data)

  const found = useMemo(() => {
    if (!ids.data || !transfers.data) return []
    const seen = new Set<string>()
    for (const t of transfers.data) {
      const id = idFor(ids.data, t)
      if (id !== undefined) seen.add(id)
    }
    return [...seen].sort((a, b) => Number(BigInt(a) - BigInt(b)))
  }, [ids.data, transfers.data])

  if (transfers.isLoading || ids.isLoading)
    return <Card className="p-6 text-sm text-muted-foreground">Reading transfers…</Card>

  if (!found.length)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        No item id could be read. The indexer never populates its per-item resource for any
        collection, so ids come back from the chain&rsquo;s own Transfer logs, and that read either
        found nothing in range or the chain has no browser-reachable node.
      </Card>
    )

  const whole = supply !== null && found.length >= Number(supply)

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {found.map((id) => (
          <ItemCard key={id} chain={chain} address={address} id={id} collection={name} />
        ))}
      </div>
      {!whole ? (
        <p className="mt-4 max-w-[76ch] text-[13px] leading-relaxed text-muted-foreground">
          {found.length} of {supply ?? 'an unreported number of'} items. The indexer serves one page
          of transfers and holds no per-item record, so this is what could be read back from the
          logs, not the whole collection.
        </p>
      ) : null}
    </>
  )
}

function Holders({ chain, address }: { chain: Chain; address: string }) {
  const { data, isLoading } = useHolders(chain, address)
  if (isLoading) return <Card className="p-6 text-sm text-muted-foreground">Reading holders…</Card>
  if (!data?.length)
    return <Card className="p-6 text-sm text-muted-foreground">The indexer reports no holders.</Card>

  return (
    <Card className="divide-y divide-border">
      {data.map((h, i) => {
        const href = addressUrl(chain, h.address)
        return (
          <div key={`${h.address}-${i}`} className="flex items-center gap-3 px-4 py-3 text-[13px]">
            <span className="w-6 text-center font-mono text-muted-foreground">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate font-mono">
              {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline hover:underline">
                  {h.address}
                </a>
              ) : (
                h.address
              )}
            </span>
            <span className="font-mono">{h.count}</span>
          </div>
        )
      })}
    </Card>
  )
}

function Body({ state, slug, address }: { state: Ready; slug: string; address: string }) {
  const chain = state.chains.find((c) => c.slug === slug)
  const { select } = state

  // The URL names the chain, so the selector follows it rather than contradicting it.
  useEffect(() => {
    if (chain) select(chain.slug)
  }, [chain, select])

  const token = useCollection(chain ?? state.chain, address)
  const counters = useCounters(chain ?? state.chain, address)

  if (!chain)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        The registry serves no chain called <code className="font-mono text-xs">{slug}</code>. It
        currently serves {state.chains.map((c) => c.slug).join(', ')}.
      </Card>
    )

  if (token.isLoading)
    return <Card className="p-6 text-sm text-muted-foreground">Reading {address} on {chain.name}…</Card>

  if (token.isError || !token.data)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        The indexer does not record a token at <code className="font-mono text-xs">{address}</code>{' '}
        on {chain.name}.
      </Card>
    )

  const href = addressUrl(chain, address)

  return (
    <>
      <Source>Read live from {chain.name}.</Source>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl font-bold text-muted-foreground">
          {token.data.symbol?.charAt(0) ?? '?'}
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold">{token.data.name ?? shortenAddress(address)}</div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{token.data.symbol}</span>
            <span>{token.data.type}</span>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 no-underline hover:text-foreground"
              >
                <span className="font-mono">{shortenAddress(address, 6)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="font-mono">{shortenAddress(address, 6)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <Stat label="Items" value={token.data.supply} />
        <Stat label="Holders" value={token.data.holders} />
        <Stat
          label="Transfers"
          value={counters.data ? counters.data.transfers.toLocaleString() : null}
        />
      </div>

      <Declares chain={chain} address={address} />

      <h2 className="mb-4 text-xl font-semibold">Items</h2>
      <div className="mb-10">
        <Items
          chain={chain}
          address={address}
          name={token.data.name}
          supply={token.data.supply}
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold">Holders</h2>
      <Holders chain={chain} address={address} />
    </>
  )
}

function FromQuery({ state }: { state: Ready }) {
  const params = useSearchParams()
  const slug = params.get('chain')
  const address = params.get('address')?.toLowerCase()

  if (!slug || !address)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        This page needs a chain and a contract address. Reach it from{' '}
        <a href="/collections" className="text-foreground hover:underline">
          collections
        </a>
        .
      </Card>
    )

  return <Body state={state} slug={slug} address={address} />
}

export default function CollectionPage() {
  return (
    <Page
      title="Collection"
      intro="Everything the indexer and the contract will say about one collection: what it declares itself to be, how many items exist, who holds them, and the ids that could be read back from its Transfer logs."
    >
      {(state) => (
        <Suspense fallback={null}>
          <FromQuery state={state} />
        </Suspense>
      )}
    </Page>
  )
}

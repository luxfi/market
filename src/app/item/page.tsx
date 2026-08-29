'use client'

import { ExternalLink } from '@luxfi/ui/icons'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { GenesisMeta } from '@/components/Genesis'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Card } from '@/components/ui/card'
import type { ChainState } from '@/hooks/chain'
import { useCollection, useTransferIds, useTransfers } from '@/hooks/queries'
import { ERC165_ABI, ERC2981_ABI, ERC721_ABI, GENESIS, INTERFACE, ONE, rateLabel } from '@/lib/contracts'
import * as links from '@/lib/links'
import { idFor } from '@/lib/logs'
import { addressUrl, txUrl, type Chain } from '@/lib/registry'
import { shortenAddress } from '@/lib/utils'

// A MARKETPLACE WITH NO ROUTE FOR A SINGLE ITEM. THIS IS THAT ROUTE.
//
// Nothing about one token exists on the read path: /tokens/{addr}/instances is
// empty on every collection the indexer holds, and /instances/{id} is not a
// registered route at all. So everything here comes from the chain — ownerOf
// and tokenURI on the contract, and the item's own Transfer logs — and the page
// says which of those answered.

type Ready = Extract<ChainState, { status: 'ready' }>

type Metadata = { name?: string; description?: string; image?: string; image_url?: string }

/** ipfs:// and ar:// are addresses, not URLs. A gateway makes them fetchable. */
function resolve(uri: string): string {
  if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.slice(7)}`
  if (uri.startsWith('ar://')) return `https://arweave.net/${uri.slice(5)}`
  return uri
}

function Metadata({ uri }: { uri: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['metadata', uri],
    queryFn: async (): Promise<Metadata> => {
      const res = await fetch(resolve(uri))
      if (!res.ok) throw new Error(`${res.status}`)
      return (await res.json()) as Metadata
    },
    retry: false,
  })

  if (isLoading) return <p className="text-sm text-muted-foreground">Fetching the token URI…</p>

  if (isError)
    return (
      <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        The token URI does not resolve: <code className="font-mono text-xs">{error.message}</code>.
        The indexer keeps no per-item record for any collection, so there is no image to fall back
        on.
      </p>
    )

  const image = data?.image ?? data?.image_url
  return (
    <div className="space-y-3">
      {data?.name ? <div className="text-lg font-semibold">{data.name}</div> : null}
      {data?.description ? (
        <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
          {data.description}
        </p>
      ) : null}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolve(image)}
          alt={data?.name ?? 'item'}
          className="max-w-[420px] rounded-xl border border-border"
        />
      ) : (
        <p className="text-sm text-muted-foreground">The token URI names no image.</p>
      )}
    </div>
  )
}

function History({ chain, address, id }: { chain: Chain; address: string; id: string }) {
  const transfers = useTransfers(chain, address)
  const ids = useTransferIds(chain, transfers.data)

  const mine = useMemo(() => {
    if (!transfers.data || !ids.data) return []
    return transfers.data.filter((t) => idFor(ids.data, t) === id)
  }, [transfers.data, ids.data, id])

  if (transfers.isLoading || ids.isLoading)
    return <p className="text-sm text-muted-foreground">Reading transfers…</p>

  if (!mine.length)
    return (
      <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        No transfer of this item appears in the page of transfers the indexer serves for the
        collection.
      </p>
    )

  return (
    <Card className="divide-y divide-border">
      {mine.map((t) => {
        const href = txUrl(chain, t.tx)
        return (
          <div key={`${t.block}:${t.logIndex}`} className="flex items-center gap-3 px-4 py-3 text-[13px]">
            <span className="w-20 shrink-0 font-semibold">
              {t.from === '0x0000000000000000000000000000000000000000' ? 'Mint' : 'Transfer'}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
              {shortenAddress(t.from)} → {shortenAddress(t.to)}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {t.time ? new Date(t.time).toLocaleDateString() : 'no timestamp'}
            </span>
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        )
      })}
    </Card>
  )
}

function Body({ state, slug, address, id }: { state: Ready; slug: string; address: string; id: string }) {
  const chain = state.chains.find((c) => c.slug === slug)
  const token = useCollection(chain ?? state.chain, address)

  const contract = { chainId: chain?.id ?? 0, address: address as `0x${string}` }
  const { data: onChain } = useReadContracts({
    allowFailure: true,
    contracts: [
      { ...contract, abi: ERC721_ABI, functionName: 'ownerOf', args: [BigInt(id)] },
      { ...contract, abi: ERC721_ABI, functionName: 'tokenURI', args: [BigInt(id)] },
      { ...contract, abi: ERC165_ABI, functionName: 'supportsInterface', args: [INTERFACE.royalty] },
      { ...contract, abi: ERC2981_ABI, functionName: 'royaltyInfo', args: [BigInt(id), ONE] },
    ],
    query: { enabled: Boolean(chain?.rpc) },
  })

  if (!chain)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        The registry serves no chain called <code className="font-mono text-xs">{slug}</code>.
      </Card>
    )

  const [owner, uri, royalty, quote] = onChain ?? []
  const rate =
    royalty?.result === true && quote?.status === 'success'
      ? (quote.result as readonly [string, bigint])
      : null

  return (
    <>
      <Source>Read live from {chain.name}.</Source>

      <div className="mb-8">
        <div className="text-sm text-muted-foreground">
          <Link href={links.collection(chain, address)} className="no-underline hover:underline">
            {token.data?.name ?? shortenAddress(address)}
          </Link>
        </div>
        <div className="font-mono text-3xl font-bold">#{id}</div>
      </div>

      <Card className="mb-8 max-w-[76ch] space-y-3 p-6 text-sm">
        <div>
          <span className="text-muted-foreground">Owner </span>
          {owner?.status === 'success' ? (
            addressUrl(chain, owner.result as string) ? (
              <a
                href={addressUrl(chain, owner.result as string)!}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono no-underline hover:underline"
              >
                {owner.result as string}
              </a>
            ) : (
              <span className="font-mono">{owner.result as string}</span>
            )
          ) : (
            <span className="text-muted-foreground">ownerOf does not answer for this id.</span>
          )}
        </div>
        <div className="break-all">
          <span className="text-muted-foreground">Token URI </span>
          {uri?.status === 'success' ? (
            <span className="font-mono text-xs">{uri.result as string}</span>
          ) : (
            <span className="text-muted-foreground">tokenURI does not answer.</span>
          )}
        </div>
        {rate ? (
          <div>
            <span className="text-muted-foreground">Royalty </span>
            {rateLabel(rate[1])} to{' '}
            <span className="font-mono text-xs">{rate[0]}</span>, declared through ERC-2981.
          </div>
        ) : null}
      </Card>

      <h2 className="mb-4 text-xl font-semibold">Metadata</h2>
      <div className="mb-10 space-y-4">
        {/* One collection on Lux keeps a record per token in its own storage. */}
        {GENESIS[chain.id] === address ? (
          <GenesisMeta chain={chain} address={address} id={id} />
        ) : null}
        {uri?.status === 'success' ? (
          <Metadata uri={uri.result as string} />
        ) : (
          <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
            The contract does not answer tokenURI for this id, and the indexer holds no per-item
            record for any collection.
          </p>
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold">History</h2>
      <History chain={chain} address={address} id={id} />
    </>
  )
}

/**
 * A token id is a uint256 and the query string is whatever someone typed. The
 * id reaches `BigInt` in the contract calls below, which throws during render
 * on anything else — `?id=abc` took the whole page down to a blank screen with
 * a client-side exception. Checked here, once, before it is used.
 */
const isId = (v: string) => /^\d+$/.test(v)

function FromQuery({ state }: { state: Ready }) {
  const params = useSearchParams()
  const slug = params.get('chain')
  const address = params.get('address')?.toLowerCase()
  const id = params.get('id')

  if (id !== null && !isId(id))
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        <code className="font-mono text-xs">{id}</code> is not a token id. An id is a whole number,
        and no collection on Lux has one that is not.
      </Card>
    )

  if (!slug || !address || id === null)
    return (
      <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
        This page needs a chain, a contract address and a token id. Reach it from a collection or
        from <Link href="/portfolio" className="text-foreground hover:underline">holdings</Link>.
      </Card>
    )

  return <Body state={state} slug={slug} address={address} id={id} />
}

export default function ItemPage() {
  return (
    <Page title="Item" intro="One token: its owner, what its contract publishes about it, and every transfer of it that could be read.">
      {(state) => (
        <Suspense fallback={null}>
          <FromQuery state={state} />
        </Suspense>
      )}
    </Page>
  )
}

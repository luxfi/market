'use client'

import { ExternalLink } from '@luxfi/ui/icons'
import Link from 'next/link'
import { formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { GenesisMeta } from '@/components/Genesis'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Stat } from '@/components/Stat'
import { Card } from '@/components/ui/card'
import {
  ERC2981_ABI,
  GENESIS,
  GENESIS_ABI,
  GENESIS_TOKEN_ABI,
  ONE,
  rateLabel,
} from '@/lib/contracts'
import * as links from '@/lib/links'
import { addressUrl, type Chain } from '@/lib/registry'

// THE PAGE WAS PROBING A CONTRACT THAT DOES NOT EXIST.
//
// It read 0x004287c4..76c6, which returns 0x from eth_getCode, and reported —
// correctly, and to its credit — that supply and bonded LUX were unavailable.
// The collection is alive at 0x9e04fc57..; the indexer's own search finds it.
// Repointed, every figure on this page is a live read: three tokens, three
// billion LUX bonded, a 2.5% royalty declared through ERC-2981, and a
// marketplace address of zero, which is the collection saying that nothing is
// wired to sell it.

function Collection({ chain, address }: { chain: Chain; address: `0x${string}` }) {
  const contract = { chainId: chain.id, address }
  const { data, isLoading } = useReadContracts({
    allowFailure: true,
    contracts: [
      { ...contract, abi: GENESIS_ABI, functionName: 'totalMinted' },
      { ...contract, abi: GENESIS_ABI, functionName: 'totalLuxLocked' },
      { ...contract, abi: GENESIS_ABI, functionName: 'owner' },
      { ...contract, abi: GENESIS_TOKEN_ABI, functionName: 'market' },
      { ...contract, abi: ERC2981_ABI, functionName: 'royaltyInfo', args: [0n, ONE] },
    ],
    query: { enabled: Boolean(chain.rpc) },
  })

  if (isLoading || !data)
    return <Card className="p-6 text-sm text-muted-foreground">Reading the collection on {chain.name}…</Card>

  const [minted, locked, owner, market, quote] = data
  const count = minted.status === 'success' ? Number(minted.result as bigint) : null
  const rate =
    quote.status === 'success' ? (quote.result as readonly [string, bigint]) : null
  const marketSet =
    market.status === 'success' && (market.result as string) !== '0x0000000000000000000000000000000000000000'

  const href = addressUrl(chain, address)

  return (
    <>
      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <Stat label="Minted" value={count === null ? null : count.toLocaleString()} />
        <Stat
          label={`${chain.coin} bonded`}
          value={
            locked.status === 'success'
              ? Number(formatUnits(locked.result as bigint, 18)).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })
              : null
          }
          note="permanent"
        />
        <Stat
          label="Royalty"
          value={rate ? rateLabel(rate[1]) : null}
          note="declared through ERC-2981"
        />
        <Stat
          label="Marketplace"
          value={market.status !== 'success' ? null : marketSet ? 'set' : 'none'}
          note={marketSet ? (market.result as string) : 'the contract routes no sale'}
        />
      </div>

      <Card className="mb-10 max-w-[76ch] space-y-3 p-6 text-sm leading-relaxed">
        <p className="text-muted-foreground">
          Each token bonds {chain.coin} to itself permanently — GenesisNFTs.sol adds the amount to{' '}
          <code className="font-mono text-xs">totalLuxLocked</code> at mint and has no path that
          takes it back out. The tier decides how much: 1B for Genesis, 100M for Validator, 10M for
          Mini, 1M for Nano, and each token below reports its own.
        </p>
        <p className="text-muted-foreground">
          The collection declares a {rate ? rateLabel(rate[1]) : ''} royalty through ERC-2981, which a marketplace has to read and honour. There is no
          marketplace contract on any Lux chain to read it, and this collection&rsquo;s own{' '}
          <code className="font-mono text-xs">market</code> address is zero.
        </p>
        {owner.status === 'success' ? (
          <p className="text-muted-foreground">
            Owned by <code className="font-mono text-xs">{owner.result as string}</code>.
          </p>
        ) : null}
        <div className="flex gap-4 pt-1">
          <Link
            href={links.collection(chain, address)}
            className="text-foreground no-underline hover:underline"
          >
            Holders and transfers
          </Link>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground no-underline hover:underline"
            >
              Contract <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </Card>

      <h2 className="mb-4 text-xl font-semibold">The tokens</h2>
      {count === null ? (
        <Card className="p-6 text-sm text-muted-foreground">
          <code className="font-mono text-xs">totalMinted</code> does not answer, so there is no
          list of tokens to draw.
        </Card>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
          {Array.from({ length: Math.min(count, 24) }, (_, id) => (
            <Link
              key={id}
              href={links.item(chain, address, String(id))}
              className="text-inherit no-underline"
            >
              <GenesisMeta chain={chain} address={address} id={String(id)} />
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

export default function GenesisPage() {
  return (
    <Page
      title="Genesis"
      intro="A Genesis NFT bonds LUX to itself permanently. Everything below is read from the collection contract on each page load; nothing is printed that a call did not return."
    >
      {({ chain }) => {
        const address = GENESIS[chain.id]
        if (!address)
          return (
            <Card className="max-w-[76ch] p-6 text-sm leading-relaxed text-muted-foreground">
              Genesis is a Lux Network collection. No Genesis contract is registered for{' '}
              {chain.name}, and none is deployed there.
            </Card>
          )
        return (
          <>
            <Source>Read live from {chain.name}.</Source>
            <Collection chain={chain} address={address} />
          </>
        )
      }}
    </Page>
  )
}

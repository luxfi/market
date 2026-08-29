'use client'

import { Wallet } from '@luxfi/ui/icons'
import { formatUnits } from 'viem'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ItemCard } from '@/components/ItemCard'
import { Page } from '@/components/Page'
import { Source } from '@/components/Source'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useHoldings } from '@/hooks/queries'
import { isNft } from '@/lib/explorer'
import { addressUrl, type Chain } from '@/lib/registry'

// /addresses/{hash}/tokens is the ONE indexer route that names an item: every
// row carries its token id. Holdings therefore work where a collection's own
// item list does not, and this page needs no log read to say which token is
// held. Fungible balances arrive on the same route, so they sit beside them
// rather than on a page of their own.
//
// Every wallet hook lives below the registry gate, because wagmi's config IS
// the registry's chain list — reading one above the gate asks for a provider
// that has not mounted yet.

function Amount({ value, decimals }: { value: string; decimals: string | null }) {
  if (decimals === null) return <>{value}</>
  return <>{Number(formatUnits(BigInt(value), Number(decimals))).toLocaleString()}</>
}

function OnChain({ chain, wallet }: { chain: Chain; wallet: string }) {
  const { data, isLoading, isError } = useHoldings(chain, wallet)
  if (isLoading || isError || !data?.length) return null

  const items = data.filter((h) => isNft(h.token.type) && h.id !== null)
  const tokens = data.filter((h) => !isNft(h.token.type))

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-base font-semibold">{chain.name}</h2>

      {items.length > 0 && (
        <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {items.map((h) => (
            <ItemCard
              key={`${h.token.address}-${h.id}`}
              chain={chain}
              address={h.token.address}
              id={h.id!}
              collection={h.token.name}
            />
          ))}
        </div>
      )}

      {tokens.length > 0 && (
        <Card className="divide-y divide-border">
          {tokens.map((h) => (
            <div key={h.token.address} className="flex items-center gap-3 px-4 py-3 text-[13px]">
              <div className="min-w-0 flex-1 truncate">
                {h.token.name ?? h.token.address}{' '}
                <span className="font-mono text-xs text-muted-foreground">{h.token.symbol}</span>
              </div>
              <div className="font-mono">
                <Amount value={h.value} decimals={h.token.decimals} />
              </div>
            </div>
          ))}
        </Card>
      )}
    </section>
  )
}

function Connect() {
  const { connect } = useConnect()
  return (
    <Card className="px-6 py-16 text-center">
      <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-xl font-semibold">Connect a wallet</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        The address is read, never asked to sign. Nothing on this surface broadcasts.
      </p>
      <Button variant="connect" size="lg" onClick={() => connect({ connector: injected() })}>
        <Wallet className="h-4 w-4" />
        Connect
      </Button>
    </Card>
  )
}

function Held({ chain, chains }: { chain: Chain; chains: Chain[] }) {
  const { address, isConnected } = useAccount()
  if (!isConnected || !address) return <Connect />

  const href = addressUrl(chain, address)
  return (
    <>
      <Source>
        Read live from every chain in the registry: {chains.map((c) => c.name).join(', ')}.
      </Source>
      <Card className="mb-6 flex items-center gap-2 px-4 py-3 text-[13px]">
        <span className="text-muted-foreground">Wallet</span>
        <span className="font-mono">{address}</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-muted-foreground no-underline hover:text-foreground"
          >
            Open on {chain.name}
          </a>
        ) : null}
      </Card>
      {chains.map((c) => (
        <OnChain key={c.slug} chain={c} wallet={address} />
      ))}
    </>
  )
}

export default function PortfolioPage() {
  return (
    <Page
      title="Holdings"
      intro="What the connected wallet holds on every chain the registry serves — items by token id, and fungible balances beside them."
    >
      {({ chain, chains }) => <Held chain={chain} chains={chains} />}
    </Page>
  )
}

'use client'

import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { NFTCard } from '@/components/NFTCard'
import { useChainContext } from '@/hooks/useChain'
import { usePortfolioNFTs } from '@/hooks/useNFTData'
import { CHAIN_INFO } from '@/lib/chains'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

const ALL_CHAIN_IDS = [96369, 200200, 36963, 36911, 494949]

function ChainPortfolio({ chainId, walletAddress }: { chainId: number; walletAddress: string }) {
  const { data, isLoading } = usePortfolioNFTs(chainId, walletAddress)
  const chainInfo = CHAIN_INFO[chainId]

  if (isLoading) return <div className="text-muted-foreground py-3">Loading {chainInfo?.name}...</div>
  if (!data?.items?.length) return null

  return (
    <section className="mb-8">
      <h3 className="text-base font-semibold mb-3" style={{ color: chainInfo?.color }}>
        {chainInfo?.name} ({data.items.length})
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
        {data.items.map((item) => (
          <NFTCard
            key={`${item.token.address}-${item.token_id}`}
            contractAddress={item.token.address}
            tokenId={item.token_id ?? '0'}
            collectionName={item.token.name}
            chainId={chainId}
            instance={item.token_instance ?? undefined}
          />
        ))}
      </div>
    </section>
  )
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()

  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">My NFTs</h1>

        {!isConnected ? (
          <Card className="text-center py-16 px-6">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Connect your wallet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Connect a wallet to view your NFTs across all Lux chains.
            </p>
            <Button
              variant="connect"
              size="lg"
              onClick={() => connect({ connector: injected() })}
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </Card>
        ) : (
          <div>
            <Card className="flex items-center gap-2 mb-6 px-4 py-3 text-[13px]">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">{address}</span>
            </Card>

            {/* NFTs grouped by chain */}
            {ALL_CHAIN_IDS.map((cId) => (
              <ChainPortfolio key={cId} chainId={cId} walletAddress={address!} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

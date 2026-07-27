'use client'

import { formatUnits } from 'viem'
import { useReadContracts } from 'wagmi'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { useChainContext } from '@/hooks/useChain'
import { CHAIN_INFO, explorerUrl } from '@/lib/chains'
import { GENESIS_ABI, GENESIS_NFT } from '@/lib/contracts'

/** One tile. `value` is always a measurement; there is no default to fall back on. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="text-[13px] text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold font-mono">{value}</div>
    </Card>
  )
}

export default function GenesisPage() {
  const { chainId } = useChainContext()
  const chain = CHAIN_INFO[chainId]
  const address = GENESIS_NFT[chainId]

  const { data, isLoading, isError } = useReadContracts({
    allowFailure: false,
    contracts: [
      { chainId, address, abi: GENESIS_ABI, functionName: 'totalMinted' },
      { chainId, address, abi: GENESIS_ABI, functionName: 'totalLuxLocked' },
    ],
    query: { enabled: Boolean(address) },
  })

  const [minted, luxLocked] = data ?? []

  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <section className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Genesis NFTs</h1>
          <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
            Each Genesis NFT bonds LUX permanently and routes the validator staking rewards on that
            bond to whoever holds the NFT. Both figures below are read from the collection contract
            on every page load.
          </p>
        </section>

        {!address ? (
          <Card className="p-6 text-center text-muted-foreground">
            Genesis NFTs are a Lux Network collection. No Genesis contract is registered for{' '}
            {chain?.name ?? `chain ${chainId}`}.
          </Card>
        ) : isLoading ? (
          <Card className="p-6 text-center text-muted-foreground">
            Reading the Genesis contract on {chain?.name ?? `chain ${chainId}`}…
          </Card>
        ) : isError || data === undefined ? (
          <Card className="p-6 space-y-3">
            <div className="font-semibold">Supply and bonded LUX are unavailable.</div>
            <p className="text-sm text-muted-foreground">
              The Genesis collection is registered at{' '}
              <code className="font-mono text-xs">{address}</code> on{' '}
              {chain?.name ?? `chain ${chainId}`}, but the contract does not answer:{' '}
              <code className="font-mono text-xs">eth_getCode</code> returns{' '}
              <code className="font-mono text-xs">0x</code> and every view call reverts, so there is
              no minted count and no bonded balance to show. Nothing is reported here until the
              contract answers again.
            </p>
            <a
              className="inline-flex items-center gap-1.5 text-sm hover:underline"
              href={`${explorerUrl(chainId)}/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              Inspect the address <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Card>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
            <Stat label="Minted" value={minted!.toLocaleString()} />
            <Stat
              label="LUX bonded (permanent)"
              value={Number(formatUnits(luxLocked!, 18)).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            />
          </div>
        )}

        <Card className="p-6 mt-10 text-center">
          <h3 className="text-base font-semibold mb-4">How rewards reach a holder</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
            <span>Validator staking</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs">ValidatorVault.depositRewards()</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs">LiquidLUX.depositValidatorRewards()</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">xLUX holders</span>
          </div>
          <p className="text-[13px] text-muted-foreground mt-4">
            The call path above is the design in{' '}
            <code className="font-mono text-xs">standard/contracts/nft/GenesisNFTs.sol</code>. It is
            not a claim about rewards paid — no reward figure appears on this page unless it was
            read from chain.
          </p>
        </Card>
      </main>
    </div>
  )
}

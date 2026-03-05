'use client'

import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

const GENESIS_TIERS = [
  {
    name: 'Genesis',
    lockedLux: '1,000,000,000',
    description:
      'The pinnacle of the Lux Genesis Collection. Each Genesis NFT permanently locks 1 billion LUX, with all staking rewards flowing directly to the holder.',
    maxSupply: 10,
    rewardMultiplier: '10x',
  },
  {
    name: 'Validator',
    lockedLux: '100,000,000',
    description:
      'Validator-tier Genesis NFTs lock 100M LUX permanently. Holders receive validator staking rewards through the ValidatorVault and LiquidLUX (xLUX) system.',
    maxSupply: 100,
    rewardMultiplier: '5x',
  },
  {
    name: 'Mini',
    lockedLux: '10,000,000',
    description:
      'Mini Genesis NFTs lock 10M LUX permanently. A more accessible entry point to Genesis rewards with proportional staking returns.',
    maxSupply: 1000,
    rewardMultiplier: '2x',
  },
  {
    name: 'Nano',
    lockedLux: '1,000,000',
    description:
      'Nano Genesis NFTs lock 1M LUX permanently. The most accessible Genesis tier, providing base-level staking rewards to holders.',
    maxSupply: 10000,
    rewardMultiplier: '1x',
  },
]

export default function GenesisPage() {
  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Genesis NFTs</h1>
          <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
            Permanently locked LUX tokens with staking rewards flowing to NFT holders. Genesis NFTs control validator
            staking returns through the ValidatorVault and LiquidLUX (xLUX) system.
          </p>
        </section>

        {/* Reward flow diagram */}
        <Card className="p-6 mb-12 text-center">
          <h3 className="text-base font-semibold mb-4">Reward Flow</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
            <span>Validator Staking</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span>ValidatorVault.depositRewards()</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span>LiquidLUX.depositValidatorRewards()</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">xLUX holders</span>
          </div>
        </Card>

        {/* Tier grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {GENESIS_TIERS.map((tier) => (
            <Card key={tier.name} className="overflow-hidden">
              <div className="aspect-[4/3] bg-gradient-to-br from-secondary to-muted flex flex-col items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-[2px]">
                  Genesis
                </span>
                <span className="text-4xl font-bold">{tier.name}</span>
                <span className="text-sm text-primary">{tier.rewardMultiplier} rewards</span>
              </div>
              <div className="p-5">
                <div className="text-[13px] text-muted-foreground mb-1">Permanently Locked</div>
                <div className="text-2xl font-bold mb-3 font-mono">{tier.lockedLux} LUX</div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                  {tier.description}
                </p>
                <div className="flex justify-between text-[13px] text-muted-foreground border-t border-border pt-3">
                  <span>Max Supply: {tier.maxSupply.toLocaleString()}</span>
                  <span>Rewards: {tier.rewardMultiplier}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

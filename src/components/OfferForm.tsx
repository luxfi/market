'use client'

import { useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useWriteContract, useChainId } from 'wagmi'
import { CONTRACTS, MARKET_ABI, WRAPPED_NATIVE } from '@/lib/contracts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface OfferFormProps {
  contractAddress: Address
  tokenId: string
}

export function OfferForm({ contractAddress, tokenId }: OfferFormProps) {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('3')
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()

  const market = CONTRACTS[chainId]?.market
  const paymentToken = WRAPPED_NATIVE[chainId]
  // makeOffer reverts on address(0) — an offer needs an LRC20 to escrow against.
  if (!market || !paymentToken) return null

  const handleOffer = () => {
    if (!amount) return
    const durationSeconds = BigInt(Number(duration) * 86400)

    writeContract({
      address: market,
      abi: MARKET_ABI,
      functionName: 'makeOffer',
      args: [contractAddress, BigInt(tokenId), paymentToken, parseEther(amount), durationSeconds],
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold">Make an Offer</h3>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Offer Amount (WLUX)
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="h-10 text-base bg-card"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Expires in</label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full h-10 px-3 bg-card border border-input rounded-md text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="1">1 day</option>
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
        </select>
      </div>
      <Button
        className="w-full"
        onClick={handleOffer}
        disabled={isPending || !amount}
      >
        {isPending ? 'Submitting...' : 'Make Offer'}
      </Button>
    </div>
  )
}

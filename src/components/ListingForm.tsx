'use client'

import { useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useWriteContract, useAccount, useChainId } from 'wagmi'
import { CONTRACTS, MARKET_ABI, ERC721_ABI } from '@/lib/contracts'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ListingFormProps {
  contractAddress: Address
  tokenId: string
}

export function ListingForm({ contractAddress, tokenId }: ListingFormProps) {
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('7') // days
  const chainId = useChainId()
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()

  const contracts = CONTRACTS[chainId]
  if (!contracts) return null

  const handleApproveAndList = async () => {
    if (!address || !price) return

    // First approve the Market contract
    writeContract({
      address: contractAddress,
      abi: ERC721_ABI,
      functionName: 'approve',
      args: [contracts.markets, BigInt(tokenId)],
    })
  }

  const handleList = () => {
    if (!price) return
    const durationSeconds = BigInt(Number(duration) * 86400)

    writeContract({
      address: contracts.markets,
      abi: MARKET_ABI,
      functionName: 'list',
      args: [
        contractAddress,
        BigInt(tokenId),
        '0x0000000000000000000000000000000000000000' as Address, // native LUX
        parseEther(price),
        durationSeconds,
      ],
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold">List for Sale</h3>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Price (LUX)</label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.0"
          className="h-10 text-base bg-card"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Duration (days)
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full h-10 px-3 bg-card border border-input rounded-md text-foreground text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="1">1 day</option>
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleApproveAndList}
          disabled={isPending || !price}
        >
          Approve
        </Button>
        <Button
          className="flex-1"
          onClick={handleList}
          disabled={isPending || !price}
        >
          {isPending ? 'Listing...' : 'List NFT'}
        </Button>
      </div>
    </div>
  )
}

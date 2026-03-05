'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatEther } from 'viem'
import { getNftImageUrl, type ExplorerTokenInstance } from '@/lib/explorer'
import { CHAIN_INFO } from '@/lib/chains'
import { Card } from '@/components/ui/card'

export interface NFTCardProps {
  contractAddress: string
  tokenId: string
  name?: string
  imageUrl?: string
  collectionName?: string
  price?: bigint
  chainId: number
  instance?: ExplorerTokenInstance
}

export function NFTCard({ contractAddress, tokenId, name, imageUrl, collectionName, price, chainId, instance }: NFTCardProps) {
  const resolvedImage = instance ? getNftImageUrl(instance) : imageUrl
  const resolvedName = instance?.metadata?.name ?? name
  const resolvedCollection = instance?.token?.name ?? collectionName
  const chainInfo = CHAIN_INFO[chainId]

  return (
    <Link
      href={`/nft/${chainId}/${contractAddress}/${tokenId}`}
      className="no-underline text-inherit group"
    >
      <Card className="overflow-hidden transition-all duration-200 hover:border-muted-foreground/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        <div className="aspect-square relative bg-secondary">
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={resolvedName ?? `#${tokenId}`}
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted text-4xl font-bold text-muted-foreground/30">
              #{tokenId}
            </div>
          )}
          {/* Chain badge */}
          {chainInfo && (
            <div
              className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-semibold"
              style={{ color: chainInfo.color }}
            >
              {chainInfo.name}
            </div>
          )}
        </div>
        <div className="px-3 py-2.5">
          {resolvedCollection && (
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider truncate">
              {resolvedCollection}
            </div>
          )}
          <div className="text-sm font-semibold mt-0.5 truncate">
            {resolvedName ?? `#${tokenId}`}
          </div>
          {price !== undefined && price > 0n && (
            <div className="text-[13px] text-primary mt-1.5 font-medium font-mono">
              {formatEther(price)} {chainInfo?.symbol ?? 'LUX'}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

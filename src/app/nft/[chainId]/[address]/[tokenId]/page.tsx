'use client'

import { use } from 'react'
import { useAccount } from 'wagmi'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { ListingForm } from '@/components/ListingForm'
import { OfferForm } from '@/components/OfferForm'
import { ActivityRow } from '@/components/ActivityRow'
import { useTokenInstance, useTokenInstanceTransfers } from '@/hooks/useNFTData'
import { getNftImageUrl, resolveMediaUrl } from '@/lib/explorer'
import { CHAIN_INFO, EXPLORER_API } from '@/lib/chains'
import { shortenAddress } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import type { Address } from 'viem'

export default function NFTDetailPage({
  params,
}: {
  params: Promise<{ chainId: string; address: string; tokenId: string }>
}) {
  const { chainId: chainIdStr, address: contractAddress, tokenId } = use(params)
  const chainId = Number(chainIdStr)
  const { address: userAddress } = useAccount()
  const chainInfo = CHAIN_INFO[chainId]
  const explorerBase = EXPLORER_API[chainId]?.replace('/api/v2', '') ?? 'https://explore.lux.network'

  const { data: instance, isLoading } = useTokenInstance(chainId, contractAddress, tokenId)
  const { data: transfers } = useTokenInstanceTransfers(chainId, contractAddress, tokenId)

  const imageUrl = instance ? getNftImageUrl(instance) : null
  const animationUrl = instance ? resolveMediaUrl(instance.animation_url ?? instance.metadata?.animation_url) : null
  const ownerAddress = instance?.owner?.hash
  const isOwner = userAddress && ownerAddress && userAddress.toLowerCase() === ownerAddress.toLowerCase()
  const metadata = instance?.metadata

  return (
    <div>
      <Header />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading NFT...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Left: Media */}
            <div>
              <div className="aspect-square rounded-2xl border border-border overflow-hidden max-w-[600px] relative bg-secondary">
                {animationUrl ? (
                  <video
                    src={animationUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={metadata?.name ?? `#${tokenId}`}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="600px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted text-5xl font-bold text-muted-foreground/30">
                    #{tokenId}
                  </div>
                )}
              </div>

              {/* Description */}
              {metadata?.description && (
                <Card className="mt-4 p-4">
                  <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-widest">
                    Description
                  </div>
                  <div className="text-sm text-foreground leading-relaxed">
                    {metadata.description}
                  </div>
                </Card>
              )}

              {/* Traits */}
              {metadata?.attributes && metadata.attributes.length > 0 && (
                <Card className="mt-4 p-4">
                  <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-widest">
                    Traits
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                    {metadata.attributes.map((trait, i) => (
                      <div
                        key={`${trait.trait_type}-${i}`}
                        className="bg-primary/5 rounded-lg px-3 py-2 border border-border"
                      >
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {trait.trait_type}
                        </div>
                        <div className="text-[13px] font-semibold mt-0.5">
                          {String(trait.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Transfer History */}
              {transfers?.items && transfers.items.length > 0 && (
                <Card className="mt-4 p-4">
                  <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-widest">
                    Transfer History
                  </div>
                  {transfers.items.slice(0, 20).map((t, i) => (
                    <ActivityRow key={`${t.tx_hash}-${i}`} transfer={t} chainId={chainId} />
                  ))}
                </Card>
              )}
            </div>

            {/* Right: Details + Actions */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-20">
              {/* Collection & Name */}
              <div>
                <Link
                  href={`/collection/${chainId}/${contractAddress}`}
                  className="text-[13px] text-primary no-underline hover:underline"
                >
                  {instance?.token?.name ?? 'Collection'}
                </Link>
                <h1 className="text-[28px] font-bold mt-1">
                  {metadata?.name ?? `#${tokenId}`}
                </h1>
              </div>

              {/* Owner */}
              <Card className="p-3.5">
                <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-widest">
                  Owner
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {ownerAddress ? shortenAddress(ownerAddress) : '---'}
                  </span>
                  {isOwner && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-semibold">
                      YOU
                    </span>
                  )}
                </div>
              </Card>

              {/* Details */}
              <Card className="p-3.5">
                <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-widest">
                  Details
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Chain', value: chainInfo?.name ?? String(chainId), color: chainInfo?.color },
                    {
                      label: 'Contract',
                      value: shortenAddress(contractAddress),
                      href: `${explorerBase}/token/${contractAddress}`,
                    },
                    { label: 'Token ID', value: tokenId },
                    { label: 'Token Standard', value: instance?.token?.type ?? 'ERC-721' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-[13px]">
                      <span className="text-muted-foreground">{row.label}</span>
                      {row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-foreground no-underline flex items-center gap-1 hover:underline"
                        >
                          {row.value}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span
                          className={row.label === 'Token ID' ? 'font-mono' : ''}
                          style={row.color ? { color: row.color } : undefined}
                        >
                          {row.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* External links */}
              {metadata?.external_url && (
                <a
                  href={metadata.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-2.5 bg-card border border-border rounded-[10px] text-primary no-underline text-[13px] hover:bg-secondary transition-colors"
                >
                  View External <ExternalLink className="inline h-3 w-3 ml-1" />
                </a>
              )}

              {/* Trading Actions */}
              <Card className="p-4">
                {isOwner ? (
                  <ListingForm contractAddress={contractAddress as Address} tokenId={tokenId} />
                ) : (
                  <OfferForm contractAddress={contractAddress as Address} tokenId={tokenId} />
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

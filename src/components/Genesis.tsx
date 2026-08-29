'use client'

import { formatUnits } from 'viem'
import { useReadContract } from 'wagmi'
import { Card } from '@/components/ui/card'
import { GENESIS_TOKEN_ABI, NFT_TYPE, TIER } from '@/lib/contracts'
import type { Chain } from '@/lib/registry'

// THE ONLY PER-ITEM METADATA ON ANY LUX CHAIN.
//
// GenesisNFTs.sol keeps `tokenMeta` per token and its generated getter answers,
// so a Genesis token has a name, a type, a tier, a bonded amount and a mint
// timestamp — all read from the contract. Nothing else on Lux publishes any of
// that: the indexer's per-item resource is empty for every collection, and this
// collection's tokenURI is one malformed string shared by all three tokens.
//
// It is contract-specific on purpose. This reads GenesisNFTs.sol because that
// contract is deployed and answers; it is not a shape any ERC-721 has.

export type Meta = readonly [number, number, string, bigint, bigint, bigint, boolean]

export function useGenesisMeta(chain: Chain, address: string, id: string) {
  return useReadContract({
    chainId: chain.id,
    address: address as `0x${string}`,
    abi: GENESIS_TOKEN_ABI,
    functionName: 'tokenMeta',
    args: [BigInt(id)],
    query: { enabled: Boolean(chain.rpc) },
  })
}

export function GenesisMeta({ chain, address, id }: { chain: Chain; address: string; id: string }) {
  const { data, isLoading, isError } = useGenesisMeta(chain, address, id)

  if (isLoading) return <p className="text-sm text-muted-foreground">Reading the token record…</p>
  if (isError || !data)
    return (
      <p className="text-sm text-muted-foreground">
        The collection keeps a record per token and it does not answer for this id.
      </p>
    )

  const [nftType, tier, name, , locked, timestamp] = data as Meta

  return (
    <Card className="h-full space-y-2 p-6 text-sm transition-colors hover:border-muted-foreground/30">
      <div className="font-mono text-xs text-muted-foreground">#{id}</div>
      <div className="text-lg font-semibold">{name}</div>
      <div className="text-muted-foreground">
        {TIER[tier] ?? `tier ${tier}`} tier, {NFT_TYPE[nftType] ?? `type ${nftType}`} NFT.
      </div>
      <div className="text-muted-foreground">
        <span className="font-mono text-foreground">
          {Number(formatUnits(locked, 18)).toLocaleString()} {chain.coin}
        </span>{' '}
        bonded permanently to this token.
      </div>
      <div className="text-muted-foreground">
        Minted {new Date(Number(timestamp) * 1000).toLocaleDateString()}.
      </div>
    </Card>
  )
}

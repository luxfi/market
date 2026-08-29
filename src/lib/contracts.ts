// Contracts this app reads. Every address and every function below answers on
// chain today; nothing here describes a deployment that does not exist.
//
// What used to be here and is gone: a marketplace address map, the IMarket ABI
// for list/buy/makeOffer, and an LSSVM pair ABI. Market.sol lives in
// ~/work/lux/standard/contracts/nft/Market.sol and is deployed on no Lux chain
// — eth_getCode returns 0x at every address the old deployments file recorded,
// and the current generated Addresses.sol dropped them because its generator
// verifies code before emitting a constant. A listing form against a contract
// that cannot settle is a button that lies, so there is no listing form and
// there is no ABI for one. Both come back the day an address does.

/**
 * Lux Genesis, the only collectible NFT contract on any Lux chain.
 *
 * Measured on 96369 at https://api.lux.network/v1/bc/C/rpc: 21121 bytes of
 * code, name() "Lux Genesis", symbol() "GENESIS", totalSupply() 3,
 * supportsInterface(0x80ac58cd) and (0x2a55205a) both true.
 *
 * This replaces 0x004287c4..76c6, which the app probed for a year and which
 * has no code at all. The indexer's own search finds the live one:
 * /v1/indexer/cchain/search?q=genesis.
 */
export const GENESIS: Record<number, `0x${string}`> = {
  96369: '0x9e04fc57c20b2ee45627c4aa280eb471f2ca6ea5',
}

/**
 * GenesisNFTs.sol state, both public and both answering: totalMinted() → 3,
 * totalLuxLocked() → 3e27 wei, which is 3,000,000,000 LUX bonded across the
 * three tokens.
 */
export const GENESIS_ABI = [
  { type: 'function', name: 'totalMinted', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalLuxLocked', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'owner', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
] as const

export const ERC721_ABI = [
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'ownerOf', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'tokenURI', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'string' }] },
] as const

/** ERC-165. `supportsInterface` is how a collection declares what it is. */
export const ERC165_ABI = [
  { type: 'function', name: 'supportsInterface', stateMutability: 'view', inputs: [{ name: 'id', type: 'bytes4' }], outputs: [{ type: 'bool' }] },
] as const

/**
 * ERC-2981 quotes a royalty for a sale price rather than publishing a rate, so
 * the rate is read by asking for one whole token: royaltyInfo(id, 1e18)
 * returns the receiver and the share. Lux Genesis answers 2.5e16 — 2.5% — to
 * the collection owner.
 */
export const ERC2981_ABI = [
  {
    type: 'function',
    name: 'royaltyInfo',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'salePrice', type: 'uint256' }],
    outputs: [{ type: 'address' }, { type: 'uint256' }],
  },
] as const

export const INTERFACE = {
  erc721: '0x80ac58cd',
  erc1155: '0xd9b67a26',
  royalty: '0x2a55205a',
} as const

/** The unit royaltyInfo is quoted against, so the answer reads as a rate. */
export const ONE = 10n ** 18n

/**
 * GenesisNFTs.sol keeps a record per token — `mapping(uint256 => TokenMeta)
 * public tokenMeta` — and its generated getter answers on chain today. It is
 * the only per-item metadata that exists anywhere on Lux: the indexer holds
 * none, and the collection's tokenURI is one malformed string shared by all
 * three tokens. Every token has a name in it: #0 "Genesis Validator #51",
 * #1 "Genesis Validator #100", #2 "The Terminator".
 *
 * `market` is the marketplace the collection would route a sale through. It
 * reads the zero address, which is the contract itself saying no marketplace is
 * wired to it.
 */
export const GENESIS_TOKEN_ABI = [
  {
    type: 'function',
    name: 'tokenMeta',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nftType', type: 'uint8' },
      { name: 'tier', type: 'uint8' },
      { name: 'name', type: 'string' },
      { name: 'originTokenId', type: 'uint256' },
      { name: 'luxLocked', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'reserved', type: 'bool' },
    ],
  },
  { type: 'function', name: 'market', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'salesOpen', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
] as const

/** GenesisNFTs.sol:129 and :134, in declaration order. */
export const NFT_TYPE = ['Validator', 'Card', 'Coin'] as const
export const TIER = ['Genesis', 'Validator', 'Mini', 'Nano'] as const

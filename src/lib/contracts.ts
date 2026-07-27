// Marketplace wiring. ABIs mirror the real source in
// ~/work/lux/standard/contracts/nft/Market.sol (IMarket) — do not invent entries.

/**
 * Per-chain marketplace addresses.
 *
 * EMPTY ON PURPOSE: `Market.sol` is not deployed on any Lux chain today. The
 * address recorded for lux-mainnet in
 * standard/contracts/deployments/addresses.json (markets/Markets
 * 0xefba7dbf4b9e2855b84f410f61b15975629cdb38) returns `0x` from eth_getCode on
 * 96369 — it was wiped by the 2026-07-10 fresh genesis and never redeployed.
 * ListingForm / OfferForm read this map and render nothing while it is empty,
 * which is the correct behaviour: no listing can be signed against a contract
 * that does not exist. Add an entry only after verifying code at the address.
 */
export const CONTRACTS: Record<number, { market?: `0x${string}`; router?: `0x${string}` }> = {}

/**
 * Wrapped native token per chain. `Market.makeOffer` rejects address(0)
 * (`if (paymentToken == address(0)) revert InvalidPrice()` — Market.sol:418),
 * so offers must be denominated in an LRC20. Only entries verified on-chain
 * belong here: WLUX below returns 1730 bytes of code / symbol "WLUX" /
 * decimals 18 on 96369.
 */
export const WRAPPED_NATIVE: Record<number, `0x${string}`> = {
  96369: '0x4888E4a2Ee0F03051c72D2BD3ACf755eD3498B3E',
}

export const ERC721_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'ownerOf', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'tokenURI', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'getApproved', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'setApprovalForAll', stateMutability: 'nonpayable', inputs: [{ name: 'operator', type: 'address' }, { name: 'approved', type: 'bool' }], outputs: [] },
  { type: 'function', name: 'transferFrom', stateMutability: 'nonpayable', inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }], outputs: [] },
] as const

export const ERC1155_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'id', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'uri', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }], outputs: [{ type: 'string' }] },
] as const

/** IMarket — standard/contracts/nft/Market.sol:37-48. */
export const MARKET_ABI = [
  {
    type: 'function',
    name: 'list',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ type: 'bytes32' }],
  },
  { type: 'function', name: 'cancelListing', stateMutability: 'nonpayable', inputs: [{ name: 'listingId', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'buy', stateMutability: 'payable', inputs: [{ name: 'listingId', type: 'bytes32' }], outputs: [] },
  {
    type: 'function',
    name: 'makeOffer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'nftContract', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ type: 'bytes32' }],
  },
  { type: 'function', name: 'cancelOffer', stateMutability: 'nonpayable', inputs: [{ name: 'offerId', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'acceptOffer', stateMutability: 'nonpayable', inputs: [{ name: 'offerId', type: 'bytes32' }], outputs: [] },
] as const

export const LSSVM_PAIR_ABI = [] as const

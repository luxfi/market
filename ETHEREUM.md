# Ethereum, measured — 2026-08-29

Every line below was probed live today against a public RPC, at Ethereum block
**25863208** and BSC block **118829025**. Prefer these over any inference.
Re-measure rather than trusting a stale line; do not contradict one without
measuring first.

The question this answers: the user said our NFTs are "principally imported from
ethereum". They are. There is one Ethereum collection and one BSC collection,
both real, both live, both ours.

## The collection on Ethereum

**Lux Genesis — `LUXNFT`, ERC-721, 50 tokens, Ethereum mainnet.**

| | |
|---|---|
| Media (the ERC-721) | `0x31e0F919C67ceDd2Bc3E294340Dc900735810311` |
| Drop ("Gen 0", the type registry) | `0x941E3B4fC883B1746E52814EB8574b85E6Fa4E66` |
| App (orchestrator, UUPS) | `0x44A210571E135C6a536564e9B14dc4DA63f3D398` |

```
cast call 0x31e0F919C67ceDd2Bc3E294340Dc900735810311 "name()(string)"        --rpc-url https://ethereum-rpc.publicnode.com   → "LUXNFT"
cast call 0x31e0F919C67ceDd2Bc3E294340Dc900735810311 "symbol()(string)"      → "LUXNFT"
cast call 0x31e0F919C67ceDd2Bc3E294340Dc900735810311 "totalSupply()(uint256)"→ 50
cast call 0x31e0F919C67ceDd2Bc3E294340Dc900735810311 "supportsInterface(bytes4)(bool)" 0x80ac58cd → true
cast call 0x31e0F919C67ceDd2Bc3E294340Dc900735810311 "supportsInterface(bytes4)(bool)" 0xd9b67a26 → false
cast code  0x31e0F919C67ceDd2Bc3E294340Dc900735810311 → 20318 bytes
cast code  0x941E3B4fC883B1746E52814EB8574b85E6Fa4E66 →  9912 bytes
cast code  0x44A210571E135C6a536564e9B14dc4DA63f3D398 →   680 bytes
```

It is a Zora v1 fork: Media carries per-token content and metadata URIs plus
per-token content and metadata hashes. Source is `github.com/luxdefi/town`
(`contracts/src/{Media,Drop,App}.sol`). Provenance and history already live in
`~/work/lux/tokenomics` — that repo is the source of truth and every figure it
states about Ethereum reproduced exactly under live query today.

### Every one of the 50, enumerated

`ownerOf`, `tokenURI`, `tokenContentHashes`, `tokenMetadataHashes` and
`tokenMetadataURI` called for ids 1..51 over `eth_call`. Full output saved at
`scratchpad/lux_genesis_eth.json`.

| Measured | Value |
|---|---|
| ids live | **1–50, contiguous**; id 51 reverts `nonexistent token` |
| distinct holders | **28** |
| holdings shape | 20 wallets hold 1 · 4 hold 2 · 2 hold 3 · 1 holds 6 · 1 holds 10 |
| largest holder | `0xb7c5819f928a02ff3946b369d997e1d52712bf41` — 10 tokens |
| second | `0x8d56c7cf8b17a11580822c7fff90b05b6a3e1b5e` — 6 tokens |
| burned | **none** — zero tokens at `0x0` or `0xdead` |
| contentHash | 50/50 non-zero, **50/50 distinct** |
| metadataHash | 50/50 non-zero, **50/50 distinct** |

Type is derived from the tokenURI, and that is the only on-chain type signal:

| tokenURI shape | Meaning | Count |
|---|---|---:|
| `validator.mov?...&type=__validator__` | Genesis Validator | **32** |
| `wallet.mov?lux=1000000000&...` | Coin, 1B bond | 2 |
| `wallet.mov?lux=100000000&...` | Coin, 100M bond | 5 |
| `wallet.mov?lux=10000000&...` | Coin, 10M bond | 8 |
| `wallet.mov?lux=1000000&...` | Coin, 1M bond | 3 |

The Drop agrees, queried independently:

```
cast call 0x941E3B4fC883B1746E52814EB8574b85E6Fa4E66 "title()(string)" → "Gen 0"
cast call 0x941E3B4fC883B1746E52814EB8574b85E6Fa4E66 "totalMinted(string)(uint256)" "Validator"       → 32
                                                                                    "Wallet 1B Lux"   →  2
                                                                                    "Wallet 100M Lux" →  5
                                                                                    "Wallet 10M Lux"  →  8
                                                                                    "Wallet 1M Lux"   →  3
                                                                                    "Wallet 10B Lux"  →  0
                                                                                    "ATM"             →  0
```

32 + 2 + 5 + 8 + 3 = 50. Two independent contracts, same answer.

## The art survives; the metadata does not

This is the part an import has to plan around, and it splits in two.

**`lux.town` is gone.** All 50 tokenURIs and all 50 metadataURIs point at it.

```
dig +short NS  lux.town @1.1.1.1   → (nothing)
dig +short SOA lux.town @1.1.1.1   → (nothing)
dig            lux.town @1.1.1.1   → status: SERVFAIL
curl https://lux.town/nfts/validator.mov → could not resolve host
```

No nameservers at all — the delegation itself has lapsed, so this is not a
server that is down, it is a name that no longer exists.

**`cdn.lux.network` is live and carries the video, but not the JSON.**

```
curl -o /dev/null -w '%{http_code} %{content_type} %{size_download}' \
  https://cdn.lux.network/nfts/validator.mov  → 200 video/mp4  908069
  https://cdn.lux.network/nfts/wallet.mov     → 200 video/mp4 1297800
  https://cdn.lux.network/api/metadata/validator.json → 404
  https://cdn.lux.network/nfts/validator.json        → 404
```

So the two video assets — the whole collection is two pieces of art, 32 tokens
share one and 18 share the other — are recovered and served. The metadata JSON
is not, and it cannot simply be copied across: the old path was
`lux.town/api/metadata/{validator,wallet}.json?lux=N&name=…&type=…`, a dynamic
route whose response depended on the query string. Restoring it means
re-implementing the renderer, not re-hosting a file.

**The Ethereum URIs cannot be repaired on Ethereum.** The deployed Media has no
`setTokenURI`, no `setBaseURI` and no owner override. Its only mutator is
`updateTokenURI(uint256,string)` gated `onlyApprovedOrOwner`, so only each of
the 28 holders can rewrite their own tokens; `owner()` cannot. The existing fix
is client-side and already shipped — rewrite host and extension at read time,
leave the chain alone (`NFT_MEDIA_BASE` in `lux/cloud/apps/web/src/lib/brand.ts`,
applied by `nftMedia()` in `lib/chain.ts`). Rewriting the on-chain URIs would
also destroy the only type signal the collection has, since `?type=__validator__`
and `?lux=N` are what classify every token. Do not do it.

The per-token content hashes do not help here. They are distinct for all 50 —
including for the 32 validators that share one video — so they commit to
something per-token, not to the artwork, and cannot be used to prove a recovered
file is the original.

## The collection on BSC

Zoo's NFT history is BSC, not Ethereum, and it is much larger than the Lux one.

**CryptoZoo — `ANML`, ERC-721, 5840 tokens, BSC chain 56.**

| | |
|---|---|
| Media (the ERC-721) | `0x91109c6e2AaF421456aafAb4ba3a122A95b46B28` |
| Drop | `0x6f918d5E359276A8A4120BC4Af89d0A8a044Fe48` |
| Market (Zora-style, **live**) | `0x3a85FCD47573e217728E0EF0d9A3b932B9601afc` |
| Savage | `0xfa397EFCA5FD60E672EFCB511fDB885D815e2fb8` |
| ZooKeeper | `0x24d4B6Ba0726Ec6Ba0297084be938278247e046B` |
| DAO | `0x85Bb05348905eDE5D6f91EC0F0B1e7957d978461` |

ZooKeeper and DAO are both 680-byte EIP-1967 proxies. Reading slot
`0x360894a1…382bbc` gives ZooKeeper's implementation as
`0x2e0e0bbaa0fa2a7821fcfc197c1cafb98bcba3e1` (23748 bytes) and the DAO's as
`0xf1dbecf359d5bb9c79f3ce268dc2a4f28af44ce3` (2441 bytes). Both are upgradeable,
which matters if anything is ever built against them.

Found in `~/work/zoo/zoo-v4/packages/contracts/deployments/mainnet/*.json`
(and mirrored in `zoo3/`, `zoo-ai/`, `zoo/contracts/deployments/v4/`). The
directory is named `mainnet` but it is BSC: its `UniswapV2Router02` is
`0x10ED43C718714eb63d5aA57B78B54704E256024E`, the PancakeSwap router, and its
`BNB` entry is WBNB.

```
cast call 0x91109c6e2AaF421456aafAb4ba3a122A95b46B28 "name()(string)" --rpc-url https://bsc-dataseed.binance.org → "CryptoZoo"
                                                     "symbol()(string)"       → "ANML"
                                                     "totalSupply()(uint256)" → 5840
                                                     "supportsInterface(bytes4)(bool)" 0x80ac58cd → true
                                                     "supportsInterface(bytes4)(bool)" 0x780e9d63 → true   (enumerable)
cast code 0x91109c6e2AaF421456aafAb4ba3a122A95b46B28 → 17778 bytes
```

All 5840 `ownerOf` calls resolved (`scratchpad/cryptozoo_owners.json`):

| Measured | Value |
|---|---|
| ids live | **1–5840, contiguous**; 0 and 5841 revert |
| distinct holders | **2676** |
| holdings shape | 820 hold 1 · 548 hold 2 · **1308 hold 3** — nothing holds more |
| burned | **none** |
| tokenURI | `https://db.zoolabs.io/egg.mp4` — identical on every token sampled |
| metadataURI | `https://db.zoolabs.io/egg.json` — likewise |
| contentHash | per-token distinct (ids 1, 2, 5840 all differ) |

The hard cap of 3 per wallet is visible in the data and is a mint rule, not an
accident of distribution.

**`db.zoolabs.io` does not resolve, but `zoolabs.io` does.**

```
dig +short zoolabs.io    @1.1.1.1 → 104.21.42.77, 172.67.159.61   (Cloudflare)
dig +short db.zoolabs.io @1.1.1.1 → (nothing)
curl https://cdn.lux.network/nfts/egg.mp4 → 404
```

That is a materially better position than `lux.town`. The parent zone is alive
and ours, so the subdomain is a DNS record away from working — assuming the two
files still exist somewhere. They are not on the Lux CDN. Whether `egg.mp4` and
`egg.json` are recoverable is the single open question on the Zoo side, and it
should be answered before anything is built against this collection.

## Not ours, despite appearances

Two of the Zoo BSC addresses also have code on **Ethereum mainnet**. They are
unrelated contracts, and reporting them as ours would be wrong.

```
cast code 0x91109c6e2AaF421456aafAb4ba3a122A95b46B28 --rpc-url https://ethereum-rpc.publicnode.com → 4940 bytes
cast code 0x19263F2b4693da0991c4Df046E4bAA5386F5735E --rpc-url https://ethereum-rpc.publicnode.com → 4940 bytes
cast keccak <both bodies> → 0xfb8e4f92556434f9ff5f64cd8ef561f33412bfe90b6a85162bf8f4f6025f0b81 (identical)
cast call <either> "name()/symbol()/totalSupply()/supportsInterface(0x80ac58cd)" → all revert
cast call <either> "owner()(address)" → 0x0167b39485A704D28F44C5ec67e8263a41E4BfB1   (agrees on two RPCs)
```

Identical bytecode at both, and its selectors resolve to `withdrawUSDT(uint256)`,
`withdrawEther()`, `withdrawAllTokens(address)` and `usdtToken()`. A USDT sweeper,
twice deployed, by an unrelated party whose deployer nonces happened to collide
with Zoo's. Not an NFT, not ours.

The other seven candidate addresses return **0 bytes** on Ethereum:
`0x3a85FCD4…`, `0x6f918d5E…`, `0x24d4B6Ba…`, `0x8e7788ee…`, `0x7fFC1243…`,
`0xfa397EFC…`, `0x85Bb0534…`.

The three ZOO ERC-20s on BSC are live and are tokens, not collectibles —
v1 `0x8e7788ee…`, v2 `0x19263F2b…`, v3 `0x7fFC1243…`, all `name()` "ZOO",
18 decimals, ~2e30 base units. Recorded so nobody mistakes them for the NFT.

## Where the Lux side stands today

The re-mint target named throughout `tokenomics/` is **empty**:

```
cast code 0x004287C47efc912FEc391979154454a8017A76C6 --rpc-url https://api.lux.network → 0 bytes
```

This is expected and documented: the 2026-07-10 genesis reset on 96369 wiped all
on-chain NFT state. What is live instead is a partial, defective re-mint:

```
cast call 0x9e04fc57c20b2ee45627c4aa280eb471f2ca6ea5 "name()(string)"         → "Lux Genesis"
                                                     "symbol()(string)"       → "GENESIS"
                                                     "totalSupply()(uint256)" → 3
                                                     "owner()(address)"       → 0x9011E888251AB053B7bD1cdB598Db4f9DEd94714  (DAO)
cast call 0x9e04fc57… "tokenURI(uint256)(string)" 0 → "https://lux.town/nfts/https://lux.town/nfts/validator.mov"
```

Three tokens out of a canonical 118, all three carrying a **doubled tokenURI** —
a base-URI concatenated onto an already-absolute URI — pointing at the dead host.
Two are held by `0x55be906E…`, one by `0x67bD7c7C…`. Neither address appears in
the Ethereum holder set. Whatever these three are, they are not the migration.

The tier table is real and should be trusted: `_getLuxForTier` in
`~/work/lux/standard/contracts/nft/GenesisNFTs.sol` returns 1B / 100M / 10M / 1M
LUX for `GENESIS` / `VALIDATOR` / `MINI` / `NANO`. A reward **multiplier** does
not exist anywhere in that contract — `grep -rniE 'multiplier' contracts/nft/`
returns nothing. Rewards are claimed against `luxLocked`, not a tier factor. Any
UI showing 10x/5x/2x/1x is showing a number nothing produced.

## Bringing them over

Three routes. They differ in who is trusted, not in difficulty alone.

### A bridge corridor

`~/work/lux/standard/contracts/bridge/XChainVault.sol` already has
`vaultERC721(address,uint256,uint32,address)` and a `TokenType.ERC721`, and its
release path branches on that type. The contract half is written.

The Go half is not. `grep -ril 'erc721' bridge/pkg bridge/cmd bridge/internal`
matches only vendored `dist/` bundles and rollup caches — no handler, no
message type, no mint call. A locked token would be taken custody of and never
appear on the far side.

Building it means: an ERC-721 vault event the relayer recognises, a message
carrying `(collection, tokenId, recipient)` and enough metadata to reconstruct
the token, a mint authority on the Lux side, and a replay guard. Then it has to
be operated and secured indefinitely, because a bridge is a standing liability,
not a one-time job. For **50 tokens across 28 holders** this is the most
expensive option by a wide margin, and it buys nothing the others don't.

### A snapshot and a fresh mint

Read all 50 owners at a pinned block, mint the same ids to the same addresses on
96369, done in one transaction batch.

This is already built. `~/work/lux/tokenomics/data/genesis-remint-plan.json`
is an un-executed plan of **118 mints** — 100 validators, 18 coins — each row
carrying `serial`, `tier`, `to`, `originTokenId` and `bond`, generated by
`scripts/gen-remint-plan.mjs`. `GenesisNFTs.sol` stores `originTokenId` as a
first-class field, so the link back to Ethereum is preserved on-chain.
`standard/script/DeployGenesisNFTsMigrate.s.sol` and the three proofs in
`migration/tokenomics-split-forkproof/test/` already exist. My own enumeration
today independently reproduces the Ethereum half of that plan exactly.

What it costs honestly: the Ethereum originals keep existing. Nothing burns
them, nothing locks them, and the Media contract has no mechanism that could.
So after the mint, two chains each hold a token claiming to be Genesis #7, and
the only thing making the Lux one authoritative is that we say so. If an
Ethereum token trades afterwards, its Lux twin is already sitting with the
previous owner. A snapshot is a promise about a moment, and it decays from the
moment it is taken.

### A claim contract

Deploy on 96369, let a holder prove they own Ethereum token *N*, mint *N* to
them. Nothing is minted until someone claims, so the snapshot never goes stale
and the double-claim question answers itself with a `claimed[tokenId]` flag.

The cost is the proof. There is no trustless read of Ethereum state from 96369
today — no light client, no state-proof precompile — so the proof is either a
signature from the holder's Ethereum key checked against a merkle root we
publish, which is a snapshot again with extra steps, or an attestation from an
oracle we run, which is us again. And every unclaimed token stays unclaimed
forever; some of those 28 wallets are four years old and some are certainly lost.

### What I would do

**Take the snapshot-and-mint, and make the snapshot honest rather than pretending
it is a bridge.**

The numbers decide it. Fifty tokens. Twenty-eight holders. Two pieces of art. A
plan file that already exists, verified against the chain twice. Building a
standing bridge corridor for that is not caution, it is spending a permanent
security budget to avoid writing down a fact we already know.

Two things make it defensible rather than merely convenient:

Pin the snapshot to a stated Ethereum block and publish it. The claim being made
is "these were the owners at block *N*", which is checkable by anyone forever.
It is not "these are the owners", which stops being true the next time a token
moves.

Say plainly, in the UI and on-chain, that the Ethereum tokens still exist. The
`originTokenId` field is already there for exactly this. A Lux Genesis token is
the Lux representation of Ethereum token *N* — not a claim that *N* stopped
existing. Overstating that is the one thing that would make this dishonest, and
it costs nothing to avoid.

Then leave a claim path open for the tail. If a token moves on Ethereum after
the pin, the new owner has a route that does not require re-running the
migration for everyone.

CryptoZoo is a different decision and should be made separately. 5840 tokens and
2676 holders is a real population, the art is not currently retrievable, and
BSC's live Zora Market at `0x3a85FCD4…` means those tokens may still be trading.
Recover `egg.mp4` and `egg.json` first. Deciding how to import a collection
whose art we cannot serve is deciding in the dark.

## Absent, stated plainly

- **No Ethereum NFT beyond `0x31e0F919…`.** Searched `~/work/lux`, `~/work/zoo`
  and `~/work/hanzo` for OpenSea links, Etherscan token links, `deployments/`
  trees, `addresses.json`, `.env.example`, decks, papers and `LLM.md`, and
  `git log --diff-filter=D` for deleted address files in both trees. That search
  returns nothing deleted and nothing else live. Hanzo has no NFT anywhere.
- **No ERC-1155 anywhere.** `supportsInterface(0xd9b67a26)` is false on both
  collections.
- **No import machinery for a collection we do not own.** Everything that exists
  is hard-wired to `0x31e0F919…`. If the user names another collection, it will
  need a parameter, not an edit.
- **No CryptoZoo migration record.** No snapshot, no claim contract, no mapping
  file anywhere in `~/work/zoo`. Zoo chain 200200 holds no NFT of any kind, and
  `0x91109c6e…` has 0 bytes there.
- **The art host question is open on the Zoo side only.** `lux.town`'s video is
  recovered on `cdn.lux.network`; its metadata JSON is not, and needs a renderer
  rather than a file. `db.zoolabs.io` has neither, though the parent zone is ours.

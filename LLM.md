# Lux Market

`@luxfi/market` — Next 15 static export, `@luxfi/ui` 7.x, wagmi + viem.
lux.market reads the Lux chains and shows what is on them. It holds no assets,
takes no custody and settles nothing.

## What is actually on the chains

Measured 2026-08-29, and worth re-measuring before relying on any of it.

- **One collectible NFT contract exists on any Lux chain.** Lux Genesis,
  `0x9e04fc57c20b2ee45627c4aa280eb471f2ca6ea5` on 96369, three tokens. The other
  ERC-721 is Uniswap's V3 position manager, which is an LP receipt.
- **No marketplace contract is deployed anywhere.** `Market.sol` lives in
  `~/work/lux/standard/contracts/nft/Market.sol`; every address the old
  deployments file recorded returns `0x` from `eth_getCode`, and the Genesis
  collection's own `market()` reads the zero address. Nothing has ever been
  listed, bid on or sold.
- **The AMM is the deep data.** Lux has 32 pools and Zoo 20, with both sides of
  every pair, fee tier, locked value, volume and transaction count.

## The three reads, and which questions each answers

| module | source | answers |
|---|---|---|
| `lib/registry.ts` | `/v1/explorer/admin/chains` | which chains exist, their ids, slugs, coins, RPCs, AMM contracts |
| `lib/explorer.ts` | `/v1/indexer/<slug>/…` | tokens, collections, holders, transfers, holdings, stats |
| `lib/amm.ts` | `/v1/graph/<slug>/amm/graphql` | factory totals and pools |
| `lib/logs.ts` | the chain's own RPC | the token id the indexer drops |

`hooks/queries.ts` wraps all four in react-query. Nothing else fetches.

### The registry is the chain list

There is no array of chains in this app. `readChains()` reads the indexer's
registry and everything downstream carries a whole `Chain` record — slug for the
indexer, id for a contract, coin for a label, explorer for a link out. The array
this replaced had drifted twice: it missed Osage, and it offered SPC, whose RPC
404s and which the registry has never served.

Two things the registry does not hand over cleanly:

- **`rpc` is the indexer's own route, not a browser's.** For Lux it is an
  in-cluster name over plain HTTP; the public route arrives as `public_rpc`.
  Take `public_rpc` first, then `rpc` if it is already https, otherwise admit
  there is none.
- **Its order is a Go map's**, so it changes between requests. The default chain
  leads and the rest are sorted by name, or the chain switcher reshuffles on
  every load.

The explorer host is derived — `api.X` → `explore.X`, verified 200 on all five —
rather than kept in a second list that can disagree with the first.

### The indexer drops the token id, and it is one field

Every ERC-721 transfer row arrives with the ERC-20 shape: `total.value` `"1"`,
no id, and a token object carrying only `address_hash` and `type`. The chain
still has it — `eth_getLogs` on the Transfer topic returns it in `topics[3]` —
and the indexer's `log_index` **is** the EVM log index, so `(block, logIndex)`
joins a row to its log exactly. `lib/logs.ts` does that join in bounded windows;
rows outside the budget say the id was not read rather than printing `#?`.

Fixing this upstream is a small change in `~/work/lux/indexer` (write
`topics[3]` into `token_id`, populate instances, carry name/symbol on the
transfer's token). Do **not** apply `migrations/004_nft_marketplace.sql` — it is
a Postgres marketplace schema nothing writes to, and its companion
`evm/defi/nft.go` holds event hashes that do not match `cast keccak`.

Also true, and the reason there is no item resource: `/tokens/{addr}/instances`
returns `{"items":[]}` for **every** collection, including the 149-token one.

### The one place per-item metadata exists

`GenesisNFTs.sol` keeps `mapping(uint256 => TokenMeta) public tokenMeta` and its
generated getter answers. Each token has a name (#0 "Genesis Validator #51",
#1 "Genesis Validator #100", #2 "The Terminator"), a tier, and the LUX bonded to
it. `components/Genesis.tsx` reads it. It is contract-specific on purpose; no
other collection publishes anything per item.

## Two things that will bite

**The gui engine and the Lux token set share the name `--background`.**
`@hanzo/gui` injects `:root.t_dark { --background: … ; --color: … }` and
`body { background: var(--background); color: var(--color) }` at runtime, later
in the cascade and more specific than `@luxfi/ui/tokens.css`. The page ground
came from the wrong system and card text measured 1.03:1 against its own card.
`globals.css` reads the ground from `--color-bg-body`, which only the Lux token
set defines and which tracks the same rungs. Every other token is uncontested.

**TypeScript must stay on 6.x.** Next 15 drives the JavaScript compiler API for
tsconfig paths and typechecking; TS 7's native compiler does not expose it, so
`next dev` refuses to start, `@/*` stops resolving in `next build`, and
`next.config.ts` cannot load at all (hence `next.config.mjs`).

## Routes

`/` `/collections` `/collection` `/item` `/activity` `/pools` `/genesis`
`/portfolio` — the read surface.
`/launch` `/launches` `/support` (+ buyers, projects, terms, privacy) — applying
and help.

`output: 'export'` renders every route ahead of time, so a path segment cannot
hold a contract address deployed after the build. `/collection` and `/item` take
the chain and address in the query instead; `lib/links.ts` builds those URLs.

## Rules this surface is held to

- No invented figures. No floor price nothing computed, no holder count nothing
  counted, no activity row nothing observed, no volume nothing summed. Chain
  totals come from the factory entity, not a sum over one page of pools.
- Unavailable is never drawn as empty or as zero. A failed read throws in
  `lib/explorer.ts` so a screen can tell "there are none" from "we could not
  ask", and says which it is.
- Every screen names the chain it read (`components/Source.tsx`).
- Colour through tokens only. Monochrome carries state by weight and label,
  never by hue.
- Nothing signs or broadcasts here. The user's own wallet signs, and today
  nothing asks it to.
- No transactional UI against a contract that is not deployed. When `Market.sol`
  lands somewhere, the ABI and the forms come back with it.

## Build

```bash
pnpm install && pnpm build     # static export to out/
pnpm dev                       # port 3100
```

The export writes `collections.html`, not `collections/index.html`, so the host
has to map `/x` → `x.html`.

'use client'

import { useMemo, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { ExternalLink } from '@luxfi/ui/icons'
import { Card } from '@/components/ui/card'
import { useChain } from '@/hooks/chain'
import { isNft, tokens, type Token } from '@/lib/explorer'
import { addressUrl, type Chain } from '@/lib/registry'
import { cn } from '@/lib/utils'

type Row = { chain: Chain; token: Token }

type Key = 'name' | 'type' | 'chain' | 'holders'

/**
 * The holder figure, where it is one.
 *
 * `holdings` counts rows in the indexer's holdings table: one per holder on a
 * fungible token, one per held item on a collection. So it answers "how many
 * hold this" for an ERC-20 and does not for an ERC-721, and a collection row
 * says so instead of printing a number that means something else in the same
 * column. Unread sorts last either way.
 */
const holders = (t: Token) =>
  isNft(t.type) || t.holdings === null ? -1 : Number(t.holdings)

const label = (t: Token) => t.name ?? t.symbol ?? t.address

function compare(key: Key, a: Row, b: Row): number {
  if (key === 'holders') return holders(a.token) - holders(b.token)
  if (key === 'type') return a.token.type.localeCompare(b.token.type)
  if (key === 'chain') return a.chain.name.localeCompare(b.chain.name)
  return label(a.token).localeCompare(label(b.token))
}

function Head({
  column,
  align,
  sort,
  onSort,
  children,
}: {
  column: Key
  align?: 'right'
  sort: { key: Key; desc: boolean }
  onSort: (k: Key) => void
  children: React.ReactNode
}) {
  const active = sort.key === column
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.desc ? 'descending' : 'ascending') : 'none'}
      className={cn('px-4 py-2.5 font-medium', align === 'right' ? 'text-right' : 'text-left')}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'cursor-pointer border-none bg-transparent p-0 text-xs uppercase tracking-wide transition-colors hover:text-foreground',
          active ? 'font-semibold text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
        <span aria-hidden className="ml-1 font-mono">
          {active ? (sort.desc ? '↓' : '↑') : ''}
        </span>
      </button>
    </th>
  )
}

/**
 * Every token contract on every chain the registry serves.
 *
 * This is the one screen that reads all chains at once rather than the one the
 * header selects, because what has launched is not a per-chain question. The
 * read is `lib/explorer`, the same one every other screen uses.
 */
export function LaunchTable() {
  // Alphabetical, not by size. A default order that puts one project on top is
  // an endorsement; a column the reader chooses to sort by is a measurement.
  const [sort, setSort] = useState<{ key: Key; desc: boolean }>({
    key: 'name',
    desc: false,
  })
  const onSort = (key: Key) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key === 'holders' }))

  const state = useChain()
  const chains = state.status === 'ready' ? state.chains : []

  const reads = useQueries({
    queries: chains.map((c) => ({
      queryKey: ['tokens', c.slug],
      queryFn: () => tokens(c),
    })),
  })

  const rows = useMemo(() => {
    const all: Row[] = []
    chains.forEach((chain, i) => {
      for (const token of reads[i]?.data ?? []) all.push({ chain, token })
    })
    const dir = sort.desc ? -1 : 1
    return all.sort((a, b) => compare(sort.key, a, b) * dir)
  }, [chains, reads, sort])

  if (state.status === 'reading') {
    return <Card className="p-6 text-sm text-muted-foreground">Reading the chain registry…</Card>
  }

  if (state.status === 'failed') {
    return (
      <Card className="space-y-3 p-6">
        <div className="font-semibold">The chain registry did not answer.</div>
        <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
          Which chains exist is read from the indexer&rsquo;s registry rather than kept in a list
          here, so until it answers there is no table to draw — not an empty one. The request failed
          with <code className="font-mono text-xs">{state.reason}</code>.
        </p>
      </Card>
    )
  }

  const settled = reads.every((r) => !r.isPending)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-card">
            <tr>
              <Head column="name" sort={sort} onSort={onSort}>
                Token
              </Head>
              <Head column="type" sort={sort} onSort={onSort}>
                Standard
              </Head>
              <Head column="chain" sort={sort} onSort={onSort}>
                Chain
              </Head>
              <Head column="holders" align="right" sort={sort} onSort={onSort}>
                Holders
              </Head>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Address
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ chain, token }) => {
              const href = addressUrl(chain, token.address)
              const address = <span className="font-mono text-xs">{token.address}</span>
              return (
                <tr key={`${chain.slug}:${token.address}`} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium">{token.name ?? token.address}</div>
                    {token.symbol && (
                      <div className="font-mono text-xs text-muted-foreground">{token.symbol}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {token.type}
                  </td>
                  <td className="px-4 py-3">{chain.name}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {isNft(token.type) ? (
                      <span className="text-muted-foreground">counted per item</span>
                    ) : token.holdings === null ? (
                      <span className="text-muted-foreground">not reported</span>
                    ) : (
                      Number(token.holdings).toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {href ? (
                      <a
                        className="inline-flex items-center gap-1.5 hover:underline"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {address}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    ) : (
                      address
                    )}
                  </td>
                </tr>
              )
            })}
            {settled && rows.length === 0 && (
              <tr className="border-t border-border">
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Every chain answered and none of them has a token contract recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {chains.map((chain, i) => {
          const read = reads[i]
          const count = read?.data?.length
          return (
            <span key={chain.slug} className="mr-4 inline-block">
              <span className="text-foreground">{chain.name}</span>{' '}
              {read?.isPending
                ? 'reading…'
                : read?.isError
                  ? 'unavailable'
                  : count === 0
                    ? 'none recorded'
                    : `${count} recorded`}
            </span>
          )
        })}
      </p>
    </div>
  )
}

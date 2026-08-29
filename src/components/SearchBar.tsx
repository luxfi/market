'use client'

import { Search } from '@luxfi/ui/icons'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useCollections } from '@/hooks/queries'
import * as links from '@/lib/links'
import type { Chain } from '@/lib/registry'

export function SearchBar({ chain }: { chain: Chain }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { data } = useCollections(chain, query.trim() || undefined)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', away)
    return () => document.removeEventListener('mousedown', away)
  }, [])

  const results = query.trim().length >= 2 ? (data ?? []) : []

  return (
    <div ref={box} className="relative w-full max-w-[480px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Search collections on ${chain.name}`}
          className="h-10 rounded-[10px] bg-card pl-9"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[200] mt-1 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl">
          {results.map((token) => (
            <Link
              key={token.address}
              href={links.collection(chain, token.address)}
              onClick={() => {
                setOpen(false)
                setQuery('')
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground no-underline transition-colors hover:bg-secondary"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-muted-foreground">
                {token.symbol?.charAt(0) ?? '?'}
              </div>
              <div>
                <div className="text-sm font-medium">{token.name ?? token.address}</div>
                <div className="text-[11px] text-muted-foreground">{token.type}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

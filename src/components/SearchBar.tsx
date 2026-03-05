'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchCollections } from '@/hooks/useNFTData'
import { useChainContext } from '@/hooks/useChain'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { chainId } = useChainContext()
  const { data: results } = useSearchCollections(chainId, query)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const nftResults = results?.items?.filter(
    (r: { type: string }) => r.type === 'ERC-721' || r.type === 'ERC-1155'
  ) ?? []

  return (
    <div ref={ref} className="relative w-full max-w-[480px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search collections, NFTs..."
          className="pl-9 h-10 rounded-[10px] bg-card"
        />
      </div>
      {isOpen && query.length >= 2 && nftResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl p-2 max-h-80 overflow-y-auto z-[200] shadow-xl shadow-black/40">
          {nftResults.map((item: { address: string; name: string; symbol: string; type: string; icon_url: string | null }) => (
            <Link
              key={item.address}
              href={`/collection/${chainId}/${item.address}`}
              onClick={() => {
                setIsOpen(false)
                setQuery('')
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg no-underline text-foreground transition-colors hover:bg-secondary"
            >
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground/50 bg-cover bg-center"
                style={
                  item.icon_url
                    ? { backgroundImage: `url(${item.icon_url})` }
                    : { background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)))' }
                }
              >
                {!item.icon_url && (item.symbol?.charAt(0) ?? '?')}
              </div>
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-[11px] text-muted-foreground">{item.type}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

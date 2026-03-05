'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useChainContext } from '@/hooks/useChain'
import { CHAIN_INFO } from '@/lib/chains'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Explore' },
  { href: '/collections', label: 'Collections' },
  { href: '/activity', label: 'Activity' },
  { href: '/genesis', label: 'Genesis' },
  { href: '/portfolio', label: 'Portfolio' },
]

const CHAIN_IDS = [96369, 200200, 36963, 36911, 494949]

export function Header() {
  const pathname = usePathname()
  const { chainId, setChainId } = useChainContext()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground no-underline"
        >
          Lux Market
        </Link>
        <nav className="flex gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm no-underline transition-colors',
                  isActive
                    ? 'text-foreground bg-card'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Chain selector */}
        <div className="flex gap-0.5 bg-card rounded-lg p-0.5">
          {CHAIN_IDS.map((id) => {
            const info = CHAIN_INFO[id]
            const isActive = chainId === id
            return (
              <button
                key={id}
                onClick={() => setChainId(id)}
                title={info.name}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors border-none',
                  isActive
                    ? 'text-black'
                    : 'text-muted-foreground bg-transparent hover:text-foreground'
                )}
                style={isActive ? { background: info.color } : undefined}
              >
                {info.name}
              </button>
            )
          })}
        </div>

        <a
          href="https://exchange.lux.network"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 text-[13px] text-muted-foreground no-underline border border-border rounded-lg hover:text-foreground transition-colors"
        >
          Exchange
        </a>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">
              {address ? shortenAddress(address) : ''}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => disconnect()}
              title="Disconnect"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="connect"
            size="sm"
            onClick={() => connect({ connector: injected() })}
          >
            <Wallet className="h-4 w-4" />
            Connect
          </Button>
        )}
      </div>
    </header>
  )
}

'use client'

import { AppNav } from '@luxfi/ui'
import { LogOut, Wallet } from '@luxfi/ui/icons'
import { usePathname } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Button } from '@/components/ui/button'
import { useChain } from '@/hooks/chain'
import { cn, shortenAddress } from '@/lib/utils'

// The chrome is `AppNav` from @luxfi/ui — brand, org switcher, links, settings
// and the user menu, identical to every other Lux surface. The chain selector
// and the wallet button sit in its free slot: they are this surface's own
// controls, not chrome. A wallet is not an account.

const LINKS = [
  { href: '/collections', label: 'Collections' },
  { href: '/activity', label: 'Activity' },
  { href: '/pools', label: 'Pools' },
  { href: '/genesis', label: 'Genesis' },
  { href: '/launches', label: 'Launches' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/launch', label: 'Apply' },
]

/** Which chain the screens read. The list is the registry's, never a constant. */
function ChainSelector() {
  const state = useChain()
  if (state.status !== 'ready') return null
  return (
    <div className="hidden gap-0.5 rounded-lg bg-card p-0.5 sm:flex">
      {state.chains.map((c) => (
        <button
          key={c.slug}
          onClick={() => state.select(c.slug)}
          title={c.name}
          className={cn(
            'cursor-pointer rounded-md border-none px-2.5 py-1.5 text-xs font-semibold transition-colors',
            c.slug === state.chain.slug
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {c.coin}
        </button>
      ))}
    </div>
  )
}

/** The wallet that signs, distinct from the IAM account in the menu above it. */
function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <Button variant="connect" size="sm" onClick={() => connect({ connector: injected() })}>
        <Wallet className="h-4 w-4" />
        Connect
      </Button>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm text-muted-foreground">
        {address ? shortenAddress(address) : ''}
      </span>
      <Button variant="ghost" size="icon" onClick={() => disconnect()} title="Disconnect wallet">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const state = useChain()
  return (
    <AppNav
      brand="Lux Market"
      links={LINKS.map((l) => ({ ...l, active: pathname === l.href || pathname.startsWith(`${l.href}/`) }))}
    >
      <ChainSelector />
      {/* wagmi mounts only once the registry has named the chains it can reach. */}
      {state.status === 'ready' ? <WalletButton /> : null}
    </AppNav>
  )
}

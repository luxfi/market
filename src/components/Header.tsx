'use client'

import { AppNav } from '@luxfi/ui'
import { usePathname } from 'next/navigation'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useChainContext } from '@/hooks/useChain'
import { CHAIN_INFO } from '@/lib/chains'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut } from '@luxfi/ui/icons'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/lib/utils'

// The chrome is `AppNav` from @luxfi/ui — brand, org switcher, links, settings
// and the user menu, identical to every other Lux surface. What used to be here
// was a second header: its own sticky bar, its own link styling, a `flex` nav
// with no phone presentation at all, and a wallet control standing in for an
// account menu it did not have.
//
// The chain selector and the wallet button stay, in the nav's free slot: they
// are this surface's own controls, not chrome. A wallet is not an account.

const NAV_LINKS = [
  { href: '/', label: 'Explore' },
  { href: '/collections', label: 'Collections' },
  { href: '/activity', label: 'Activity' },
  { href: '/genesis', label: 'Genesis' },
  { href: '/portfolio', label: 'Portfolio' },
]

const CHAIN_IDS = [96369, 200200, 36963, 36911, 494949]

/** Which chain the marketplace reads — a market control, not chrome. */
function ChainSelector() {
  const { chainId, setChainId } = useChainContext()
  return (
    <div className="hidden gap-0.5 rounded-lg bg-card p-0.5 sm:flex">
      {CHAIN_IDS.map((id) => {
        const info = CHAIN_INFO[id]
        const isActive = chainId === id
        return (
          <button
            key={id}
            onClick={() => setChainId(id)}
            title={info.name}
            className={cn(
              'cursor-pointer rounded-md border-none px-2.5 py-1.5 text-xs font-semibold transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {info.name}
          </button>
        )
      })}
    </div>
  )
}

/** The wallet that signs listings — distinct from the IAM account above it. */
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
  return (
    <AppNav
      brand="Lux Market"
      links={NAV_LINKS.map((l) => ({
        ...l,
        active: l.href === '/' ? pathname === '/' : pathname.startsWith(l.href),
      }))}
    >
      <ChainSelector />
      <WalletButton />
    </AppNav>
  )
}

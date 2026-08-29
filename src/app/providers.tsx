'use client'

import { AppProvider } from '@luxfi/ui'
import { AuthProvider } from '@luxfi/ui/auth'
import { QueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Chain as ViemChain } from 'viem'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ChainContext, type ChainState } from '@/hooks/chain'
import { readChains, type Chain } from '@/lib/registry'

// Two identities meet on this surface and they are NOT the same thing:
//
//   the WALLET  — wagmi, an address, what signs a transaction;
//   the ACCOUNT — IAM, who you are, which org you act in.
//
// `AppProvider` carries the white-label (brand, gui theme, OIDC issuer, IAM
// client — all from the Host header) and `AuthProvider` the account: the
// identity read AND the PKCE login, in one component, exactly as every other
// Lux surface does. Wallet state sits inside both.
//
// The chain list sits inside all three, because it is read rather than
// declared. Until the registry answers there is no wagmi config to build, so
// the provider publishes what it knows — reading, failed, or ready — and the
// screens that need a chain say which of the three they are in.

function viemChain(c: Chain): ViemChain {
  return {
    id: c.id,
    name: c.name,
    nativeCurrency: { name: c.coin, symbol: c.coin, decimals: 18 },
    rpcUrls: { default: { http: [c.rpc!] } },
    ...(c.explorer
      ? { blockExplorers: { default: { name: 'Explore', url: c.explorer } } }
      : {}),
  }
}

/** Only chains with a browser-reachable RPC can carry a transaction. */
function wagmi(chains: Chain[]) {
  const reachable = chains.filter((c) => c.rpc).map(viemChain)
  return createConfig({
    chains: reachable as [ViemChain, ...ViemChain[]],
    connectors: [injected()],
    transports: Object.fromEntries(reachable.map((c) => [c.id, http(c.rpcUrls.default.http[0])])),
  })
}

// Local dev has no brand to resolve from `localhost` — name the host the surface
// stands in for. Unset in every deployment, where the real Host header answers.
const DEV_HOST = process.env.NEXT_PUBLIC_HOST

function Wallet({ chains, children }: { chains: Chain[]; children: ReactNode }) {
  const [config] = useState(() => wagmi(chains))
  return <WagmiProvider config={config}>{children}</WagmiProvider>
}

export function Providers({ children }: { children: ReactNode }) {
  const [chains, setChains] = useState<Chain[] | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [host, setHost] = useState<string | undefined>(undefined)

  // ONE query cache for the surface: AppProvider owns the provider, so wagmi
  // and the chrome share a client instead of running two.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 2, staleTime: 60_000 } },
      }),
  )

  useEffect(() => {
    const real = window.location.host
    const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(real)
    setHost(local && DEV_HOST ? DEV_HOST : real)
  }, [])

  useEffect(() => {
    let live = true
    readChains()
      .then((c) => live && setChains(c))
      .catch((e: Error) => live && setFailure(e.message))
    return () => {
      live = false
    }
  }, [])

  const select = useCallback((next: string) => setSlug(next), [])

  const state = useMemo<ChainState>(() => {
    if (failure) return { status: 'failed', reason: failure }
    if (!chains?.length) return { status: 'reading' }
    const chain = chains.find((c) => c.slug === slug) ?? chains[0]
    return { status: 'ready', chain, chains, select }
  }, [chains, failure, select, slug])

  return (
    <AppProvider host={host} queryClient={queryClient}>
      <AuthProvider redirect="/">
        <ChainContext.Provider value={state}>
          {chains?.length ? <Wallet chains={chains}>{children}</Wallet> : children}
        </ChainContext.Provider>
      </AuthProvider>
    </AppProvider>
  )
}

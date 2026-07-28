'use client'

import { AppProvider } from '@luxfi/ui'
import { AuthProvider } from '@luxfi/ui/auth'
import { QueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ChainContext } from '@/hooks/useChain'
import { supportedChains } from '@/lib/chains'

// Two identities meet on this surface and they are NOT the same thing:
//
//   the WALLET  — wagmi, an address, what signs a listing;
//   the ACCOUNT — IAM, who you are, which org you act in.
//
// The market had only the first, so its header was a Connect button and there
// was no way to tell lux.market from zoo.market except the copy. `AppProvider`
// carries the white-label (brand, gui theme, OIDC issuer, IAM client — all from
// the Host header) and `AuthProvider` the account — the identity read AND the
// PKCE login, in ONE component, exactly as every other Lux surface does. This
// file used to repeat `configureIam` + `startLogin` + `logout` verbatim from
// lux/mpc/dashboard; that flow now lives in @luxfi/ui/auth. Wallet state stays
// where it was.

function createWagmiConfig() {
  return createConfig({
    chains: supportedChains,
    connectors: [injected()],
    transports: Object.fromEntries(supportedChains.map((c) => [c.id, http()])) as any,
    ssr: true,
  })
}

// Local dev has no brand to resolve from `localhost` — name the host the surface
// stands in for. Unset in every deployment, where the real Host header answers.
const DEV_HOST = process.env.NEXT_PUBLIC_HOST

export function Providers({ children }: { children: ReactNode }) {
  const [chainId, setChainId] = useState(96369)
  const [config] = useState(() => createWagmiConfig())
  // ONE query cache for the surface: AppProvider owns the provider, so wagmi
  // and the chrome share a client instead of running two.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 2, staleTime: 60_000 } },
  }))
  const [host, setHost] = useState<string | undefined>(undefined)

  useEffect(() => {
    const real = window.location.host
    const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(real)
    setHost(local && DEV_HOST ? DEV_HOST : real)
  }, [])

  return (
    <AppProvider host={host} queryClient={queryClient}>
      <AuthProvider redirect="/">
        <WagmiProvider config={config}>
          <ChainContext.Provider value={{ chainId, setChainId }}>
            {children}
          </ChainContext.Provider>
        </WagmiProvider>
      </AuthProvider>
    </AppProvider>
  )
}

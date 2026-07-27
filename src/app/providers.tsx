'use client'

import { configureIam, logout, startLogin } from '@hanzo/iam/browser'
import { AppProvider, IdentityProvider } from '@luxfi/ui'
import { resolveWhiteLabel } from '@luxfi/ui/white-label'
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
// the Host header) and `IdentityProvider` the account, exactly as every other
// Lux surface does. Wallet state stays where it was.

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
    const resolved = local && DEV_HOST ? DEV_HOST : real
    setHost(resolved)
    const wl = resolveWhiteLabel(resolved)
    configureIam({ issuer: wl.issuer, clientId: wl.clientId })
  }, [])

  return (
    <AppProvider host={host} queryClient={queryClient}>
      <IdentityProvider
        auth={{
          signIn: () => void startLogin({ redirect: '/' }),
          signOut: () => void logout(),
        }}
      >
        <WagmiProvider config={config}>
          <ChainContext.Provider value={{ chainId, setChainId }}>
            {children}
          </ChainContext.Provider>
        </WagmiProvider>
      </IdentityProvider>
    </AppProvider>
  )
}

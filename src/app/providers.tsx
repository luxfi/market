'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { ChainContext } from '@/hooks/useChain'
import { supportedChains } from '@/lib/chains'

function createWagmiConfig() {
  return createConfig({
    chains: supportedChains,
    connectors: [injected()],
    transports: Object.fromEntries(supportedChains.map((c) => [c.id, http()])) as any,
    ssr: true,
  })
}

export function Providers({ children }: { children: ReactNode }) {
  const [chainId, setChainId] = useState(96369)
  const [config] = useState(() => createWagmiConfig())
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 2, staleTime: 60_000 } },
  }))

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChainContext.Provider value={{ chainId, setChainId }}>
          {children}
        </ChainContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

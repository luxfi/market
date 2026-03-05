import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { supportedChains } from './chains'

export const config = createConfig({
  chains: supportedChains,
  connectors: [injected()],
  transports: Object.fromEntries(supportedChains.map((c) => [c.id, http()])) as any,
  ssr: true,
})

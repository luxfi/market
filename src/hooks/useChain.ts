import { createContext, useContext } from 'react'

export type ChainContextValue = {
  chainId: number
  setChainId: (id: number) => void
}

export const ChainContext = createContext<ChainContextValue>({
  chainId: 96369,
  setChainId: () => {},
})

export function useChainContext(): ChainContextValue {
  return useContext(ChainContext)
}

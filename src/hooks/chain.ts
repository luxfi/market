'use client'

import { createContext, useContext } from 'react'
import type { Chain } from '@/lib/registry'

// Which chain a screen reads is one piece of state for the whole surface, and
// it is a whole registry record rather than an id: a screen needs the slug to
// reach the indexer, the id to reach a contract, the coin to label a figure and
// the explorer to link out. Looking each of those up separately is how a
// second, disagreeing chain list gets born.
//
// The registry is read, so the state has three shapes and not one. A screen
// that treats "not yet" as "none" prints an empty list where it should print a
// sentence, which is the whole failure this app is being rebuilt away from.
export type ChainState =
  | { status: 'reading' }
  | { status: 'failed'; reason: string }
  | { status: 'ready'; chain: Chain; chains: Chain[]; select: (slug: string) => void }

export const ChainContext = createContext<ChainState | null>(null)

export function useChain(): ChainState {
  const state = useContext(ChainContext)
  if (!state) throw new Error('useChain outside the chain provider')
  return state
}

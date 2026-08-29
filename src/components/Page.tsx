'use client'

import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { useChain } from '@/hooks/chain'
import type { ChainState } from '@/hooks/chain'

// Every screen is chrome, a title, an introduction and a body, and the ones
// that read a chain are also three states rather than one: the registry has not
// answered yet, it did not answer, or here is the chain we read. Writing that
// out eight times is eight chances for one screen to quietly drop the
// distinction, so it is written once and a page hands in a function to say it
// needs a chain. What a page then says it read is the page's own business —
// most read the selected chain, holdings reads every one — so the provenance
// line is a component a page places, not a sentence this shell assumes.

/** The registry answered. A page body only ever runs in this state. */
type Ready = Extract<ChainState, { status: 'ready' }>

function Reading() {
  return (
    <Card className="p-6 text-sm text-muted-foreground">Reading the chain registry…</Card>
  )
}

function Failed({ reason }: { reason: string }) {
  return (
    <Card className="space-y-3 p-6">
      <div className="font-semibold">The chain registry did not answer.</div>
      <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        Which chains exist, what they are called and where their nodes are is read from the
        indexer&rsquo;s registry rather than kept in a list here, so nothing on this page is known
        until that read succeeds. The request failed with{' '}
        <code className="font-mono text-xs">{reason}</code>.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="cursor-pointer text-sm font-medium hover:underline"
      >
        Try again
      </button>
    </Card>
  )
}

export function Page({
  title,
  intro,
  children,
}: {
  title: string
  intro?: ReactNode
  children: ReactNode | ((chain: Ready) => ReactNode)
}) {
  const state = useChain()
  const needsChain = typeof children === 'function'

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">{title}</h1>
        {intro ? (
          <div className="mb-6 max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
            {intro}
          </div>
        ) : null}

        {!needsChain ? (
          (children as ReactNode)
        ) : state.status === 'reading' ? (
          <Reading />
        ) : state.status === 'failed' ? (
          <Failed reason={state.reason} />
        ) : (
          (children as (chain: Ready) => ReactNode)(state)
        )}
      </main>
      <Footer />
    </div>
  )
}

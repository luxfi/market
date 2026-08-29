'use client'

import Link from 'next/link'
import { H2, P } from './parts'

export default function SupportPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Support</h1>
      <P>
        Lux Market reads the Lux chains and prints what it finds. It holds no assets, signs nothing,
        quotes no prices and reviews nothing. Most questions people arrive with turn out to be
        questions about that boundary, so these pages draw it rather than restating a feature list.
      </P>

      <H2>Where each answer lives</H2>
      <P>
        <Link className="text-foreground hover:underline" href="/support/projects">
          For projects
        </Link>{' '}
        — how a contract gets on this site, what the indexer can and cannot see about it, why there
        is nothing to trade here yet, and what raising money on Lux would require.
      </P>
      <P>
        <Link className="text-foreground hover:underline" href="/support/buyers">
          For participants
        </Link>{' '}
        — what a row on the launches page means, what it does not mean, and how to check every claim
        on this site yourself without asking us.
      </P>
      <P>
        <Link className="text-foreground hover:underline" href="/support/terms">
          Terms
        </Link>{' '}
        and{' '}
        <Link className="text-foreground hover:underline" href="/support/privacy">
          privacy
        </Link>{' '}
        — what using this website commits you to, and what it collects. The short version of the
        second one is nothing.
      </P>

      <H2>Reaching a person</H2>
      <P>
        <a className="text-foreground hover:underline" href="mailto:support@lux.network">
          support@lux.network
        </a>{' '}
        goes to people who build this. If you are applying to launch,{' '}
        <Link className="text-foreground hover:underline" href="/launch">
          the application
        </Link>{' '}
        writes the message for you, but it is a convenience and not a gate — a plain email works
        just as well.
      </P>
      <P>
        A security problem goes to{' '}
        <a className="text-foreground hover:underline" href="mailto:security@lux.network">
          security@lux.network
        </a>{' '}
        instead, where it is read by the people who can act on it.
      </P>
    </>
  )
}

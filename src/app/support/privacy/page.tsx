'use client'

import Link from 'next/link'
import { H2, P } from '../parts'

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Privacy</h1>
      <P>
        This is short because there is little to describe. lux.market is a static site: the pages
        are files, there is no server behind them, no database and no account record of your
        activity. Almost everything below is about what your browser reaches out to on its own, not
        about what we collect.
      </P>

      <H2>No analytics, no tracking</H2>
      <P>
        There is no analytics package in this site, of any kind — no product analytics, no session
        recording, no advertising pixel, no fingerprinting. Nobody is measuring which pages you read
        or how long you stayed, and there is no profile of you here to share, sell or lose.
      </P>

      <H2>What your browser contacts</H2>
      <P>
        Reading a page makes your browser fetch data directly from the Lux indexer at
        api-explore.lux.network and, where a page reads a contract, from a chain&rsquo;s public
        JSON-RPC endpoint. Those hosts see what any web server sees: your IP address, the request,
        and roughly when. That happens between you and them; the data does not pass through us on
        the way.
      </P>
      <P>
        Fonts are served from this site rather than fetched from a font host at page load. Where a
        page displays an image stored elsewhere — on IPFS or a project&rsquo;s own host — loading it
        tells that host you asked for it, which is true of every image on the web.
      </P>

      <H2>Browser storage</H2>
      <P>
        Signing in stores an access token in your browser&rsquo;s local storage, scoped to this
        host, so a reload does not sign you out. Signing out clears it. Interface preferences may be
        stored the same way. This is storage on your machine, readable by this site and by you, and
        it is not transmitted anywhere except to Hanzo IAM when a request needs to prove who you
        are.
      </P>

      <H2>Signing in</H2>
      <P>
        Identity is Hanzo IAM. When you sign in, this site learns your display name, your email
        address and the organizations you can act in, and it uses them to fill in{' '}
        <Link className="text-foreground hover:underline" href="/launch">
          an application
        </Link>{' '}
        so that the name on it is one somebody signed in as. It writes none of that anywhere. What
        IAM itself records about a login is governed by Hanzo IAM rather than by this page.
      </P>

      <H2>Your wallet</H2>
      <P>
        Connecting a wallet lets the page read the address you chose to expose. That address stays
        in the page. It is not sent to us, logged, or associated with your account, and this site
        cannot move anything the wallet holds.
      </P>

      <H2>The application form</H2>
      <P>
        It transmits nothing. The page writes the application out as text, you read it, and you send
        it from your own mail client. Nothing you type is stored on this site or seen by anyone
        until you choose to send it — and once you send it, it is an email, held the way email is
        held.
      </P>

      <H2>What is public regardless</H2>
      <P>
        A blockchain address and its whole transaction history are public, permanent, and readable
        by anyone without our involvement. Nothing on this page changes that, and no privacy policy
        anywhere can.
      </P>

      <H2>Asking about this</H2>
      <P>
        <a className="text-foreground hover:underline" href="mailto:privacy@lux.network">
          privacy@lux.network
        </a>
        . There is unlikely to be data of yours to hand over or delete, since there is no store to
        hold it, but the question is a fair one and gets a straight answer.
      </P>
    </>
  )
}

'use client'

import Link from 'next/link'
import { H2, P } from '../parts'

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">Terms</h1>
      <P>
        These terms cover your use of the lux.market website. They are not a contract about any
        asset, chain or contract you reach through it, and they create no relationship between you
        and anyone whose project appears here.
      </P>

      <H2>What this site is</H2>
      <P>
        An information service. It reads public blockchain data through a public indexer and public
        JSON-RPC endpoints and displays what it reads. It also provides a way to write to us.
      </P>

      <H2>What it is not</H2>
      <P>
        It is not a broker, dealer, exchange, alternative trading system, transfer agent, investment
        adviser, custodian or money transmitter, and it does not act as agent for any issuer. It
        does not hold, control or have access to your assets or your keys. It does not match orders,
        take orders, hold funds or settle trades. No transaction is executed by this site.
      </P>
      <P>
        Nothing on this site is an offer to sell, a solicitation of an offer to buy, investment
        advice, legal advice, tax advice, a recommendation about any asset or transaction, an
        endorsement of any project, or an opinion about whether any asset is a security. No content
        here should be relied on for any of those purposes.
      </P>

      <H2>Listing carries no meaning</H2>
      <P>
        Contracts appear on this site because a public indexer recorded them on a public chain, not
        because anyone selected them. Appearing here is not a review, an approval, a verification or
        a partnership, and their absence is not a judgment either.{' '}
        <Link className="text-foreground hover:underline" href="/support/buyers">
          For participants
        </Link>{' '}
        explains what a listing does and does not tell you.
      </P>

      <H2>Accuracy</H2>
      <P>
        The data shown comes from third-party infrastructure that can be wrong, stale, incomplete or
        unavailable, and this site can render it incorrectly. It is provided as-is and as-available,
        without warranty of any kind, and you should verify anything you intend to act on against
        the chain itself. Where this site cannot read something, it is written here to say so rather
        than to display a zero, but that is an intention rather than a guarantee.
      </P>

      <H2>Your wallet and your transactions</H2>
      <P>
        You are responsible for your keys, your wallet software and every transaction you sign.
        Blockchain transactions are irreversible; neither Lux nor anyone else can undo one for you.
        Where this site ever prepares a transaction, it is yours to review and yours to sign, and
        signing it is your decision alone.
      </P>

      <H2>Other people&rsquo;s things</H2>
      <P>
        This site links to block explorers, chains, contracts, projects and documents operated by
        others. Those are not under our control and we make no representation about them. Following
        such a link puts you in someone else&rsquo;s hands.
      </P>

      <H2>Your account</H2>
      <P>
        Signing in uses Hanzo IAM. You are responsible for keeping your credentials secure and for
        what is done under your session. Access may be suspended where it is being used to attack
        the service or others.
      </P>

      <H2>Acceptable use</H2>
      <P>
        Do not use this site to break the law, to impersonate anyone, to misrepresent your
        relationship with Lux, or to attack, overload or reverse the service&rsquo;s protections.
        Automated reading is fine at a rate that does not degrade the service for other people.
      </P>

      <H2>Compliance is yours</H2>
      <P>
        Whether you may lawfully acquire, hold or dispose of any asset, and what you must report to
        whom, depends on where you are and who you are. That determination is yours to make with
        your own advisers. This site does not make it for you and does not screen you against it.
      </P>

      <H2>Changes</H2>
      <P>
        This site changes, and so do these terms. The current version is the one on this page. If a
        change matters, continuing to use the site after it is how you accept it.
      </P>

      <H2>Reaching us</H2>
      <P>
        <a className="text-foreground hover:underline" href="mailto:support@lux.network">
          support@lux.network
        </a>{' '}
        for the service,{' '}
        <a className="text-foreground hover:underline" href="mailto:legal@lux.network">
          legal@lux.network
        </a>{' '}
        for anything about these terms, and{' '}
        <a className="text-foreground hover:underline" href="mailto:security@lux.network">
          security@lux.network
        </a>{' '}
        for a vulnerability.
      </P>
    </>
  )
}

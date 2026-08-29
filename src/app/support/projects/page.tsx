'use client'

import Link from 'next/link'
import { H2, P } from '../parts'

export default function ProjectsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">For projects</h1>
      <P>
        Written for whoever is deciding whether to build on Lux. It is a description of what is
        there, including the parts that are missing, because finding those out after you have
        deployed is the expensive way.
      </P>

      <H2>Getting listed takes no application</H2>
      <P>
        Deploy a contract on any Lux chain and it appears on{' '}
        <Link className="text-foreground hover:underline" href="/launches">
          launches
        </Link>{' '}
        on its own. The indexer records every contract on every chain and this site prints what the
        indexer returns — there is no curated list, no approval, no fee and no way to be excluded.
        Nothing you can apply for is nothing you can be turned down for.
      </P>
      <P>
        Read the other half of that too. Because nobody approves a listing, a listing approves
        nothing. Lux has not looked at your contract, and a participant who reads a row as a signal
        that we did has been misled by the page rather than by you.
      </P>

      <H2>What the indexer sees, and what it does not</H2>
      <P>
        Collection-level facts are the ones that answer. Name, symbol, standard, total supply, the
        transfers it has recorded, and what any given address holds all come back, and the site
        prints them.
      </P>
      <P>
        Two of them need reading carefully rather than trusting. The transfer resource serves a page
        rather than a history, so a collection with more transfers than fit is showing a window and
        this site says which. And the holders resource returns one row per held item on a
        collection, not one per holder — the Uniswap position manager comes back as fifty rows that
        are all the same address — so a holder count taken straight from it is a count of tokens.
        The collection page folds the rows by address before it counts them, which is why the number
        there and the one the indexer reports differ.
      </P>
      <P>
        Item-level facts do not exist server-side, and this is the gap worth knowing about before
        you plan around it. The indexer never populates per-item records for any collection: ask it
        for the instances of a token and it returns an empty list whether the collection has three
        items or a hundred and forty-nine. There is no per-item image, no trait, no owner and no
        token URI held anywhere but the chain itself.
      </P>
      <P>
        One field causes most of it. Every ERC-721 transfer carries its token id in the log, and the
        indexer writes the fungible shape instead — a value of one and a null id — so the id is
        discarded on the way in. That is why a transfer feed renders rows nobody can tell apart. It
        is a defect on our side rather than a property of your collection, it is a small change in
        the indexer, and reporting it through{' '}
        <Link className="text-foreground hover:underline" href="/launch">
          an application
        </Link>{' '}
        is a legitimate use of that form.
      </P>

      <H2>There is nothing to trade here</H2>
      <P>
        No marketplace contract is deployed on any Lux chain. The source exists — Market.sol lives
        in the Lux standard library with listings, offers and royalty payouts written — and it has
        never been deployed anywhere. So there are no listings, no offers, no sales, no floor
        prices, and no history of any of those to show.
      </P>
      <P>
        Two claims that have circulated are worth correcting directly, because a project might build
        against them. There is no NFT precompile on the C-Chain: the Lux precompile tree holds
        roughly fifty modules and none of them is ERC-721 or ERC-1155. And nothing on Lux enforces
        royalties at the protocol level, because a protocol-level enforcement point would have to be
        that precompile. If royalties matter to your design, they are yours to enforce in your own
        contract today.
      </P>

      <H2>Raising money is not something this venue can do</H2>
      <P>
        An offering needs three things Lux Market does not have. A contract that counts what an
        issuer has taken and reverts the purchase that would cross the ceiling, keyed to the issuer
        rather than to one sale, so two contracts cannot quietly admit twice the cap. A register of
        whether the issuer is current on the reports its exemption depends on, read before any
        transaction is prepared and failing to <em>unknown</em> rather than to <em>fine</em> when it
        cannot be read. And a signed record, written when the offering opens, of what the issuer
        promised — because completion is a relation between two records and the first one cannot be
        reconstructed years later from press releases.
      </P>
      <P>
        LP-3120 <em>Regulation Crypto Assets Offerings</em> and LP-3121{' '}
        <em>The commitment record and safe-harbor certification</em> specify all three. Both are
        drafts, neither is built, and neither is published yet on{' '}
        <a
          className="text-foreground hover:underline"
          href="https://lps.lux.network/docs/"
          target="_blank"
          rel="noreferrer"
        >
          lps.lux.network
        </a>
        . Until they are, an offering conducted here would be one nobody could audit afterwards,
        including us, and that is the reason not to run one rather than a queue you are waiting in.
      </P>

      <H2>What we will not do, whatever we are asked</H2>
      <P>
        We will not rank you, feature you, badge you, put you in a carousel or call you trending.
        Those are endorsements of an offering and a venue that does not review anything has no
        standing to make one. The launches page sorts alphabetically by default for exactly this
        reason.
      </P>
      <P>
        We will not tell you whether your token is a security, whether an exemption is open to you,
        whether two of your offerings integrate, or whether anyone on your team is disqualified from
        relying on one. We hold most of the inputs to each of those, which is precisely why
        answering them would make us your adviser instead of your infrastructure. Those questions
        have lawyers.
      </P>
      <P>
        We will not take a share of what you raise, and there is no arrangement in which Lux earns
        more because your launch is larger. Nothing on this site is priced against your outcome.
      </P>

      <H2>Reaching us</H2>
      <P>
        <Link className="text-foreground hover:underline" href="/launch">
          The application
        </Link>{' '}
        composes the message and reads your contract address on the chain you name while you type,
        so the note that arrives already carries an observed fact rather than a claim. A plain email
        to{' '}
        <a className="text-foreground hover:underline" href="mailto:support@lux.network">
          support@lux.network
        </a>{' '}
        does the same job.
      </P>
    </>
  )
}

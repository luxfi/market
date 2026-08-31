'use client'

import Link from 'next/link'
import { H2, P } from '../parts'

export default function BuyersPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">For participants</h1>
      <P>
        Written for whoever is considering putting money into something they found through Lux. The
        useful thing this page can do is tell you what our involvement amounts to, which is less
        than the word &ldquo;market&rdquo; suggests.
      </P>

      <H2>What a row on the launches page means</H2>
      <P>
        It means the indexer recorded a contract at that address on that chain. That is the entire
        claim. It does not mean the project is real, the team exists, the code was audited, the
        supply is what anyone says it is, or that a single person at Lux has looked at it. Contracts
        arrive on the page by being deployed, which anyone can do for the cost of gas.
      </P>
      <P>
        Everything in a row comes off the chain: the name and symbol the contract reports, the
        standard it implements, and the number of addresses holding it. A name is a string the
        deployer chose. Two contracts on two chains can carry the same name, and one of them can be
        an imitation of the other.
      </P>

      <H2>There are no prices here</H2>
      <P>
        No price, no market cap, no floor and no valuation appears anywhere on this site. The
        indexer returns fields for a rate and a market cap, and nothing computes either, so they are
        null and zero on every chain. Rendering an empty field as a number is how a site ends up
        quoting a price nobody quoted, and the whole point of an empty column is that it stays
        empty.
      </P>
      <P>
        There is also no trading. No marketplace contract is deployed on any Lux chain, so there
        have been no listings, no offers and no sales through this venue — not few, none.
      </P>

      <H2>Nobody here is vetting anything</H2>
      <P>
        Lux does not review, approve, endorse, rank or recommend anything that appears on this site,
        and has no mechanism to. If you encounter a claim that Lux has vetted a project, verified a
        team, guaranteed a return or partnered on an offering, that claim did not come from a
        process that exists. Treat it as a reason to be more careful rather than less.
      </P>
      <P>
        The same holds for us. Nothing on these pages is advice, a recommendation, an offer, or a
        solicitation to buy or sell anything, and none of it is a judgment about whether an asset is
        a security or what it is worth.
      </P>

      <H2>Your keys stay yours</H2>
      <P>
        This site holds no assets and takes no custody. Connecting a wallet lets the page read your
        address; it does not let the page move anything. Nothing here signs a transaction or
        broadcasts one — where a transaction is ever prepared, your own wallet is what signs it, and
        you can read the calldata before you approve. Anyone asking for a seed phrase or a private
        key on behalf of Lux is stealing from you.
      </P>

      <H2>Checking this site instead of believing it</H2>
      <P>
        Every figure here comes from two public sources you can query directly, which means you
        never have to take our word for any of it.
      </P>
      <P>
        The chains publish JSON-RPC at <code className="font-mono text-xs">/v1/chain/C/rpc</code> on
        each network&rsquo;s API host. Calling{' '}
        <code className="font-mono text-xs">eth_getCode</code> on an address tells you whether a
        contract exists there at all, and an empty result means nothing is deployed no matter what
        any site says about it. The block explorers read the same chains and show supply, holders
        and transfers straight from the contract.
      </P>
      <P>
        If our numbers and the chain&rsquo;s disagree, the chain is right and we have a bug. Send it
        to{' '}
        <a className="text-foreground hover:underline" href="mailto:support@lux.network">
          support@lux.network
        </a>
        .
      </P>

      <H2>The risk, without hedging</H2>
      <P>
        Assets on these chains can lose all of their value, can be impossible to sell at any price,
        and can be issued by people who never intended to deliver anything. Code can hold a mistake
        nobody noticed and a contract can be upgradeable by someone who has not said so. A
        transaction confirmed on a chain cannot be reversed by us, by the issuer, or by anyone.
        Assume you can lose everything you commit, because that outcome is common and this site
        cannot prevent it.
      </P>
      <P>
        None of this is a forecast and none of it is advice about your circumstances.{' '}
        <Link className="text-foreground hover:underline" href="/support/terms">
          The terms
        </Link>{' '}
        say the same thing in the register a lawyer expects.
      </P>
    </>
  )
}

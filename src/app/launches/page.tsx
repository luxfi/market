'use client'

import Link from 'next/link'
import { LaunchTable } from '@/components/LaunchTable'
import { Page } from '@/components/Page'
import { Card } from '@/components/ui/card'

export default function LaunchesPage() {
  return (
    <Page
      title="Launches"
      intro="Two different things get called a launch and this page keeps them apart. One is an offering — money raised from people who receive an asset in return. The other is a contract appearing on a chain. Lux Market has never hosted the first. The second is below, read live from every Lux chain at once."
    >
      <Card className="mb-10 max-w-[76ch] space-y-3 p-6">
        <h2 className="font-semibold">No offering has been conducted through Lux Market.</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Not a small number — none, ever. Saying so is easier than the alternative, because the
          machinery an offering needs is not built. There is no contract that counts what an issuer
          has raised and refuses the purchase that would cross the ceiling. There is no register of
          whether an issuer is current on the reports its exemption depends on. There is no signed
          record of what an issuer promised at the moment it opened. Until those exist, an offering
          conducted here would be one nobody could check afterwards, including us.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          LP-3120 <em>Regulation Crypto Assets Offerings</em> and LP-3121{' '}
          <em>The commitment record and safe-harbor certification</em> specify that machinery. Both
          are drafts and neither is published on{' '}
          <a
            className="hover:underline"
            href="https://lps.lux.network/docs/"
            target="_blank"
            rel="noreferrer"
          >
            lps.lux.network
          </a>{' '}
          yet. They also set the rule this page follows: when an offering does open here it appears
          in the order it opened, and no offering is ever ranked, featured, badged or recommended by
          us.
        </p>
      </Card>

      <h2 className="mb-2 text-xl font-semibold">Token contracts observed on chain</h2>
      <p className="mb-2 max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        Every row is a contract the Lux indexer has recorded. That is the whole of what a row means.
        It is not an offering, not a listing, not a review, and not a sign that anyone at Lux has
        looked at it. Nothing appears here by application and nothing can be removed by request —
        the indexer records what is on the chain, and this page prints what the indexer returns.
      </p>
      <p className="mb-6 max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        Sort by any column you like. The order this arrives in is alphabetical because a default
        that puts one project at the top would be a recommendation we are not entitled to make.
      </p>
      <p className="mb-6 max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        Holders counts the addresses holding a fungible token. It is blank on a collection on
        purpose: the indexer records one row per held item there rather than one per holder, so the
        figure it returns is not the same measurement and does not belong in the same column. A
        collection&rsquo;s holders are counted, one by one, on its own page.
      </p>

      <LaunchTable />

      <Card className="mt-8 max-w-[76ch] space-y-3 p-6">
        <h3 className="text-sm font-semibold">What is missing here on purpose</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The indexer returns a <code className="font-mono text-xs">reputation</code> field, a{' '}
          <code className="font-mono text-xs">circulating_market_cap</code> and an{' '}
          <code className="font-mono text-xs">exchange_rate</code> on every token. Nothing computes
          them: reputation and exchange rate are null on every chain and market cap is the string
          zero. A grade nobody assigned and a price nobody quoted are worse than no column at all,
          so there is no column.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Supply is absent for a different reason. A raw supply means nothing without the decimals
          it is quoted in, and the two do not sit still: Lux&rsquo;s tokens declare eighteen, while
          several on Zoo declare zero on the contract itself, so the same figure in one column would
          be a quantity of whole tokens on one row and of the smallest unit on the next. The
          collection page carries a collection&rsquo;s item count, where the unit is not in doubt.
        </p>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground">
        Building something and wondering how it gets here?{' '}
        <Link className="text-foreground hover:underline" href="/launch">
          Apply to launch
        </Link>{' '}
        — or read{' '}
        <Link className="text-foreground hover:underline" href="/support/projects">
          what a project needs to know
        </Link>{' '}
        first.
      </p>
    </Page>
  )
}

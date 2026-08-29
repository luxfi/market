'use client'

import Link from 'next/link'
import { LaunchForm } from '@/components/LaunchForm'
import { Page } from '@/components/Page'
import { Card } from '@/components/ui/card'

export default function LaunchPage() {
  return (
    <Page
      title="Apply to launch"
      intro="Start here if you are building something and want it on Lux. Read the next paragraph first, though, because it will save some people the trip."
    >
      <Card className="mb-8 max-w-[76ch] space-y-3 p-6">
        <h2 className="font-semibold">
          If your only question is how to get listed, you already are.
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Deploy a token or a collection on any Lux chain and it turns up on{' '}
          <Link className="text-foreground hover:underline" href="/launches">
            launches
          </Link>{' '}
          within a block or two, because the indexer records every contract and this site prints
          what the indexer returns. There is no list to be added to, no queue, no review and no fee.
          That also means being on the page carries no endorsement — nobody looked at it, including
          us.
        </p>
      </Card>

      <h2 className="mb-2 text-xl font-semibold">What an application is actually for</h2>
      <p className="mb-2 max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        Everything a contract cannot do by existing. Deploying a token when you have not deployed
        one before. Running your own L1 rather than borrowing someone else&rsquo;s chain. A contract
        that is live but reads wrong here — the indexer drops the token id off every ERC-721
        transfer, so an activity feed full of anonymous rows is a bug on our side and we want to
        hear about it. And raising money, which is the one we cannot do for you yet and say so
        plainly on the way past.
      </p>
      <p className="mb-8 max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
        An application is a conversation, not a submission to a committee. There is no scoring, no
        tier, no partner programme and nothing you can be rejected from — the only thing on the
        other end is people who build this.
      </p>

      <LaunchForm />

      <Card className="mt-8 max-w-[76ch] space-y-3 p-6">
        <h3 className="text-sm font-semibold">What Lux does not do with an application</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We do not review whether your token is a security, whether an exemption is available to
          you, whether two offerings integrate, or whether anyone in your project is disqualified
          from relying on one. Those are legal questions with legal answers and we hold most of the
          inputs, which is exactly why answering them would be advice rather than engineering. Ask
          counsel; we will tell you what we observed on a chain and nothing more.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We do not rank applicants, feature them, or take a share of anything raised. There is no
          arrangement here in which Lux is paid more because your launch is bigger.{' '}
          <Link className="text-foreground hover:underline" href="/support/projects">
            What a project needs to know
          </Link>{' '}
          spells that out.
        </p>
      </Card>
    </Page>
  )
}

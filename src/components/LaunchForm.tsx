'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IdentityProvider, useIdentity } from '@luxfi/ui'
import { useAuth } from '@luxfi/ui/auth'
import { Check, Copy, ExternalLink } from '@luxfi/ui/icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useChain } from '@/hooks/chain'
import type { Chain } from '@/lib/registry'
import { cn } from '@/lib/utils'

/**
 * Where an application goes.
 *
 * lux.network runs Google Workspace mail (MX aspmx.l.google.com) and this
 * address is already the live `mailto:` on a shipped Lux surface, so it reaches
 * a person today. One destination, not a routing table: a form that asks the
 * applicant to pick a department is a form that asks them to guess.
 */
const DESTINATION = 'support@lux.network'

/** Where sign-in returns to. */
const HERE = '/launch'

/** How much free text still fits in a mail draft every client will open. */
const NOTE_LIMIT = 1200

const ASKS = [
  { id: 'token', text: 'Deploy a token on a Lux chain' },
  { id: 'l1', text: 'Run an L1 on Lux' },
  {
    id: 'reads-wrong',
    text: 'A contract is deployed and something here reads wrong',
  },
  { id: 'offering', text: 'Raise money from participants' },
  { id: 'other', text: 'Something else' },
] as const

type Ask = (typeof ASKS)[number]['id']

const FIELD =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {children}
    </label>
  )
}

/** Bytes of deployed code at an address, read from the chain's own RPC. */
async function codeSize(rpc: string, address: string): Promise<number> {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getCode',
      params: [address, 'latest'],
    }),
  })
  if (!res.ok) throw new Error(`rpc ${res.status}`)
  const body = (await res.json()) as {
    result?: string
    error?: { message: string }
  }
  if (body.error) throw new Error(body.error.message)
  return ((body.result ?? '0x').length - 2) / 2
}

const isAddress = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v.trim())

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[13px] text-muted-foreground">{children}</p>
}

/** The application, as plain text the applicant can read before they send it. */
function compose(input: {
  who: string | null
  org: string | null
  project: string
  ask: Ask
  chain: Chain | null
  address: string
  observed: string
  note: string
}): string {
  const ask = ASKS.find((a) => a.id === input.ask)!.text
  const lines = [
    'Lux Market — application to launch',
    '',
    // The applicant line is the one thing the page will not make up. Signed in,
    // it is the IAM account. Not signed in, the message is sent from the
    // applicant's own mail client and the address it arrives from is the answer.
    input.who
      ? `Applicant     ${input.who}`
      : 'Applicant     not signed in — reply to the address this arrives from',
    ...(input.org ? [`Organization  ${input.org}`] : []),
    `Project       ${input.project}`,
    `Asking        ${ask}`,
    `Chain         ${input.chain ? `${input.chain.name} (${input.chain.id})` : 'not decided'}`,
  ]
  if (input.address.trim()) {
    lines.push(`Contract      ${input.address.trim()}`)
    lines.push(`              ${input.observed}`)
  }
  lines.push('', input.note.trim())
  return lines.join('\n')
}

/**
 * The account this surface already has, made reachable from here.
 *
 * `@luxfi/ui` 7.4.10 ships two React contexts for one identity: `auth.js`
 * builds its own inside `AuthProvider`, and `index.js` builds another that
 * `useIdentity` reads. A component consuming the hook therefore reads
 * `anonymous` no matter who is signed in — the symptom this form showed until
 * the browser was pointed at it. Both halves read the SAME stored IAM token, so
 * naming the provider beside its own hook restores the session without a second
 * login, a second credential or a line of auth logic here. Sign-in stays the
 * one PKCE flow `useAuth` owns. Delete this wrapper when the package publishes
 * one context.
 */
export function LaunchForm() {
  const auth = useAuth(HERE)
  const identityAuth = useMemo(
    () => ({ signIn: () => auth.signIn(HERE), signOut: () => auth.signOut() }),
    [auth],
  )
  return (
    <IdentityProvider auth={identityAuth}>
      <Application />
    </IdentityProvider>
  )
}

function Application() {
  const identity = useIdentity()
  const state = useChain()
  const chains = state.status === 'ready' ? state.chains : []

  const [project, setProject] = useState('')
  const [ask, setAsk] = useState<Ask>('token')
  const [slug, setSlug] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [copy, setCopy] = useState<'idle' | 'done' | 'refused'>('idle')

  const chain = chains.find((c) => c.slug === slug) ?? null
  const account = identity.account

  const value = address.trim()
  const rpc = chain?.rpc ?? null

  const probe = useQuery({
    queryKey: ['launch', 'code', rpc, value.toLowerCase()],
    queryFn: () => codeSize(rpc!, value),
    enabled: Boolean(rpc) && isAddress(value),
    retry: false,
  })

  /**
   * What the chain read found, in one sentence used in one place.
   *
   * This is the only fact on the form nobody types, which is why it says
   * "observed": everything else is the applicant's own statement, and a reader
   * who cannot tell the two apart has a document implying a check nobody ran.
   * The same string goes on the screen and into the application, so what the
   * applicant read is what the reader gets.
   */
  const observed = !value
    ? ''
    : !isAddress(value)
      ? 'not read — that is not a 20-byte address'
      : !chain
        ? 'not read — no chain chosen'
        : !rpc
          ? `not read — ${chain.name} publishes no RPC a browser can reach`
          : probe.isPending
            ? `reading ${chain.name}…`
            : probe.isError
              ? `not read — ${chain.name} did not answer`
              : probe.data === 0
                ? `observed on ${chain.name}: no code at this address`
                : `observed on ${chain.name}: ${probe.data.toLocaleString()} bytes of code`

  // Signing in names the applicant; it has never been what makes an application
  // possible, and gating the composed text on it meant a filled-in form produced
  // nothing at all for anyone without an account — while the paragraph above it
  // said signing in was not a condition of applying.
  const ready = project.trim().length > 0 && note.trim().length > 0

  const record = ready
    ? compose({
        who: account
          ? `${account.displayName ?? account.name}${account.email ? ` <${account.email}>` : ''}`
          : null,
        org: identity.org?.displayName ?? identity.org?.name ?? null,
        project: project.trim(),
        ask,
        chain,
        address,
        observed,
        note,
      })
    : ''

  const mail = `mailto:${DESTINATION}?subject=${encodeURIComponent(
    `Launch application — ${project.trim() || 'untitled'}`,
  )}&body=${encodeURIComponent(record)}`

  /**
   * A browser can refuse the clipboard — permission denied, an insecure origin,
   * an embedded view. A button that then does nothing at all is the silent drop
   * this whole page exists to avoid, so the refusal is said out loud and the
   * reader is pointed at the copy already on screen.
   */
  async function toClipboard() {
    try {
      await navigator.clipboard.writeText(record)
      setCopy('done')
    } catch {
      setCopy('refused')
    }
    setTimeout(() => setCopy('idle'), 4000)
  }

  return (
    <div className="max-w-[76ch] space-y-6">
      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold">Who is applying</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Read from your Hanzo IAM session rather than typed, so the name on the application is
            one somebody signed in as.
          </p>
        </div>

        {identity.status === 'loading' ? (
          <p className="text-sm text-muted-foreground">Reading your session…</p>
        ) : account ? (
          <div className="text-sm">
            <div className="font-medium">{account.displayName ?? account.name}</div>
            {account.email && (
              <div className="font-mono text-xs text-muted-foreground">{account.email}</div>
            )}
            <div className="mt-1 text-[13px] text-muted-foreground">
              Acting in {identity.org?.displayName ?? identity.org?.name ?? 'no organization'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button onClick={() => identity.signIn()}>Sign in</Button>
            <p className="text-[13px] text-muted-foreground">
              Signing in fills this in and nothing else. It is not a condition of applying — writing
              to{' '}
              <a className="text-foreground hover:underline" href={`mailto:${DESTINATION}`}>
                {DESTINATION}
              </a>{' '}
              reaches the same people.
            </p>
          </div>
        )}
      </Card>

      <Card className="space-y-5 p-6">
        <div>
          <Label htmlFor="project">Project</Label>
          <Input
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div>
          <Label htmlFor="ask">What you are asking for</Label>
          <select
            id="ask"
            className={cn(FIELD, 'cursor-pointer')}
            value={ask}
            onChange={(e) => setAsk(e.target.value as Ask)}
          >
            {ASKS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.text}
              </option>
            ))}
          </select>
          {ask === 'offering' && (
            <Note>
              Worth knowing before you write: Lux Market cannot host an offering today, and the
              reasons are on{' '}
              <a className="text-foreground hover:underline" href="/launches">
                the launches page
              </a>
              . An application is still the right move — it is how the queue for that work gets
              built — but nothing here can take a subscription.
            </Note>
          )}
        </div>

        <div>
          <Label htmlFor="chain">Chain</Label>
          <select
            id="chain"
            className={cn(FIELD, 'cursor-pointer')}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          >
            <option value="">Not decided</option>
            {chains.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
          {state.status === 'failed' && (
            <Note>
              The chain registry did not answer, so there are no chains to choose from. Name the
              chain in your own words below instead.
            </Note>
          )}
        </div>

        <div>
          <Label htmlFor="address">Contract address, if one is deployed</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="font-mono"
          />
          {observed && <Note>{observed}</Note>}
        </div>

        <div>
          <Label htmlFor="note">In your own words</Label>
          <textarea
            id="note"
            rows={7}
            maxLength={NOTE_LIMIT}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={cn(FIELD, 'h-auto resize-y py-2 leading-relaxed')}
          />
          <Note>
            {NOTE_LIMIT - note.length} characters left. Nothing is suggested here on purpose: a
            promise we drafted and you adopted would be our words in your filing, and you would be
            the one held to them.
          </Note>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-semibold">Send it</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            lux.market is a static site — there is no server behind this page and no queue on it
            that could hold a submission. So the page does not pretend to accept one. It writes the
            application out, you read it, and you send it. Nothing is kept here and nothing is
            dropped in silence.
          </p>
        </div>

        {ready ? (
          <>
            <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {record}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <a href={mail}>
                  Open a message to {DESTINATION}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" onClick={toClipboard}>
                {copy === 'done' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copy === 'done' ? 'Copied' : 'Copy the application'}
              </Button>
            </div>
            {copy === 'refused' && (
              <Note>
                Your browser refused the clipboard, so nothing was copied. The application is
                printed above — select it there and copy it by hand.
              </Note>
            )}
            <p className="text-[13px] text-muted-foreground">
              It reaches people, not a ticketing robot, and nobody here promises a reply by any
              particular day.
            </p>
            {!account ? (
              <Note>
                You are not signed in, so the application carries no name of ours — whoever reads it
                replies to the address you send it from. Signing in above puts your account on it
                instead.
              </Note>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            A project and a few words of your own, and the application appears here to read before
            you send it.
          </p>
        )}
      </Card>
    </div>
  )
}

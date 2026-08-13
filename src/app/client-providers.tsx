'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { AnalyticsProvider, usePageview } from '@hanzo/event/react'
import type { ReactNode } from 'react'

const Providers = dynamic(() => import('./providers').then((m) => m.Providers), { ssr: false })

// The market measured nothing: not a pageview, not a session, not an error. Six
// other Lux surfaces were equally dark, so nobody could answer which of them
// anyone actually uses. `@hanzo/event` is the ONE client the fleet reports
// through — it posts to api.hanzo.ai/v1/event and to nobody else, which is the
// point: the traffic of a marketplace is not a thing to hand to a third party.
//
// It wraps `Providers` rather than sitting inside it. That chunk carries wagmi,
// IAM and the gui engine and is loaded on its own; a visitor whose wallet stack
// never arrives is precisely the visitor worth hearing about, so the counter
// must not ride in the same box as the thing it counts.
//
// The key is publishable — it attributes a write and can read nothing, so it
// belongs in the bundle the way a public address does. A deploy can override it
// through the env; the literal is what makes the site report today, since this
// image is built with no arguments.
const INGEST_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || 'pk-gUZp6ZVfhJzSwK-rb4oLbVkpCnMBx5uSCpxf_5yEhQk'

// The provider counts the first load. This counts every navigation after it —
// without it a single-page app looks like one visit that never moves.
function Pageviews() {
  usePageview(usePathname())
  return null
}

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AnalyticsProvider config={{ product: 'market', ingestKey: INGEST_KEY }}>
      <Pageviews />
      <Providers>{children}</Providers>
    </AnalyticsProvider>
  )
}

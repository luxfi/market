'use client'

import { AuthCallback } from '@luxfi/ui/auth'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

// The route lux.market never had.
//
// The header offered "Sign in with lux.id" and the IdP sent the user back to
// https://lux.market/auth/callback — which 404'd, so the login could START and
// never FINISH. Same path, same component, same PKCE exchange as every other
// Lux surface; the market has nothing of its own to do with a fresh session.
function CallbackInner() {
  const router = useRouter()
  return <AuthCallback navigate={(to) => router.replace(to)} fallback="/" retryPath="/" />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}

import type { ReactNode } from 'react'

/** Where the figures on a screen came from. Every screen that reads says so. */
export function Source({ children }: { children: ReactNode }) {
  return <p className="mb-6 text-[13px] text-muted-foreground">{children}</p>
}

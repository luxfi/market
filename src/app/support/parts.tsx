import type { ReactNode } from 'react'

/** Two elements, used on every support page. Nothing here is worth a system. */

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="pt-4 text-lg font-semibold">{children}</h2>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
}

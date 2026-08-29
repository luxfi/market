'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { cn } from '@/lib/utils'

const PAGES = [
  { href: '/support', label: 'Support' },
  { href: '/support/projects', label: 'For projects' },
  { href: '/support/buyers', label: 'For participants' },
  { href: '/support/terms', label: 'Terms' },
  { href: '/support/privacy', label: 'Privacy' },
]

// The same shell `Page` builds, plus the one thing it has no slot for: a nav
// across the documents in this section. These pages read no chain, so none of
// `Page`'s registry states apply to them.
export default function SupportLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8">
        <nav className="mb-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-border pb-3 text-sm">
          {PAGES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className={cn(
                'no-underline transition-colors hover:text-foreground',
                pathname === p.href ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {p.label}
            </Link>
          ))}
        </nav>
        <article className="max-w-[76ch] space-y-4">{children}</article>
      </main>
      <Footer />
    </div>
  )
}

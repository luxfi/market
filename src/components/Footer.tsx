import Link from 'next/link'

// The links a marketplace is expected to have and this one did not: how to
// apply, where to get help, and the two documents that say what the site does
// with a visit. /launch and /support are written elsewhere in this app; the
// footer's job is only to make them reachable from every page.

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Market',
    links: [
      { href: '/collections', label: 'Collections' },
      { href: '/activity', label: 'Activity' },
      { href: '/pools', label: 'Pools' },
      { href: '/genesis', label: 'Genesis' },
    ],
  },
  {
    heading: 'Build',
    links: [
      { href: '/launch', label: 'Apply' },
      { href: '/launches', label: 'Launches' },
      { href: '/support/projects', label: 'For projects' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { href: '/support', label: 'Support' },
      { href: '/support/buyers', label: 'For participants' },
      { href: '/support/terms', label: 'Terms' },
      { href: '/support/privacy', label: 'Privacy' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8 px-6 py-10">
        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <div className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              {column.heading}
            </div>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted-foreground no-underline hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="text-[13px] leading-relaxed text-muted-foreground">
          Lux Market reads the Lux chains and shows what is on them. It holds no assets, takes no
          custody and settles nothing.
        </div>
      </div>
    </footer>
  )
}

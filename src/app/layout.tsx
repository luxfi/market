import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClientProviders } from './client-providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Lux Market',
    template: '%s | Lux Market',
  },
  description:
    'Collections, holders, transfers and AMM liquidity on every Lux chain, read live from the indexer.',
  openGraph: {
    title: 'Lux Market',
    description: 'What is on the Lux chains, read live.',
    url: 'https://lux.market',
    siteName: 'Lux Market',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lux Market',
    description: 'What is on the Lux chains, read live.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}

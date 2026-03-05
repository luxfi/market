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
    default: 'Lux Market - NFT Marketplace',
    template: '%s | Lux Market',
  },
  description: 'Trade NFTs across all Lux chains. Seaport-powered P2P trading with LSSVM AMM liquidity pools.',
  openGraph: {
    title: 'Lux Market',
    description: 'The NFT marketplace for the Lux ecosystem',
    url: 'https://lux.market',
    siteName: 'Lux Market',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lux Market',
    description: 'Trade NFTs across all Lux chains',
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

import React, { type PropsWithChildren } from 'react'
import type { Viewport, Metadata } from 'next'

import { Toaster } from '@hanzo/ui/primitives'
import { Header } from '@luxfi/ui'

import siteDef from '../site-def'
import _metadata from '../metadata'

import '@luxfi/ui/style/lux-global.css'

export const metadata: Metadata = { ..._metadata }

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

const bodyClasses = 'bg-background text-foreground flex flex-col min-h-full font-sans'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className='dark'>
      <body className={bodyClasses}>
        <Header siteDef={siteDef} />
        <main className='flex flex-col grow'>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}

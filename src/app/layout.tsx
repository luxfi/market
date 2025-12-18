import React, { type PropsWithChildren } from 'react'
import type { Viewport, Metadata } from 'next'

export const metadata: Metadata = {
  title: 'market - LUX',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className='dark'>
      <body className='bg-black text-white flex flex-col min-h-full'>
        {children}
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from "./providers";

const inter = Inter({ subsets: ['latin'] })

// Layut for root of the application.

export const metadata: Metadata = {
  title: 'Simbie Health',
  description: 'Health portal for Simbie',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /* 
  Even though /provider and /patient have their own layouts, we still need a root layout
  Including the regular navbar in the root layout would make it show up, even in the authenticated sections of the app.
  Since only 2 pages currently need the regular navbar, we include it within those pages.tsx, not the layout

  This UI structure is subject to change with navbar redesigns.
  */
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
            {children}
        </Providers>
        </body>
    </html>
  )
}

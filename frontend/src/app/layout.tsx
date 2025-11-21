import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gem',
  description: 'A modern forum application built with Next.js and NestJS',
  keywords: ['forum', 'community', 'discussion', 'tech'],
  authors: [{ name: 'Gem Team' }],
  openGraph: {
    title: 'Gem',
    description: 'Join the conversation on Gem',
    type: 'website',
    locale: 'en_US',
    siteName: 'Gem',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gem',
    description: 'A modern forum application',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}

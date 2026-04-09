import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEO World Builder',
  description: 'World-building visualization and manga panel composer for the NEO universe',
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
      <body className="bg-dark-bg text-gray-100 overflow-hidden">
        {children}
      </body>
    </html>
  )
}

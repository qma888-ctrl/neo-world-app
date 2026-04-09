import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEO World Builder',
  description: 'Build worlds, characters, and stories with AJAI power',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="">
        {children}
      </body>
    </html>
  )
}

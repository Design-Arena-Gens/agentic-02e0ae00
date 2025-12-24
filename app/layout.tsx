import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Video Generator | Create Videos from Text',
  description: 'Generate stunning AI-powered videos from text prompts. Transform your ideas into visual content with cutting-edge AI technology.',
  keywords: ['AI', 'video generation', 'text to video', 'AI video', 'generative AI'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

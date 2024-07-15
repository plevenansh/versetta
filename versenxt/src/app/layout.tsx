import { Inter } from "next/font/google";

import '@/styles/globals.css'
import { ThemeProvider } from "next-themes"
import type { Metadata } from 'next'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Versetta Dashboard',
  description: 'Content Creator Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        
      </body>
    </html>
  )
}
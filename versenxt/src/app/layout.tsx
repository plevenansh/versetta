"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import '../styles/globals.css';
import RootLayoutServer from './root-layout';
import Layout from '@/components/Layout';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Manrope } from 'next/font/google'
interface RootLayoutProps {
  children: ReactNode;
}

// const fontHeading = Manrope({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-heading',
// })

// const fontBody = Manrope({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-body',
// })
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
})

function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <RootLayoutServer>
       <html lang="en" className={`${manrope.variable}`}>
       <body>
          {isLandingPage ? children : <Layout>{children}</Layout>}
        </body>
      </html>
    </RootLayoutServer>
  );
}

export default trpc.withTRPC(RootLayout);
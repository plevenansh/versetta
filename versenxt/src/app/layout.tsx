"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import '../styles/globals.css';
import { manrope } from '@/utils/fonts';
import RootLayoutServer from './root-layout';
import Layout from '@/components/Layout';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Manrope } from 'next/font/google'
import { fontHeading, fontBody } from '@/utils/fonts';
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

function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <RootLayoutServer>
      <html lang="en">
        <body 
         className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
        >
          {isLandingPage ? children : <Layout>{children}</Layout>}
        </body>
      </html>
    </RootLayoutServer>
  );
}

export default trpc.withTRPC(RootLayout);
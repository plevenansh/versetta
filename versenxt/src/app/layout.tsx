"use client"
import { ReactNode } from 'react';
import { trpc } from '@/utils/trpc';
import '../styles/globals.css';
import RootLayoutServer from './root-layout';
import Layout from '@/components/Layout';
import { usePathname } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const excludedRoutes = ['/privacy', '/terms', '/cancellation', '/contact'];
  const shouldExcludeLayout = isLandingPage || excludedRoutes.includes(pathname);

  return (
    <RootLayoutServer>
      <html lang="en" className={GeistSans.variable}>
        <body className={GeistSans.className}>
          {shouldExcludeLayout ? children : <Layout>{children}</Layout>}
          <SpeedInsights/>
          <Analytics/>
        </body>
      </html>
    </RootLayoutServer>
  );
}

export default trpc.withTRPC(RootLayout);
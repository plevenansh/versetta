"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import '../styles/globals.css';
import { manrope } from '@/utils/fonts';
import RootLayoutServer from './root-layout';
import Layout from '@/components/Layout';
import { usePathname } from 'next/navigation';

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';





  
  return (
    <RootLayoutServer>
      <div className={`${manrope.variable} font-sans`}>
        {isLandingPage ? (
          children
        ) : (
          <Layout>{children}</Layout>
        )}
      </div>
    </RootLayoutServer>
  );
}

export default trpc.withTRPC(RootLayout);
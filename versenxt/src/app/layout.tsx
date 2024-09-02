"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import Layout from '@/components/Layout';
import '../styles/globals.css'

import { manrope } from '@/utils/fonts'
interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${manrope.variable} font-sans`}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

export default trpc.withTRPC(RootLayout);
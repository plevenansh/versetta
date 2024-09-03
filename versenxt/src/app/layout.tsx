"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import '../styles/globals.css';
import { manrope } from '@/utils/fonts';
import RootLayoutServer from './root-layout';

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <RootLayoutServer>
      <div className={`${manrope.variable} font-sans`}>
        {children}
      </div>
    </RootLayoutServer>
  );
}

export default trpc.withTRPC(RootLayout);
"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import '../styles/globals.css';
import { manrope } from '@/utils/fonts';

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${manrope.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}


export default trpc.withTRPC(RootLayout);
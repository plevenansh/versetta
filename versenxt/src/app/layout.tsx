"use client"
import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import '../styles/globals.css';
import { manrope } from '@/utils/fonts';
import { Metadata } from 'next';

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Your app description',
  icons: {
    icon: '/favicon.ico',
  },
};


function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${manrope.variable} font-sans`}>
       <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}


export default trpc.withTRPC(RootLayout);
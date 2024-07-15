"use client"

import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export default trpc.withTRPC(RootLayout);
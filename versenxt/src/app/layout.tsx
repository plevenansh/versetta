
"use client"
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import { ReactNode } from 'react';
import { trpc } from '@/trpc/client';
import Layout from '@/components/Layout';
import '../styles/globals.css'

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body>
      
        <Layout>{children}</Layout>
      </body>
    </html>
    </ClerkProvider>
  );
}

export default trpc.withTRPC(RootLayout);

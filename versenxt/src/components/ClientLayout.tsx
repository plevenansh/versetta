// app/ClientLayout.tsx
"use client"
import { ReactNode } from 'react';
import { trpc } from '../utils/trpc';

interface ClientLayoutProps {
  children: ReactNode;
}

function ClientLayout({ children }: ClientLayoutProps) {
  return <>{children}</>;
}

export default trpc.withTRPC(ClientLayout);
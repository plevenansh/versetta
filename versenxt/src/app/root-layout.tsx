import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Your app description',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayoutServer({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
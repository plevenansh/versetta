import { ReactNode } from 'react';
import { Metadata } from 'next';
import { fontHeading, fontBody } from '@/utils/fonts';
import {cn} from '@/lib/utils';
export const metadata: Metadata = {
  title: 'Versetta',
  description: 'Runway to imagination',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayoutServer({ children }: { children: ReactNode }) {
  return (
    <html lang="en">

        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>

      <body>{children}</body>
    </html>
  );
}



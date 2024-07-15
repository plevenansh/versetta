'use client';

import { trpc } from '@/trpc/client';
import React from 'react';
import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const hello = trpc.hello.useQuery({ text: 'world' });

  if (!hello.data) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* <Dashboard /> */}
      <p>{hello.data.greeting}</p>
    </Layout>
  );
}
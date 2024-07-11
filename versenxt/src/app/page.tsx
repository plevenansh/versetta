import React from 'react';
import SignUpPage from '@/components/signup';
import SignInPage from '@/components/signin';
import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
    // <SignInPage />
  )
}

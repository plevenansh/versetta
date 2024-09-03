"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  profilePictureUrl?: string;
}

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth?action=getUser');
        const data = await response.json();
        setUser(data.user as User);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  const handleSignIn = async () => {
    try {
      const response = await fetch('/api/auth?action=getSignInUrl');
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error getting sign in URL:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await fetch('/api/auth?action=getSignUpUrl');
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error getting sign up URL:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our App</h1>
      <p className="text-xl mb-8">Manage your projects and tasks efficiently.</p>
      
      {isLoading ? (
        <span className="text-gray-600">Loading...</span>
      ) : user ? (
        <Button onClick={handleDashboardClick} className="bg-blue-600 text-white hover:bg-blue-700">
          Go to Dashboard
        </Button>
      ) : (
        <div className="space-x-4">
          <Button onClick={handleSignIn} variant="ghost" className="text-gray-600 hover:text-gray-900">
            Sign In
          </Button>
          <Button onClick={handleSignUp} variant="outline" className="text-gray-800 bg-gray-100 hover:bg-gray-200">
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );
}
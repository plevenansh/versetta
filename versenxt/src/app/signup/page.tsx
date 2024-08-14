"use client";

import SignUpPage from '@/lib/signup';
import { trpc } from '@/trpc/client';

export default function SignUp() {
  const createUser = trpc.users.create.useMutation();

  const handleSignUp = async (formData) => {
    try {
      await createUser.mutateAsync(formData);
      // Handle successful sign up (e.g., redirect to login page)
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Sign up error:', error);
    }
  };

  return <SignUpPage onSubmit={handleSignUp} />;
}

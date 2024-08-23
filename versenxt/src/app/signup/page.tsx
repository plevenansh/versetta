"use client";

import React from 'react';
import SignUpPage from '@/components/signup';
import { trpc } from '@/trpc/client';

// Define the structure of the sign-up form data
interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  gender?: string;
}

// Define the structure expected by trpc.users.create
interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  
}

// Define props for SignUpPage component
interface SignUpPageProps {
  onSubmit: (formData: SignUpFormData) => Promise<void>;
}

export default function SignUp() {
  // const createUser = trpc.users.create.useMutation();

  // const handleSignUp = async (formData: SignUpFormData) => {
  //   try {
  //     const createUserInput: CreateUserInput = {
  //       name: formData.name,
  //       email: formData.email,
  //       gender: formData.gender
  //     };
  //     await createUser.mutateAsync(createUserInput);
  //     // Handle successful sign up (e.g., redirect to login page)
  //   } catch (error) {
  //     // Handle error (e.g., show error message)
  //     console.error('Sign up error:', error);
  //   }
  // };

  // // Use a type assertion to explicitly define the props of SignUpPage
  // const TypedSignUpPage = SignUpPage as React.ComponentType<SignUpPageProps>;

  // return <TypedSignUpPage onSubmit={handleSignUp} />;
}
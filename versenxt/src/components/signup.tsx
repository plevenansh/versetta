"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AtSign, Lock, User, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { trpc } from '@/trpc/client';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

 
  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Account created successfully! Welcome to CreatorStudio.' });
    },
    onError: (error) => {
      setNotification({ type: 'error', message: error.message || 'Failed to create account. Please try again.' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser.mutate({
      name: formData.name,
      email: formData.email,
    });
  };

  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 ">
      <div className="bg-white rounded-lg shadow-xl p-7 max-w-md w-full">
        <div className="text-center mb-8 ">
          <h1 className="text-3xl font-bold text-indigo-600">Join Versetta</h1>
          <p className="text-gray-600 mt-2">Unleash your creativity and mangane the team and channel easily.</p>
        </div>

        {notification && (
          <div className={`mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
            <div className="flex items-center">
              {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
              <p>{notification.message}</p>
            </div>
          </div>
        )}

      
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                name="gender"
                value={formData.gender}
                onValueChange={(value) => setFormData(prevData => ({ ...prevData, gender: value }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
                 <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  
               </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

       

            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        
          <form onSubmit={handleSubmit} className="space-y-6">
           
          </form>
        

        <Separator className="my-8" />

        <div className="space-y-4">
          <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            <span>Sign up with Google</span>
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{' '}
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;

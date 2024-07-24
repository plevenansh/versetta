"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, AtSign, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setNotification({ type: 'success', message: 'Sign in successful! Welcome back to CreatorStudio.' });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
// min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 
  return ( 
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 ">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Sign in to CreatorStudio</h2>
        
        {notification && (
          <div className={`mb-4 p-2 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.type === 'success' ? <CheckCircle className="inline mr-2" size={18} /> : <AlertCircle className="inline mr-2" size={18} />}
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full">Sign In</Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
        </div>

        <Separator className="my-6" />

        <p className="text-center">
          Don&apos;t have an account?{' '}
          <a href="#" className="text-blue-600 hover:underline">Sign up</a>
        </p>

        <div className="mt-6 text-center text-sm text-gray-600">
          Unleash your creativity and manage the team and channel easily.
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
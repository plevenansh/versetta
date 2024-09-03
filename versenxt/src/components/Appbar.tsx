"use client"
import { Search, Bell } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'

interface AppbarProps {
  collapsed: boolean;
}

interface User {
  firstName?: string;
  lastName?: string;
  email: string;
  profilePictureUrl?: string;
}

export default function Appbar({ collapsed }: AppbarProps) {
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

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth?action=signOut', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(null);
        window.location.href = '/';
      } else {
        console.error('Logout failed:', data.error);
        throw new Error(data.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
    <header className="flex items-center justify-between px-4 py-4 bg-white ">
   {collapsed && (
  <div className="flex items-center space-x-2"> {/* Added space-x-2 for horizontal spacing */}
   
    <Link className='flex items-center space-x-1' href="/dashboard" passHref>
    <Image
      src="/ver.png"
      alt="Versetta Logo"
      width={31} // Reduced width
      height={32} // Reduced height
      className="mr-1" // Added right margin
    />
      <h1 className="text-3xl font-bold text-gray-800 cursor-pointer">Versetta</h1>
    </Link>
  </div>
)}
      <p className="text-sm italic text-gray-600 mx-auto hidden md:block"></p>
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 pr-4 py-1 bg-[#F0F8FF] text-gray-700 placeholder-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
          <Bell className="h-5 w-5" />
        </Button>
        {isLoading ? (
          <span className="text-gray-600">Loading...</span>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              {user.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 bg-white shadow-lg rounded-md">
              <DropdownMenuItem className="text-gray-700">
                <span>{user.firstName} {user.lastName}</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700">
                <span>{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button onClick={handleSignIn} variant="ghost" className="text-gray-600 hover:text-gray-900">Sign In</Button>
            <Button onClick={handleSignUp} variant="outline" className="text-gray-800 bg-gray-100 hover:bg-gray-200">Sign Up</Button>
          </>
        )}
      </div>
    </header>
  );
}
import { Search, Bell, ChevronRight, ChevronLeft } from 'lucide-react'
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
  onToggle: () => void;
}

export default function Appbar({ collapsed, onToggle }: AppbarProps) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth?action=getUser');
        const data = await response.json();
        setUser(data.user);
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
      await fetch('/api/auth?action=signOut');
      setUser(null);
      router.push('/');
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
    <header className="flex items-center justify-between px-10 py-4 bg-white bg-opacity-20 backdrop-blur-lg">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onToggle} className="mr-2">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
        <Link href="/" passHref>
          <h1 className="text-2xl font-bold text-gray-800 cursor-pointer">Versetta</h1>
        </Link>
      </div>
      <p className="text-sm italic text-white mx-auto">`Creativity is intelligence having fun`</p>
      <div className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="Search..."
          className="bg-white bg-opacity-20 text-white placeholder-white"
        />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-white" />
        </Button>
        {isLoading ? (
          <span>Loading...</span>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              {user.profilePictureUrl ? (
                <Image
                  src={user.profilePictureUrl}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {user.firstName?.charAt(0) || user.email.charAt(0)}
                  </span>
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <span>{user.firstName} {user.lastName}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button onClick={handleSignIn} variant="ghost" className="text-black">Sign In</Button>
            <Button onClick={handleSignUp} variant="ghost" className="text-black">Sign Up</Button>
          </>
        )}
      </div>
    </header>
  );
}
import { Search, Bell, Settings } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function Appbar({ showLogo }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white bg-opacity-20 backdrop-blur-lg">
      {showLogo && <h1 className="text-2xl font-bold text-white">Versetta</h1>}
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
        <SignedOut>
              <SignInButton />
            </SignedOut>
        <SignedIn>
              <UserButton />
            </SignedIn>
      </div>
    </header>
  );
}

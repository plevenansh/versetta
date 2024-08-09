import { Search, Bell, ChevronRight, ChevronLeft } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'


interface AppbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Appbar({ collapsed, onToggle }: AppbarProps) {
  return (
    <header className="flex items-center justify-between px-1 py-4 bg-white bg-opacity-20 backdrop-blur-lg">
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
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CheckIcon, ClockIcon,Menu } from "lucide-react"
import AnimationComponent from './AnimationComponent';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

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

  // useEffect(() => { 
  //   if (user) {
  //     router.push('/dashboard');
  //   }
  // }, [user, isLoading]);

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

    <div className="flex flex-col min-h-[100dvh]">
 <header className="px-4 lg:px-6 h-14 flex items-center justify-between">
    <Link href="#" className="flex items-center justify-center" prefetch={false}>
      <Image
        src="/ver.png"
        alt="Versetta Logo"
        width={31}
        height={32}
        className="mr-1"
      />
      <h1 className="text-3xl font-bold ml-2 text-gray-800 cursor-pointer">Versetta</h1>
    </Link>
    <div className="flex items-center space-x-4">
      <nav className="hidden md:flex gap-4 sm:gap-6">
        <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Features
        </Link>
        <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Pricing
        </Link>
        <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          About
        </Link>
        <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
          Contact
        </Link>
      </nav>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="#features">Features</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="#pricing">Pricing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="#about">About</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/contact">Contact</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        onClick={handleSignIn}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Sign In
      </Button>
      <Button
        onClick={handleSignUp}
        className="bg-primary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Sign Up
      </Button>
    </div>
  </header>
    <main className="flex-1">
    <section className="w-full py-12 md:py-24 lg:py-32 xl:pb-55 ">
  <div className="container px-4 md:px-6 xl:pl-4 xl:pr-4">
    <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1.8fr_750px] xl:gap-64">
      <div className="flex flex-col justify-center space-y-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-6xl/none">
            Your Content&apos;s Headquarter
          </h1>
          <p className="max-w-[550px] text-muted-foreground md:text-xl">
            Versetta is a comprehensive team management and video production platform designed solely for content creators.
            Manage upcoming videos, assign tasks, analyse comments using AI, this is the just launch version we are having amazing features in the development launching soon.
          </p>
        </div>
      
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          {isLoading ? (
            <span className="text-gray-600">Loading...</span>
          ) : user ? (
            <Button 
              onClick={handleDashboardClick} 
              className="inline-flex h-15 w-52  items-center justify-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={handleSignUp}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Create your Team
            </Button>
          )}
          {/* <Link
            href="#"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            prefetch={false}
          >
            Learn More
          </Link> */}
        </div>
      </div>
      <div>
        <AnimationComponent />
      </div>
    </div>
  </div>
</section>
<section id="features"className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-[#f0f7ff] to-blue-200">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-2">
        <div className="inline-block font-bold rounded-3xl border bg-purple-100 px-3 py-1 m-5 text-semibold text-2xl text-purple-800">Key Features</div>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Empower Your Content Creation</h2>
        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Versetta provides a centralized workspace with powerful tools to streamline your entire content production process.
        </p>
      </div>
    </div>
    <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">Video Management</h3>
        <p className="text-muted-foreground">
          Manage projects, attach documents, assign tasks, and track progress all in one place.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">Task Assignment</h3>
        <p className="text-muted-foreground">
          Easily assign and track tasks within your team for seamless collaboration and workflow.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">Comment Analysis</h3>
        <p className="text-muted-foreground">
          Analyze comments for video ideas, feedback, and engage with viewers using AI assistance.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">Content Calendar(Coming Soon)</h3>
        <p className="text-muted-foreground">
          Visualize your content pipeline, track completion, and manage publication schedules effortlessly.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">Comprehensive Dashboard</h3>
        <p className="text-muted-foreground">
          Get a bird&#39;s-eye view of your workspace with all essential tools and information at your fingertips.
        </p>
      </div>
      <div className="grid gap-1">
        <h3 className="text-xl font-bold">Production Pipeline</h3>
        <p className="text-muted-foreground">
          Monitor your production flow and stay updated on project progress. More exciting features coming soon!
        </p>
      </div>
    </div>
  </div>
</section>

  <section className="w-full py-12  md:py-24 lg:py-32 bg-gradient-to-r from-purple-100 to-blue-100">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="space-y-2">
          <div className="inline-block rounded-3xl border bg-purple-200 px-3 py-1 m-5 text-semibold text-2xl text-purple-800">Coming Soon</div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Revolutionizing Content Creation</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Exciting new features on the horizon to supercharge your content production workflow.
          </p>
        </div>
      </div>
      <div className="mx-auto p-5 grid max-w-8xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
        <div className="grid gap-1">
          <h3 className="text-xl font-bold">Storage Solutions</h3>
          <p className="text-muted-foreground">
            Team-wide asset sharing during production and comprehensive archiving for user backups.
          </p>
        </div>
        <div className="grid gap-1">
          <h3 className="text-xl font-bold">Advanced Analysis</h3>
          <p className="text-muted-foreground">
            Simplistic visualizations of analytics with AI-generated insights and periodic report creation.
          </p>
        </div>
        <div className="grid gap-1">
          <h3 className="text-xl font-bold">YouTube Integration</h3>
          <p className="text-muted-foreground">
            Seamless publishing and management of your content directly from the Versetta dashboard.
          </p>
        </div>
        </div>

        <div className=" p-2 rounded-xl">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="border-2 border-purple-300 p-4 h-[170px] rounded-lg">
            <h3 className="text-xl font-bold mb-2">Ideation and Planning</h3>
            <p className="text-muted-foreground">
              <span className="text-lg font-semibold text-purple-700">AI-assisted</span> research, script generation, and content planning based on user ideas and comment analysis.
            </p>
          </div>
          <div className="border-2 border-purple-300 p-4 h-[170px] rounded-lg">
            <h3 className="text-xl font-bold mb-2">AI Production Tools</h3>
            <p className="text-muted-foreground">
              <span className="text-lg font-semibold text-purple-700">Advanced AI tools</span> for video editing, audio enhancement, thumbnail creation, and subtitle generation.
            </p>
          </div>
          <div className="border-2 border-purple-300 p-4 h-[170px] rounded-lg">
            <h3 className="text-xl font-bold mb-2">Production Automation</h3>
            <p className="text-muted-foreground">
              <span className="text-lg font-semibold text-purple-700">AI-driven</span> production workflow with idea research and fine-grained, role-based team access control.
            </p>
          </div>
        </div>
      </div>
       
    </div>
  </section>

  {/* <section id="pricing" className="w-full py-12 md:py-14 lg:py-28 bg-gradient-to-r from-purple-100 to-muted">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-4 max-w-4xl">
      <div className="inline-block px-3 py-1 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full mb-4">Pricing</div>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Choose the Plan That Fits Your Needs
        </h2>
        <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Versetta offers flexible pricing options to cater to content creators of all sizes and budgets.
        </p>
      </div>
    </div>
    
    <div className="mt-8 border-t border-b border-gray-200 py-4">
      <h3 className="text-xl text-blue-950 font-bold tracking-tighter sm:text-2xl text-center">
        No user-based pricing: Add as many team members as you want without any extra cost.
      </h3>
    </div>
    <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
      <Card className="p-6 flex flex-col justify-between h-[450px]">
        <div className="space-y-4">
        <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Prime</h3>
            <div className="flex items-center gap-3">
         <p className="text-4xl font-bold">₹7999  </p>
        
              <div className="inline-block bg-yellow-300 text-blue-900 px-3 py-1 rounded-full font-bold text-sm">
                <span className="mr-1">🚀</span> Launch Price
              </div>
            </div>
            <p className="text-muted-foreground">per month</p>
          </div>
          <div className="space-y-2">
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Videos management
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Task Assignment
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Comment analysis(With AI)
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Stats Analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Content Calendar
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Early exclusive access to Pro
              </li>
            </ul>
          </div>
        </div>
        <Button
          onClick={handleSignUp}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground shadow"
        >
          Create your Team
        </Button>
      </Card>
      <Card className="p-6 flex flex-col justify-between h-[450px] opacity-50 pointer-events-none">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Pro</h3>
            <p className="text-4xl font-bold">Coming Soon</p>
          </div>
          <div className="space-y-2">
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                 All Prime features
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Storage solution for production 
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Archiving and video backups 
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                AI analysis and reports
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Youtube Integration
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Scripting And Research
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Early access to new features
              </li>
            </ul>
          </div>
        </div>
        <Button className="w-full" disabled>
          Coming Soon
        </Button>
      </Card>
      <Card className="p-6 flex flex-col justify-between h-[450px] opacity-50 pointer-events-none">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Studio</h3>
            <p className="text-4xl font-bold">Coming Soon</p>
          </div>
          <div className="space-y-2">
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Pro features
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                AI production tools (video, audio, subtitle, thumbnail)
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Sponsorship marketplace (Sponsors management, Legal agreements,Payment)
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Feature requests
              </li>
            </ul>
          </div>
        </div>
        <Button className="w-full" disabled>
          Coming Soon
        </Button>
      </Card>
    </div>
  </div>
</section> */}
<section id="pricing" className="w-full py-12 md:py-14 lg:py-28 bg-gradient-to-r from-purple-100 to-muted">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="space-y-4 max-w-4xl">
        <div className="inline-block px-3 py-1 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full mb-4">Founding Members</div>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Support Our Vision, Shape Our Future
        </h2>
        <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Join us as a Founding Member and help build the ultimate platform for content creators.
        </p>
      </div>
    </div>
    
    <div className="mt-8 border-t border-b border-gray-200 py-4">
      <h3 className="text-xl text-blue-950 font-bold tracking-tighter sm:text-2xl text-center">
        Lifetime 50% discount on all future offerings for our Founding Members
      </h3>
    </div>
    <div className="mx-auto grid max-w-7xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
      <Card className="p-6 flex flex-col justify-between h-[500px] shadow-lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Founding Member</h3>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-bold">$99</p>
              <div className="inline-block bg-yellow-300 text-blue-900 px-3 py-1 rounded-full font-bold text-sm">
                <span className="mr-1">🚀</span> Early Adopters 
              </div>
            </div>
            <p className="text-muted-foreground">per month</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-purple-600 font-semibold">Currently Available:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Video project management
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Task assignment and tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                AI-powered comment analysis
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
                Content calendar and production pipeline
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
               Lifetime 50% Discount
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-500" />
              Direct input in the product and feature roadmap
              </li>
            </ul>
          </div>
        </div>
        <Button
          onClick={handleSignUp}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground shadow"
        >
          Become a Founding Member
        </Button>
      </Card>
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">What&#39;s Coming Soon</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-purple-600">Advanced Storage Solutions</h4>
            <p className="text-muted-foreground">Team-wide asset sharing and comprehensive archiving</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-purple-600">AI-Powered Analytics</h4>
            <p className="text-muted-foreground">Detailed insights and automated report generation</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-purple-600">Seamless YouTube Integration</h4>
            <p className="text-muted-foreground">Publish and manage content directly from Versetta</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-purple-600">AI Production Tools</h4>
            <p className="text-muted-foreground">Video editing, audio enhancement, and more</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-purple-600">Sponsorship Marketplace</h4>
            <p className="text-muted-foreground">Easily manage sponsors, agreements, and payments</p>
          </div>
        </div>
        <p className="text-lg text-red-600 font-semibold">
          As a Founding Member, you&#39;ll get early access and a lifetime 50% discount on all these upcoming features!
        </p>
      </div>
    </div>
  </div>
</section>

<section id ="about" className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-r from-blue-200 to-muted">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <div className="space-y-4">
        <div className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Our wonderful future
        </div>
        <h2 className="text-xl font-bold tracking-tighter sm:text-5xl md:text-5xl">
          What&#39;s more to come: Our Mission
        </h2>
        <p className="max-w-[800px] text-muted-foreground text-lg md:text-xl lg:text-2xl mx-auto">
          We&#39;re starting with management and basic AI features, but this is just the beginning. Our goal is to make Versetta a comprehensive platform that fulfills all your needs.
        </p>
      </div>

      <div className="space-y-6 max-w-[900px]">
        <p className="text-muted-foreground md:text-lg lg:text-xl">
          From team and content management to sponsor coordination and analytics, we aim to cover it all. We understand that the energy and warmth you put into creating content is irreplaceable by AI. Our mission is to make your work easier and more efficient, allowing you to focus on what you do best.
        </p>

        <blockquote className="border-l-4 border-primary font-semibold pl-4 italic text-xl md:text-2xl">
          &#34;The essence of art doesn&#39;t come from its beauty, but from the inherent limitations of the artist. Any art made by a machine is not art as there are no limits to what a machine can do.&#34;
          <footer className="text-right text-sm mt-2">- Pranav</footer>
        </blockquote>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight">AI as an Assistant, Not a Replacement</h3>
          <p className="text-muted-foreground md:text-lg">
            Our AI features are designed to help, not replace you. We&#39;re developing:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground md:text-lg">
            <li>AI-generated video footage relevant to your content</li>
            <li>Audio and subtitle generation for accuracy</li>
            <li>A context engine to create precisely what you need from various tools</li>
            <li>Efficient storage solutions for team asset management</li>
            <li>A future Sponsorship Marketplace for easy sponsorship management</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-200 to-purple-100">
  <div className="container px-4 md:px-6">
    <div className="flex flex-col items-center justify-center space-y-8 text-center">
      <div className="space-y-6 max-w-3xl">
        <div className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          A Heartfelt Message
        </div>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          It&#39;s a start: Support Us
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground">
          See, this is just a start and we need your support so that we can continue working together forever. 
          We can only go forward if we have customers who help during this delicate time of start.
        </p>
        <p className="text-lg md:text-xl font-semibold">
          We want to build something solely, <span className="text-">solely</span>, and <span className="text-pimary">solely for creators</span>.
        </p>
        <p className="text-lg md:text-xl italic">
          Why should you use products designed primarily for enterprises, developers, and mega corps?
        </p>
        <div className="mt-8 p-6 bg-secondar rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold mb-4">To Our Founding Members</h3>
          <p className="text-lg md:text-xl">
            You, who are reading this, are the <span className="font-bold text-md text-yellow-5">Founding Members of Versetta</span>. 
            We will never forget you, and you will always see our love for you in the future.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our wonderful future</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What more to come</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We havent showed even 10% of what we have in our roadmap. We are working hard to bring more features to you ASAP.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">John Doe</h4>
                    <p className="text-muted-foreground text-sm">Content Creator</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                &quot;Versetta has been a game-changer for my video production\n workflow. The collaborative editing
                  features and\n intelligent automation tools have saved me so much time\n and effort.&quot;
                </p>
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">John Doe</h4>
                    <p className="text-muted-foreground text-sm">Content Creator</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                &quot;Versetta has been a game-changer for my video production\n workflow. The collaborative editing
                  features and\n intelligent automation tools have saved me so much time\n and effort.&quot;
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section> */}
    </main>
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-6 py-28">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-lg font-semibold text-gray-800">© 2024 Versetta. All rights reserved.</span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Link href="/terms" className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
              Terms of Service
            </Link>
            <Link href="/cancellation" className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
              Cancellation and Refund
            </Link>
            <Link href="/privacy" className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  </div>


  );
}


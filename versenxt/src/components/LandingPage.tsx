"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "lucide-react"
import AnimationComponent from './AnimationComponent';

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
    <nav className="flex gap-4 sm:gap-6">
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Features
      </Link>
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Pricing
      </Link>
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        About
      </Link>
      <Link href="#" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
        Contact
      </Link>
    </nav>
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
    <section className="w-full py-12 md:py-24 lg:py-32 xl:pb-55">
  <div className="container px-4 md:px-6 xl:pl-4 xl:pr-4">
    <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1.8fr_750px] xl:gap-64">
      <div className="flex flex-col justify-center space-y-4">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-6xl/none">
            Your Content&apos;s Headquarter
          </h1>
          <p className="max-w-[550px] text-muted-foreground md:text-xl">
            Versetta is a comprehensive video production platform designed to empower content creators.
            Streamline your workflow, collaborate seamlessly, and elevate your content to new heights.
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
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Elevate Your Content Creation</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Versetta offers a comprehensive suite of tools and features to streamline your video production
                workflow, from pre-production to post-production and beyond.
              </p>
              <h1>
                A commitment and promise to not charge you on the basis of number of team member. Add as many team member as you want without any extra cost.
              </h1>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="grid gap-1">
              <h3 className="text-xl font-bold">Collaborative Editing</h3>
              <p className="text-muted-foreground">
                Seamless real-time collaboration with your team, allowing you to review, comment, and iterate on your
                projects together.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-xl font-bold">Advanced Editing Tools</h3>
              <p className="text-muted-foreground">
                Powerful video editing tools, including multi-track timelines, color grading, and visual effects, to
                elevate your content.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-xl font-bold">Intelligent Automation</h3>
              <p className="text-muted-foreground">
                Streamline your workflow with intelligent automation features, such as smart transcoding and
                AI-powered suggestions.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-xl font-bold">Seamless Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly integrate Versetta with your existing tools and platforms, ensuring a smooth and efficient
                content creation process.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-xl font-bold">Robust Analytics</h3>
              <p className="text-muted-foreground">
                Gain valuable insights into your content&apos;s performance with comprehensive analytics and reporting
                tools.
              </p>
            </div>
            <div className="grid gap-1">
              <h3 className="text-xl font-bold">Secure Cloud Storage</h3>
              <p className="text-muted-foreground">
                Store your media assets securely in the cloud, with enterprise-grade security and seamless access from
                anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Pricing</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Choose the Plan That Fits Your Needs
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Versetta offers flexible pricing options to cater to content creators of all sizes and budgets.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl  items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Prime</h3>
                <p className="text-4xl font-bold">$99</p>
                <p className="text-muted-foreground">per month</p>
              </div>
              <div className="space-y-2">
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Task and project management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Comment analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Production pipeline
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Stats visualization
                  </li>
                </ul>
              </div>
            
            <Button
              onClick={handleSignUp}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-lg font-bold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Create your Team
            </Button>
        
            </Card>
            <Card className="p-6 space-y-4 opacity-50 pointer-events-none">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="text-4xl font-bold">Coming Soon</p>
              </div>
              <div className="space-y-2">
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Prime features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Storage and archiving solution
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Deep AI analysis for performance stats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Early access to new features
                  </li>
                </ul>
              </div>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </Card>
            <Card className="p-6 space-y-4 opacity-50 pointer-events-none">
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
                    Sponsorship marketplace (Sponsorship, Payments, Embargo)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Feature request
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500" />
                    Priority support
                  </li>
                </ul>
              </div>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </Card>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from our satisfied customers about their experience with Versetta.
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
      </section>
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
            <Link href="/privacy" className="text-base text-gray-600 hover:text-gray-900 transition-colors duration-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  </div>


  );
}


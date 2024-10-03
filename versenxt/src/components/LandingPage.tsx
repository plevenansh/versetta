"use client";
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth?action=getSignInUrl');
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error getting sign in URL:', error);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth?action=getSignUpUrl');
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error getting sign up URL:', error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
  <Link href="/" className="flex items-center">
    <Image
      src="/ver.png"
      alt="Versetta Icon"
      width={24}
      height={24}
      className="mr-2 sm:w-[31px] sm:h-[32px]"
    />
    <Image
      src="/verlongw.png"
      alt="Versetta Logo"
      width={160}
      height={28}
      className="hidden sm:block"
    />
  </Link>
  <div className="flex items-center space-x-2 sm:space-x-4">
    <button
      onClick={handleSignIn}
      className="hidden sm:inline-block text-white border border-blue-700 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold hover:bg-[#0057ff] transition-colors"
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Dashboard'}
    </button>
    <button
      onClick={handleSignUp}
      className="bg-[#0057ff] text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Create Your Team'}
    </button>
  </div>
</nav>

      {/* Hero Section */}
      <section className="w-full bg-black">
      <div className="max-w-[2000px] mx-auto px-4 lg:ml-12 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-48">
        <div className="flex flex-col lg:flex-row items-start lg:items-center lg:space-x-16 xl:space-x-24">
          <div className="lg:w-3/5 mb-12 lg:mb-0">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6 lg:mb-8">
              Your Content&#39;s Headquarter
            </h1>
            <p className="text-lg sm:text-xl mb-8 lg:mb-10 max-w-2xl">
              Streamline your content creation process from ideation to publishing with our all-in-one platform.
            </p>
            <button
            onClick={handleSignUp}
              className="inline-flex items-center bg-[#0057ff] text-white  px-8 py-4 font-semibold text-xl hover:bg-blue-600 transition-colors"
            >
              Create Your Team <ArrowRight className="ml-2" size={24} />
              {/* {isLoading ? 'Loading...' : 'Create Your Team'} */}
              </button>
          </div>
          <div className="lg:w-2/5">
  <ul className="space-y-8">
    {[
      "Video Production & Management",
      "Team Collaboration & Storage",
      "AI-Powered Comment Analysis",
    ].map((feature, index) => (
      <li 
        key={index} 
        className="flex items-center text-xl sm:text-2xl animate-fadeIn"
        style={{ animationDelay: `${index * 2.4}s` }}
      >
        <CheckCircle2 className="text-blue-700 mr-4 flex-shrink-0" size={32} />
        <span className="font-semibold">{feature}</span>
      </li>
    ))}
  </ul>
</div>
        </div>
      </div>
    </section>
      {/* Dashboard Preview */}
      <section className="relative w-full">
        <div className="container mx-auto px-4 pb-20">
          <Image
            src="/dashboard.png"
            alt="Versetta Dashboard Preview"
            width={1920}
            height={1080}
            layout="responsive"
            className="rounded-t-lg shadow-2xl"
            priority
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"></div>
      </section>

     {/* Features Section */}
<section className="container mx-auto px-4 py-20">
  <h2 className="text-4xl font-bold mb-12 text-center">Empower Your Content Creation</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[
      {
        title: "Ideation to Publishing",
        description: "Manage every stage of content creation in one place, from concept to final upload."
      },
      {
        title: "All-in-One Workspace",
        description: "Access a comprehensive dashboard that centralizes all aspects of your content creation process in one intuitive interface."
      },
      {
        title: "Team & Task Management",
        description: "Enhance collaboration with integrated tools for teams. Efficiently assign, track, and manage tasks for seamless project execution."
      },
    ].map((feature, index) => (
      <div key={index} className="bg-gray-900 p-6">
        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
        <p className="text-gray-400">{feature.description}</p>
      </div>
    ))}
  </div>
</section>


      {/* Video Management Feature */}
<section className="container mx-auto px-4 py-20">
  <div className="flex flex-col lg:flex-row items-center">
    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:mr-8">
      <Image
        src="/video.png"
        alt="Video Management"
        width={600}
        height={400}
        className="rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
      />
    </div>
    <div className="lg:w-1/2">
      <h3 className="text-3xl font-bold mb-4">Comprehensive Video Management</h3>
      <p className="text-lg mb-4">
        Our video management system guides you through every stage of content creation, from ideation to publishing:
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li className="text-blue-400">Ideation: Brainstorm and organize your ideas</li>
        <li className="text-blue-400">Pre-production: Plan scripts, storyboards, and resources</li>
        <li className="text-blue-400">Production: Track filming progress and manage assets</li>
        <li className="text-blue-400">Post-production: Streamline editing and collaboration</li>
        <li className="text-blue-400">Publishing: Schedule and distribute across platforms</li>
      </ul>
    </div>
  </div>
</section>

{/* Comment Analyzer Feature */}
<section className="container mx-auto px-4 py-20">
  <div className="flex flex-col lg:flex-row-reverse items-center">
    <div className="lg:w-1/2 mb-8 lg:mb-0 lg:ml-8">
      <Image
        src="/comment.png"
        alt="Comment Analyzer"
        width={600}
        height={400}
        className="rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
      />
    </div>
    <div className="lg:w-1/2">
      <h3 className="text-3xl font-bold mb-4">AI-Powered Comment Analyzer</h3>
      <p className="text-lg mb-4">
        Harness the power of AI to gain valuable insights from your video comments:
      </p>
      <ul className="list-disc list-inside space-y-2">
        <li className="text-blue-400">Sentiment Analysis: Understand viewer emotions</li>
        <li className="text-blue-400">Comment Summarization: Get quick overviews</li>
        <li className="text-blue-400">Video Idea Generation: Discover new content opportunities</li>
        <li className="text-blue-400">Feedback Extraction: Identify areas for improvement</li>
        <li className="text-blue-400">Trend Detection: Stay ahead of your audience&#39;s interests</li>
      </ul>
    </div>
  </div>
</section>




{/* Coming Soon Section */}
<section className="container mx-auto px-4 py-20">
  <h2 className="text-4xl font-bold mb-12 text-center">Coming Soon</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[
      {
        title: "Asset Management",
        description: "Store and organize all your content assets with version history and easy access."
      },
      {
        title: "AI-Powered Content",
        description: "Leverage AI for content generation, research assistance, optimization and more."
      },
      {
        title: "Comprehensive Analytics",
        description: "Gain deep insights into your content's performance with detailed analytics and reports."
      },
    ].map((feature, index) => (
      <div key={index} className="bg-gray-800 p-6 border border-[#0057ff] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
        <h3 className="text-xl font-semibold mb-3 text-blue-400">{feature.title}</h3>
        <p className="text-gray-300">{feature.description}</p>
        <div className="mt-4">
          <span className="inline-block bg-[#0057ff] text-white text-xs px-2 py-1 rounded">Coming Soon</span>
        </div>
      </div>
    ))}
  </div>
</section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Join Us on This Journey</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Become an early member and help shape the future of content creation. Your support and feedback are invaluable as we build the ultimate workspace for content creators.
        </p>
        <button
            onClick={handleSignUp}
          className="inline-flex items-center bg-[#0057ff] text-white px-12 py-4 font-semibold text-xl hover:bg-blue-600 transition-colors"
        >
          Create Your Team
        </button>
      </section>

      
     {/* Footer */}
    <footer className="bg-gray-900  py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Versetta. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-4">
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms and Conditions
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refunds" className="text-gray-400 hover:text-white transition-colors">
              Refunds Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </div>
  )
}
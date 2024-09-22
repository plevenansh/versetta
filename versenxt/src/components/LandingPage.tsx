import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-3 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center">
        <Image
          src="/ver.png"
          alt="Versetta Logo"
          width={24}
          height={24}
          className="mr-2 sm:w-[31px] sm:h-[32px]"
        />
        <span className="text-lg sm:text-xl lg:text-2xl font-bold">Versetta</span>
      </Link>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link
          href="/dashboard"
          className="hidden sm:inline-block text-white border border-blue-700 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/create-team"
          className="bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          Create Your Team
        </Link>
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
            <Link
              href="/create-team"
              className="inline-flex items-center bg-blue-700 text-white  px-8 py-4 font-semibold text-xl hover:bg-blue-600 transition-colors"
            >
              Create Your Team <ArrowRight className="ml-2" size={24} />
            </Link>
          </div>
          <div className="lg:w-2/5">
            <ul className="space-y-6">
              {[
                "Video Production & Management ",
                "Team Collaboration & Storage",
                "AI-Powered Comment Analysis",
               
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-lg sm:text-xl">
                  <CheckCircle2 className="text-blue-700 mr-3 flex-shrink-0" size={24} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
      {/* Dashboard Preview */}
      <section className="relative">
        <div className="container mx-auto px-4 pb-20">
          <Image
            src="/dashboard.png"
            alt="Versetta Dashboard Preview"
            width={1200}
            height={600}
            className="rounded-t-l shadow-2xl"
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
              title: "Team Collaboration",
              description: "Seamlessly work with your team, assign tasks, and track progress in real-time."
            },
            {
              title: "AI-Powered Insights",
              description: "Leverage AI for comment analysis, content research, and performance optimization."
            },
            {
              title: "Comprehensive Analytics",
              description: "Gain deep insights into your content's performance with detailed analytics and reports."
            },
            {
              title: "Asset Management",
              description: "Store and organize all your content assets with version history and easy access."
            },
            {
              title: "Cross-Platform Publishing",
              description: "Streamline your publishing process across multiple platforms with integrated tools."
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-900 p-6">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
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
        <Link
          href="/create-team"
          className="inline-flex items-center bg-blue-700 text-white px-12 py-4 font-semibold text-xl hover:bg-blue-600 transition-colors"
        >
          Create Your Team
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Versetta. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
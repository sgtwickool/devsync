import Link from "next/link";
import { Code2, Share2, Search, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">DevSync</span>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-primary bg-clip-text text-transparent">
            Your Team's Code Knowledge,
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">Organized & Accessible</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Stop searching through Slack threads and scattered wikis. 
            DevSync helps your team capture, organize, and share code snippets, 
            commands, and workflows in one beautiful place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register"
              className="group px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-primary/90 hover:to-blue-600/90 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-100"
            >
              Get Started Free
            </Link>
            <Link 
              href="/login"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl text-lg font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all hover:shadow-lg hover:scale-105 active:scale-100"
            >
              View Demo
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          <FeatureCard 
            icon={<Code2 className="w-10 h-10 text-primary" />}
            title="Syntax Highlighting"
            description="Beautiful code rendering with support for 100+ languages"
          />
          <FeatureCard 
            icon={<Search className="w-10 h-10 text-primary" />}
            title="Powerful Search"
            description="Find any snippet instantly with full-text search and tags"
          />
          <FeatureCard 
            icon={<Share2 className="w-10 h-10 text-primary" />}
            title="Team Collaboration"
            description="Share snippets with your team or keep them private"
          />
          <FeatureCard 
            icon={<Lock className="w-10 h-10 text-primary" />}
            title="Secure & Private"
            description="Your code stays yours. Self-host or use our cloud"
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) {
  return (
    <div className="group relative p-6 border border-border rounded-xl bg-gradient-to-br from-white to-white/95 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover-lift overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Code2, Share2, Search, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="border-b">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Team's Code Knowledge,
            <br />
            <span className="text-primary">Organized & Accessible</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Stop searching through Slack threads and scattered wikis. 
            DevSync helps your team capture, organize, and share code snippets, 
            commands, and workflows in one beautiful place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register"
              className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary/90"
            >
              Get Started Free
            </Link>
            <Link 
              href="/login"
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-400"
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
    <div className="p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

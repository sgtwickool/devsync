import Link from "next/link";
import { Code2, Share2, Search, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.06),transparent_50%)]" />
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">DevSync</span>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Your Team's Code Knowledge,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">Organized & Accessible</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Stop searching through Slack threads and scattered wikis.
            DevSync helps your team capture, organize, and share code snippets,
            commands, and workflows in one beautiful place.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 dark:hover:shadow-primary/10 hover:scale-105 active:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Get Started Free</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-border text-foreground rounded-xl text-lg font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all hover:shadow-lg hover:scale-105 active:scale-100"
            >
              View Demo
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          <FeatureCard 
            icon={<Code2 className="w-10 h-10 text-primary" />}
            title="Syntax Highlighting"
            description="Beautiful code rendering with support for 150+ languages"
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
    <div className="group relative p-6 border border-border rounded-xl bg-gradient-to-br from-card via-card to-primary/5 shadow-sm hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-primary/5 transition-all duration-300 hover-lift overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

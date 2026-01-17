import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Calendar, Tag, Code2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { CodeViewer } from "@/components/snippets/code-viewer"
import { CopyCodeButton } from "@/components/snippets/copy-code-button"
import { formatFullDate, getLanguageColor } from "@/lib/utils"
import type { Metadata } from "next"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  const snippet = await prisma.snippet.findUnique({
    where: { id, visibility: "PUBLIC" },
    select: { title: true, description: true, language: true },
  })

  if (!snippet) {
    return { title: "Snippet Not Found - DevSync" }
  }

  return {
    title: `${snippet.title} - DevSync`,
    description: snippet.description || `A ${snippet.language} code snippet shared via DevSync`,
  }
}

export default async function PublicSnippetPage({ params }: PageProps) {
  const { id } = await params

  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  // Only show public snippets
  if (!snippet || snippet.visibility !== "PUBLIC") {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            DevSync
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign in
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-foreground">{snippet.title}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${getLanguageColor(snippet.language)}`}>
              {snippet.language}
            </span>
          </div>
          {snippet.description && (
            <p className="text-muted-foreground text-lg">{snippet.description}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground bg-card border border-border rounded-lg p-4">
          {snippet.user?.name && (
            <div className="flex items-center gap-2">
              <span>Shared by <span className="font-medium text-foreground">{snippet.user.name}</span></span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>Created {formatFullDate(snippet.createdAt)}</span>
          </div>
          {snippet.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" aria-hidden="true" />
              <div className="flex flex-wrap gap-1.5">
                {snippet.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs font-medium"
                  >
                    <span className="opacity-70">#</span>
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" aria-hidden="true" />
              Code
            </h2>
            <CopyCodeButton code={snippet.code} />
          </div>
          <CodeViewer code={snippet.code} language={snippet.language} />
        </div>

        {/* CTA */}
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Want to create and share your own snippets?
          </h3>
          <p className="text-muted-foreground mb-4">
            DevSync is a free, open-source code snippet manager with team collaboration.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </main>
    </div>
  )
}

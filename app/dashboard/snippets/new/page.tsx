"use client"

import { createSnippet } from "@/lib/actions/snippets"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowLeft, FileCode, Code2, Sparkles, AlertCircle, CheckCircle2, Loader2, ChevronDown, Tag } from "lucide-react"
import Link from "next/link"
import { LANGUAGES } from "@/lib/constants/languages"
import { TagInput } from "@/components/snippets/tag-input"

export default function NewSnippetPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [titleLength, setTitleLength] = useState(0)
  const [descriptionLength, setDescriptionLength] = useState(0)
  const [codeLength, setCodeLength] = useState(0)
  const [tags, setTags] = useState<string[]>([])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("tags", JSON.stringify(tags))
    
    startTransition(async () => {
      const result = await createSnippet(formData)

      if ("error" in result) {
        setError(result.error)
        return
      }

      // Redirect to snippet detail page on success
      router.push(`/dashboard/snippets/${result.snippetId}`)
    })
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          aria-label="Back to snippets"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Snippets</span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Snippet</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Save your code snippets for quick access later
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div 
            className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <label 
              htmlFor="title" 
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <FileCode className="w-4 h-4 text-primary" aria-hidden="true" />
              Title
              <span className="text-destructive" aria-label="required">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              onChange={(e) => setTitleLength(e.target.value.length)}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80"
              placeholder="e.g., Quick Sort Algorithm"
              aria-describedby="title-hint title-count"
            />
            <div className="flex items-center justify-between">
              <p id="title-hint" className="text-xs text-muted-foreground">
                Choose a descriptive name for easy searching
              </p>
              <span 
                id="title-count" 
                className="text-xs text-muted-foreground tabular-nums"
                aria-live="polite"
              >
                {titleLength}/200
              </span>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label 
              htmlFor="description" 
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              Description
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={500}
              onChange={(e) => setDescriptionLength(e.target.value.length)}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground resize-none transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80"
              placeholder="What does this snippet do? When would you use it?"
              aria-describedby="description-hint description-count"
            />
            <div className="flex items-center justify-between">
              <p id="description-hint" className="text-xs text-muted-foreground">
                Add context to help you remember this snippet later
              </p>
              <span 
                id="description-count" 
                className="text-xs text-muted-foreground tabular-nums"
                aria-live="polite"
              >
                {descriptionLength}/500
              </span>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <label 
              htmlFor="language" 
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Code2 className="w-4 h-4 text-primary" aria-hidden="true" />
              Programming Language
              <span className="text-destructive" aria-label="required">*</span>
            </label>
            <div className="relative">
              <select
                id="language"
                name="language"
                required
                className="w-full px-4 py-3 pr-10 bg-background border border-input rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80 appearance-none cursor-pointer"
                aria-describedby="language-hint"
              >
                <option value="">Select a language...</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <ChevronDown 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" 
                aria-hidden="true"
              />
            </div>
            <p id="language-hint" className="text-xs text-muted-foreground">
              Used for syntax highlighting and organization
            </p>
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <label 
              htmlFor="tags" 
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Tag className="w-4 h-4 text-primary" aria-hidden="true" />
              Tags
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="e.g., algorithm, sorting, python"
            />
          </div>

          {/* Code Editor */}
          <div className="space-y-2">
            <label 
              htmlFor="code" 
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              Code
              <span className="text-destructive" aria-label="required">*</span>
            </label>
            <div className="relative">
              <textarea
                id="code"
                name="code"
                required
                rows={18}
                onChange={(e) => setCodeLength(e.target.value.length)}
                className="w-full px-4 py-4 bg-[#1e1e1e] border border-input rounded-lg font-mono text-sm text-[#d4d4d4] placeholder:text-muted-foreground/50 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80 leading-relaxed"
                placeholder="// Paste your code here...&#10;// Or start typing your snippet"
                aria-describedby="code-hint code-count"
                spellCheck="false"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span 
                  id="code-count" 
                  className="text-xs text-muted-foreground/70 tabular-nums bg-background/80 px-2 py-1 rounded"
                  aria-live="polite"
                >
                  {codeLength} characters
                </span>
              </div>
            </div>
            <p id="code-hint" className="text-xs text-muted-foreground">
              Paste or type your code snippet. Supports all programming languages.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 sm:flex-none sm:min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
            aria-label={isPending ? "Creating snippet..." : "Create snippet"}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Create Snippet</span>
              </>
            )}
          </button>
          <Link
            href="/dashboard"
            className="flex-1 sm:flex-none sm:min-w-[140px] flex items-center justify-center px-6 py-3 border border-input bg-background text-foreground rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
            aria-label="Cancel and return to dashboard"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}


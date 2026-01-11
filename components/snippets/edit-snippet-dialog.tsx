"use client"

import { updateSnippet } from "@/lib/actions/snippets"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Edit, ChevronDown } from "lucide-react"
import { LANGUAGES } from "@/lib/constants/languages"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"

interface EditSnippetDialogProps {
  snippet: {
    id: string
    title: string
    description: string | null
    code: string
    language: string
  }
}

export function EditSnippetDialog({ snippet }: EditSnippetDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await updateSnippet(snippet.id, formData)

      if ("error" in result) {
        setError(result.error)
        return
      }

      setIsOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-foreground bg-card border border-border rounded-lg font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
        aria-label="Edit snippet"
      >
        <Edit className="w-4 h-4" aria-hidden="true" />
        <span>Edit</span>
      </button>

      {isOpen && (
        <Dialog
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false)
            setError(null)
          }}
          title="Edit Snippet"
          maxWidth="4xl"
          footer={
            <div className="flex gap-3">
              <LoadingButton
                form="edit-snippet-form"
                type="submit"
                isLoading={isPending}
                loadingText="Saving..."
                variant="primary"
                className="flex-1"
              >
                Save Changes
              </LoadingButton>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setError(null)
                }}
                disabled={isPending}
                className="px-6 py-3 text-foreground bg-card border border-border rounded-lg font-semibold hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
            </div>
          }
        >
          <ErrorAlert error={error || undefined} />

              <form id="edit-snippet-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-semibold text-foreground mb-1">
                    Title *
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    defaultValue={snippet.title}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="edit-description" className="block text-sm font-semibold text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    rows={3}
                    defaultValue={snippet.description || ""}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Optional description..."
                  />
                </div>

                <div>
                  <label htmlFor="edit-language" className="block text-sm font-semibold text-foreground mb-1">
                    Language *
                  </label>
                  <div className="relative">
                    <select
                      id="edit-language"
                      name="language"
                      required
                      defaultValue={snippet.language}
                      className="w-full px-4 py-3 pr-10 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer"
                    >
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
                </div>

                <div>
                  <label htmlFor="edit-code" className="block text-sm font-semibold text-foreground mb-1">
                    Code *
                  </label>
                  <textarea
                    id="edit-code"
                    name="code"
                    required
                    rows={15}
                    defaultValue={snippet.code}
                    className="w-full px-4 py-4 bg-[#1e1e1e] border border-input rounded-lg font-mono text-sm text-[#d4d4d4] placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent leading-relaxed"
                    spellCheck="false"
                  />
                </div>
              </form>
        </Dialog>
      )}
    </>
  )
}


"use client"

import { updateSnippet } from "@/lib/actions/snippets"
import { useRouter } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import { Edit, ChevronDown, Tag, AlertTriangle, Building2 } from "lucide-react"
import { LANGUAGES } from "@/lib/constants/languages"
import { Dialog } from "@/components/ui/dialog"
import { ErrorAlert } from "@/components/ui/error-alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { TagInput } from "@/components/snippets/tag-input"
import { CodeEditor } from "@/components/snippets/code-editor"
import { VisibilitySelector } from "@/components/snippets/visibility-selector"
import { toast } from "sonner"

interface Organization {
  id: string
  name: string
  slug: string
}

interface EditSnippetDialogProps {
  snippet: {
    id: string
    title: string
    description: string | null
    code: string
    language: string
    visibility: "PRIVATE" | "TEAM" | "PUBLIC"
    organizationId: string | null
    tags: Array<{ tag: { name: string } }>
  }
}

export function EditSnippetDialog({ snippet }: EditSnippetDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [tags, setTags] = useState<string[]>([])
  const [titleLength, setTitleLength] = useState(snippet.title.length)
  const [descriptionLength, setDescriptionLength] = useState(snippet.description?.length ?? 0)
  const [code, setCode] = useState(snippet.code)
  const [language, setLanguage] = useState(snippet.language)
  const [visibility, setVisibility] = useState<"PRIVATE" | "TEAM" | "PUBLIC">(snippet.visibility)
  const [organizations, setOrganizations] = useState<Array<{ organization: Organization }>>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [showPromotionWarning, setShowPromotionWarning] = useState(false)

  // Fetch organizations when dialog opens (only for personal snippets)
  useEffect(() => {
    if (isOpen && snippet.organizationId === null) {
      async function fetchOrganizations() {
        try {
          const response = await fetch("/api/organizations")
          if (response.ok) {
            const data = await response.json()
            setOrganizations(data)
          }
        } catch {
          // Silently fail - organizations are optional
        }
      }
      fetchOrganizations()
    }
  }, [isOpen, snippet.organizationId])

  useEffect(() => {
    if (isOpen) {
      setTags(snippet.tags.map(({ tag }) => tag.name))
      setTitleLength(snippet.title.length)
      setDescriptionLength(snippet.description?.length ?? 0)
      setCode(snippet.code)
      setLanguage(snippet.language)
      setVisibility(snippet.visibility)
      setSelectedOrgId("")
      setShowPromotionWarning(false)
    }
  }, [isOpen, snippet.tags, snippet.title, snippet.description, snippet.code, snippet.language, snippet.visibility])

  function handleOrgChange(orgId: string) {
    setSelectedOrgId(orgId)
    setShowPromotionWarning(!!orgId)
    
    if (orgId) {
      // Promoting to org: default to TEAM visibility
      setVisibility("TEAM")
    } else {
      // Deselecting org: if TEAM was selected, reset to PRIVATE (TEAM is invalid without org)
      if (visibility === "TEAM") {
        setVisibility("PRIVATE")
      }
    }
  }

  // Handle visibility changes with org synchronization
  function handleVisibilityChange(newVisibility: "PRIVATE" | "TEAM" | "PUBLIC") {
    const hasOrg = !!snippet.organizationId || !!selectedOrgId
    
    if (newVisibility === "TEAM" && !hasOrg) {
      // Can't select TEAM without an organization
      return
    }
    
    // If changing from TEAM to PRIVATE, deselect the org
    // (promoting to org but keeping private doesn't make sense)
    if (visibility === "TEAM" && newVisibility === "PRIVATE" && selectedOrgId) {
      setSelectedOrgId("")
      setShowPromotionWarning(false)
    }
    
    setVisibility(newVisibility)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("tags", JSON.stringify(tags))
    formData.append("visibility", visibility)
    
    // Include organizationId if promoting to an org
    if (selectedOrgId) {
      formData.append("organizationId", selectedOrgId)
    }
    
    startTransition(async () => {
      const result = await updateSnippet(snippet.id, formData)

      if ("error" in result) {
        setError(result.error)
        toast.error("Failed to update snippet", {
          description: result.error,
        })
        return
      }

      const successMessage = selectedOrgId 
        ? "Snippet promoted to organization" 
        : "Snippet updated successfully"
      toast.success(successMessage)
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
                <div className="space-y-2">
                  <label htmlFor="edit-title" className="block text-sm font-semibold text-foreground mb-1">
                    Title *
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    maxLength={200}
                    defaultValue={snippet.title}
                    onChange={(e) => setTitleLength(e.target.value.length)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all hover:border-input/80"
                    aria-describedby="edit-title-count"
                  />
                  <div className="flex items-center justify-end">
                    <span 
                      id="edit-title-count" 
                      className="text-xs text-muted-foreground tabular-nums"
                      aria-live="polite"
                    >
                      {titleLength}/200
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="edit-description" className="block text-sm font-semibold text-foreground mb-1">
                    Description
                    <span className="text-xs font-normal text-muted-foreground ml-2">(optional)</span>
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    rows={3}
                    maxLength={500}
                    defaultValue={snippet.description || ""}
                    onChange={(e) => setDescriptionLength(e.target.value.length)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all hover:border-input/80"
                    placeholder="What does this snippet do? When would you use it?"
                    aria-describedby="edit-description-count"
                  />
                  <div className="flex items-center justify-end">
                    <span 
                      id="edit-description-count" 
                      className="text-xs text-muted-foreground tabular-nums"
                      aria-live="polite"
                    >
                      {descriptionLength}/500
                    </span>
                  </div>
                </div>

                  {/* Organization Promotion - only for personal snippets */}
                  {snippet.organizationId === null && organizations.length > 0 && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label
                          htmlFor="edit-organizationId"
                          className="flex items-center gap-2 text-sm font-semibold text-foreground"
                        >
                          <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
                          Promote to Organization
                          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                        </label>
                        <select
                          id="edit-organizationId"
                          value={selectedOrgId}
                          onChange={(e) => handleOrgChange(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80"
                        >
                          <option value="">Keep as Personal Snippet</option>
                          {organizations.map(({ organization }) => (
                            <option key={organization.id} value={organization.id}>
                              {organization.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {showPromotionWarning && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-amber-800 dark:text-amber-400">
                              This action cannot be undone
                            </p>
                            <p className="text-amber-700 dark:text-amber-500 mt-1">
                              Moving this snippet to an organization is permanent. All team members will be able to see it based on the visibility setting below.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <VisibilitySelector
                    value={visibility}
                    onChange={handleVisibilityChange}
                    hasOrganization={!!snippet.organizationId || !!selectedOrgId}
                  />

                  <div>
                    <label htmlFor="edit-tags" className="block text-sm font-semibold text-foreground mb-1">
                      <Tag className="w-4 h-4 inline mr-1.5 text-primary" aria-hidden="true" />
                      Tags
                      <span className="text-xs font-normal text-muted-foreground ml-2">(optional)</span>
                    </label>
                    <TagInput
                      tags={tags}
                      onChange={setTags}
                      placeholder="e.g., algorithm, sorting, python"
                      organizationId={selectedOrgId || snippet.organizationId}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-language" className="block text-sm font-semibold text-foreground mb-1">
                      Language *
                    </label>
                    <div className="relative">
                    <select
                      id="edit-language"
                      name="language"
                      required
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all hover:border-input/80 appearance-none cursor-pointer"
                      aria-describedby="edit-language-hint"
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
                    <p id="edit-language-hint" className="text-xs text-muted-foreground">
                      Used for syntax highlighting and organization
                    </p>
                  </div>

                <div className="space-y-2">
                  <label htmlFor="edit-code" className="block text-sm font-semibold text-foreground mb-1">
                    Code *
                  </label>
                  <div className="relative">
                    <CodeEditor
                      id="edit-code"
                      name="code"
                      value={code}
                      onChange={setCode}
                      language={language}
                      required
                      rows={15}
                      placeholder="// Paste your code here...&#10;// Or start typing your snippet"
                      aria-describedby="edit-code-count"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
                      <span 
                        id="edit-code-count" 
                        className="text-xs text-[#d4d4d4]/90 tabular-nums bg-[#252526] border border-[#3e3e42] px-2.5 py-1 rounded-md shadow-sm"
                        aria-live="polite"
                      >
                        {code.length} characters
                      </span>
                    </div>
                  </div>
                </div>
              </form>
        </Dialog>
      )}
    </>
  )
}


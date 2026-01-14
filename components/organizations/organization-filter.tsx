"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrganizationFilterProps {
  organizations: Array<{
    organization: {
      id: string
      name: string
      slug: string
    }
  }>
  basePath?: string
}

export function OrganizationFilter({ organizations, basePath = "/dashboard" }: OrganizationFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get("org") || "all"

  function handleFilterChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === "all") {
      params.delete("org")
    } else {
      params.set("org", value)
    }
    
    // Reset to first page when filtering
    params.delete("page")
    
    router.push(`${basePath}?${params.toString()}`)
  }

  if (organizations.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-sm font-semibold text-foreground">Filter:</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            currentFilter === "all" || !currentFilter
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange("personal")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            currentFilter === "personal"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
        >
          Personal
        </button>
        {organizations.map(({ organization }) => (
          <button
            key={organization.id}
            onClick={() => handleFilterChange(organization.slug)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5",
              currentFilter === organization.slug
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{organization.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

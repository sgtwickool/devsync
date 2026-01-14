"use client"

import { Building2, User } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
}

interface OrganizationSelectorProps {
  organizations: Array<{
    organization: Organization
  }>
  value?: string
  onChange: (value: string) => void
}

export function OrganizationSelector({
  organizations,
  value,
  onChange,
}: OrganizationSelectorProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="organizationId"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
        Organization
        <span className="text-xs font-normal text-muted-foreground">(optional)</span>
      </label>
      <select
        id="organizationId"
        name="organizationId"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-input/80"
      >
        <option value="">Personal (My Snippets)</option>
        {organizations.map(({ organization }) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Create this snippet in an organization to share it with your team
      </p>
    </div>
  )
}

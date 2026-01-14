"use client"

import { Lock, Users, Globe } from "lucide-react"

interface VisibilitySelectorProps {
  value: "PRIVATE" | "TEAM" | "PUBLIC"
  onChange: (value: "PRIVATE" | "TEAM" | "PUBLIC") => void
  hasOrganization: boolean
}

export function VisibilitySelector({
  value,
  onChange,
  hasOrganization,
}: VisibilitySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        Visibility
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onChange("PRIVATE")}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            value === "PRIVATE"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Private</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Only you can see this snippet
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("TEAM")}
          disabled={!hasOrganization}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            value === "TEAM"
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          } ${!hasOrganization ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">Team</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {hasOrganization
              ? "All organization members can see this"
              : "Select an organization first"}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("PUBLIC")}
          disabled={true}
          className="p-4 border-2 rounded-lg text-left transition-all border-border opacity-50 cursor-not-allowed"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">Public</span>
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with the link can see this
          </p>
        </button>
      </div>
      <input type="hidden" name="visibility" value={value} />
    </div>
  )
}

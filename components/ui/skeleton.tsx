import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-muted rounded", className)}
      aria-hidden="true"
    />
  )
}

export function SnippetCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function SnippetListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6" aria-label="Loading snippets">
      {Array.from({ length: count }).map((_, i) => (
        <SnippetCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CollectionCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function CollectionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6" aria-label="Loading collections">
      {Array.from({ length: count }).map((_, i) => (
        <CollectionCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Full page loading skeleton for reports page
 * Matches exact dimensions of final report content to prevent layout shift
 */
export function ReportPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Team header skeleton */}
      <Skeleton className="h-8 w-64" />

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-4">
        {/* Team selector */}
        <Skeleton className="h-10 w-[200px]" />
        {/* Match count selector */}
        <Skeleton className="h-10 w-[120px]" />
        {/* Date range picker */}
        <Skeleton className="h-10 w-[180px]" />
        {/* Filter area */}
        <Skeleton className="h-10 w-[200px]" />
      </div>

      {/* Tabs skeleton */}
      <div className="space-y-4">
        {/* Tab triggers */}
        <div className="flex gap-2 border-b pb-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Content area skeleton - grid of stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Filter bar loading skeleton
 * Used in Suspense boundaries around filter components
 */
export function ReportFiltersSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-10 w-[300px]" /> {/* Team selector */}
      <Skeleton className="h-10 w-[200px]" /> {/* Match count */}
    </div>
  )
}

/**
 * Report content loading skeleton
 * Matches report content dimensions (sections with headings + content)
 */
export function ReportContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" /> {/* Section heading */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-56" /> {/* Section heading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>

      {/* Section 3 */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" /> {/* Section heading */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

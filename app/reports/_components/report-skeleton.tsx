import { Skeleton } from '@/components/ui/skeleton'

export function ReportFiltersSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-10 w-[300px]" /> {/* Team selector */}
      <Skeleton className="h-10 w-[200px]" /> {/* Match count */}
    </div>
  )
}

import { Suspense } from 'react'
import { getTeams } from '@/app/lib/data/teams'
import { FilterBar } from './_components/filter-bar'
import { ReportFiltersSkeleton } from './_components/report-skeleton'

export default async function ReportsPage() {
  const teams = await getTeams()

  return (
    <div className="min-h-screen bg-background">
      {/* Valorant-Themed Header Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-lg" style={{ borderColor: 'rgba(255, 70, 85, 0.2)' }}>
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--valorant-red), var(--valorant-gold))' }}></div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gradient-valorant">
                  MOSAIC
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Valorant Competitive Intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Filter Bar + Content */}
      <Suspense fallback={<ReportFiltersSkeleton />}>
        <FilterBar teams={teams} />
      </Suspense>
    </div>
  )
}

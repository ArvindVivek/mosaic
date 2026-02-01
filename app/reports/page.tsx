import { Suspense } from 'react'
import { getTeams } from '@/app/lib/data/teams'
import { FilterBar } from './_components/filter-bar'
import { ReportFiltersSkeleton } from './_components/report-skeleton'

export default async function ReportsPage() {
  const teams = await getTeams()

  return (
    <div className="min-h-screen bg-gradient-to-br from-valorant-darker via-valorant-dark to-valorant-darker">
      {/* Valorant-Themed Header Bar */}
      <div className="border-b border-valorant-red/20 bg-valorant-dark/80 backdrop-blur-sm sticky top-0 z-10 shadow-2xl shadow-valorant-red/10">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 bg-gradient-to-b from-valorant-red to-valorant-gold rounded-full"></div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-valorant-red to-valorant-gold bg-clip-text text-transparent">
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

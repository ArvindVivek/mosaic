import { Suspense } from 'react'
import { getTeams } from '@/app/lib/data/teams'
import { getTournaments, getMaps } from '@/app/lib/data/matches'
import { FilterBar } from './_components/filter-bar'
import { ReportFiltersSkeleton } from './_components/report-skeleton'

export default async function ReportsPage() {
  const [teams, tournaments, maps] = await Promise.all([
    getTeams(),
    getTournaments(),
    getMaps(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      {/* Compact Header Bar */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold tracking-tight">
                VALORANT Scouting Reports
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                VCT Americas Analytics Dashboard
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {teams.length} teams available
            </div>
          </div>
        </div>
      </div>

      {/* Unified Filter Bar + Content */}
      <Suspense fallback={<ReportFiltersSkeleton />}>
        <FilterBar teams={teams} tournaments={tournaments} maps={maps} />
      </Suspense>
    </div>
  )
}

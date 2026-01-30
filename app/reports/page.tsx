import { Suspense } from 'react'
import { getTeams } from '@/app/lib/data/teams'
import { getTournaments, getMaps } from '@/app/lib/data/matches'
import { TeamSelector } from './_components/team-selector'
import { MatchCountSelector } from './_components/match-count-selector'
import { FilterTournament } from './_components/filter-tournament'
import { FilterMap } from './_components/filter-map'
import { ActiveFilters } from './_components/active-filters'
import { ReportFiltersSkeleton } from './_components/report-skeleton'
import { ReportSectionWrapper } from './_components/report-section-wrapper'

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

      {/* Horizontal Filter Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <Suspense fallback={<ReportFiltersSkeleton />}>
            <div className="flex flex-wrap items-center gap-6">
              {/* Team Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Team
                </span>
                <TeamSelector teams={teams} />
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-border hidden sm:block" />

              {/* Match Count */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Matches
                </span>
                <MatchCountSelector />
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-border hidden sm:block" />

              {/* Filters */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Filters
                </span>
                <div className="flex gap-2">
                  <FilterTournament tournaments={tournaments} />
                  <FilterMap maps={maps} />
                </div>
              </div>
            </div>

            {/* Active Filters - Inline */}
            <ActiveFilters teams={teams} tournaments={tournaments} />
          </Suspense>
        </div>
      </div>

      {/* Main Content Area - Full Width Dashboard */}
      <div className="container mx-auto px-6 py-6">
        <ReportSectionWrapper teams={teams} />
      </div>
    </div>
  )
}

import { Suspense } from 'react'
import { getTeams } from '@/app/lib/data/teams'
import { getTournaments, getMaps } from '@/app/lib/data/matches'
import { TeamSelector } from './_components/team-selector'
import { MatchCountSelector } from './_components/match-count-selector'
import { FilterDateRange } from './_components/filter-date-range'
import { FilterTournament } from './_components/filter-tournament'
import { FilterMap } from './_components/filter-map'
import { ActiveFilters } from './_components/active-filters'
import { ReportFiltersSkeleton } from './_components/report-skeleton'
import { ReportSection } from './_components/report-section'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>
}) {
  const params = await searchParams
  const [teams, tournaments, maps] = await Promise.all([
    getTeams(),
    getTournaments(),
    getMaps(),
  ])

  // Find selected team
  const selectedTeam = params.team ? teams.find(t => t.id === params.team) : null

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            VALORANT Scouting Reports
          </h1>
          <p className="text-gray-600">
            Generate comprehensive pre-match scouting reports for VCT Americas
            teams. Select a team and configure match analysis parameters to get
            started.
          </p>
        </div>

        {/* Selection UI */}
        <div className="border rounded-lg p-6 bg-white shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Configure Report</h2>

            <Suspense fallback={<ReportFiltersSkeleton />}>
              <div className="space-y-6">
                {/* Team and Match Count */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Select Team
                    </label>
                    <TeamSelector teams={teams} />
                  </div>

                  <MatchCountSelector />
                </div>

                {/* Filters Section */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    Filter Matches
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FilterDateRange />
                    <FilterTournament tournaments={tournaments} />
                    <FilterMap maps={maps} />
                  </div>
                </div>

                {/* Active Filters */}
                <ActiveFilters teams={teams} tournaments={tournaments} />
              </div>
            </Suspense>
          </div>

        </div>

        {/* Report Generation and Display */}
        {selectedTeam ? (
          <Suspense fallback={<div className="text-gray-500">Loading report generator...</div>}>
            <ReportSection
              teamId={selectedTeam.id}
              teamName={selectedTeam.name}
            />
          </Suspense>
        ) : (
          <div className="border rounded-lg p-8 bg-gray-50 text-center">
            <p className="text-gray-600">
              Select a team above to generate a scouting report
            </p>
          </div>
        )}

        {/* Team List Info */}
        <div className="text-sm text-gray-500">
          {teams.length} VCT Americas teams available for analysis
        </div>
      </div>
    </div>
  )
}

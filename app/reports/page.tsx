import { Suspense } from 'react'
import { getTeams } from '@/app/lib/data/teams'
import { TeamSelector } from './_components/team-selector'
import { MatchCountSelector } from './_components/match-count-selector'
import { ReportFiltersSkeleton } from './_components/report-skeleton'

export default async function ReportsPage() {
  const teams = await getTeams()

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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Team
                  </label>
                  <TeamSelector teams={teams} />
                </div>

                <MatchCountSelector />
              </div>
            </Suspense>
          </div>

          {/* TODO: Generate Report Button - Will be implemented in 04-03 */}
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Select a team and match count to generate a report
            </p>
          </div>
        </div>

        {/* Team List Info */}
        <div className="text-sm text-gray-500">
          {teams.length} VCT Americas teams available for analysis
        </div>
      </div>
    </div>
  )
}

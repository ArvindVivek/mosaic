'use client'

import { useState, useEffect } from 'react'
import { parseAsString, parseAsInteger, parseAsStringLiteral, useQueryState } from 'nuqs'
import { useSearchParams } from 'next/navigation'
import { FileSearch, ArrowUp, Share2 } from 'lucide-react'
import { loadSnapshot } from '@/app/actions/snapshots'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TeamSelector } from './team-selector'
import { MatchCountSelector } from './match-count-selector'
import { FilterTournament } from './filter-tournament'
import { FilterMap } from './filter-map'
import { ActiveFilters } from './active-filters'
import { ReportGenerator } from '@/app/components/report-generator'
import { ReportTabs } from './report-tabs'
import { ReportDisplay } from './report-display'
import type { Team } from '@/app/lib/data/teams'
import type { Tournament } from '@/app/lib/data/matches'
import type { ScoutingReport } from '@/app/lib/orchestration/types'

const TAB_VALUES = ['overview', 'strategies', 'players', 'compositions', 'maps', 'counters'] as const
type TabValue = typeof TAB_VALUES[number]

interface FilterBarProps {
  teams: Team[]
  tournaments: Tournament[]
  maps: string[]
}

export function FilterBar({ teams, tournaments, maps }: FilterBarProps) {
  const [teamId] = useQueryState('team', parseAsString)
  const [matchCount] = useQueryState('matchCount', parseAsInteger.withDefault(10))
  const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(TAB_VALUES).withDefault('overview'))
  const [report, setReport] = useState<ScoutingReport | null>(null)

  const selectedTeam = teamId ? teams.find(t => t.id === teamId) : null

  // Snapshot loading
  const searchParams = useSearchParams()
  const snapshotId = searchParams.get('snapshot')
  const [snapshotData, setSnapshotData] = useState<ScoutingReport | null>(null)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false)
  const [snapshotMeta, setSnapshotMeta] = useState<{ createdAt: string } | null>(null)

  // Load snapshot if param exists
  useEffect(() => {
    if (snapshotId) {
      setIsLoadingSnapshot(true)
      setSnapshotError(null)
      loadSnapshot(snapshotId).then((result) => {
        setIsLoadingSnapshot(false)
        if (result.success && result.snapshot) {
          setSnapshotData(result.snapshot.report_data as ScoutingReport)
          setSnapshotMeta({ createdAt: result.snapshot.created_at })
        } else {
          setSnapshotError(result.error || 'Failed to load shared report')
        }
      })
    }
  }, [snapshotId])

  // Clear report when team changes
  useEffect(() => {
    setReport(null)
  }, [teamId])

  const handleComplete = (generatedReport: ScoutingReport) => {
    setReport(generatedReport)
  }

  return (
    <>
      {/* Unified Filter Bar */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Filters */}
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

            {/* Right side - Generate Button */}
            {selectedTeam && !snapshotId && (
              <div className="flex-shrink-0">
                <ReportGenerator
                  teamId={selectedTeam.id}
                  teamName={selectedTeam.name}
                  matchCount={matchCount === 0 ? undefined : matchCount}
                  onComplete={handleComplete}
                  hasReport={!!report}
                />
              </div>
            )}
          </div>

          {/* Active Filters */}
          <ActiveFilters teams={teams} tournaments={tournaments} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {/* Snapshot View */}
        {snapshotId && (
          <>
            {isLoadingSnapshot && (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading shared report...</div>
              </div>
            )}
            {snapshotError && (
              <Alert variant="destructive">
                <AlertDescription>{snapshotError}</AlertDescription>
              </Alert>
            )}
            {snapshotData && (
              <div className="space-y-6">
                <Alert>
                  <Share2 className="h-4 w-4" />
                  <AlertDescription>
                    Viewing shared report snapshot
                    {snapshotMeta?.createdAt && ` (created ${new Date(snapshotMeta.createdAt).toLocaleDateString()})`}
                  </AlertDescription>
                </Alert>
                <ReportTabs report={snapshotData} loading={false} tab={tab} onTabChange={(v) => setTab(v as TabValue)} />
                <ReportDisplay report={snapshotData} isSnapshot={true} tab={tab} />
              </div>
            )}
          </>
        )}

        {/* No Team Selected */}
        {!snapshotId && !selectedTeam && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center max-w-md space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <FileSearch className="h-20 w-20 text-muted-foreground/40" />
                  <ArrowUp className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-bounce" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Ready to Generate Reports</h3>
                <p className="text-muted-foreground">
                  Select a team from the filter bar above to generate a comprehensive scouting report with analytics, insights, and strategic recommendations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report Content */}
        {!snapshotId && selectedTeam && report && (
          <div className="space-y-4">
            <ReportTabs report={report} loading={false} tab={tab} onTabChange={(v) => setTab(v as TabValue)} />
            <ReportDisplay report={report} isSnapshot={false} seriesIds={report.seriesIds ?? []} tab={tab} />
          </div>
        )}

        {/* Team selected but no report yet */}
        {!snapshotId && selectedTeam && !report && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{selectedTeam.name}</h3>
                <p className="text-muted-foreground">
                  Click the Generate Report button to create a scouting report for this team.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { parseAsString, parseAsInteger, parseAsStringLiteral, useQueryState } from 'nuqs'
import { useSearchParams } from 'next/navigation'
import { FileSearch, Share2, Sparkles, Loader2 } from 'lucide-react'
import { loadSnapshot } from '@/app/actions/snapshots'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamSelector } from './team-selector'
import { MatchCountSelector } from './match-count-selector'
import { FilterTournament } from './filter-tournament'
import { FilterMap } from './filter-map'
import { ReportTabs } from './report-tabs'
import { ReportDisplay } from './report-display'
import type { Team } from '@/app/lib/data/teams'
import type { Tournament } from '@/app/lib/data/matches'
import type { ScoutingReport, ProgressStage } from '@/app/lib/orchestration/types'

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
  const [mapFilter] = useQueryState('map', parseAsString)
  const [tournamentFilter] = useQueryState('tournament', parseAsString)
  const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(TAB_VALUES).withDefault('overview'))
  const [report, setReport] = useState<ScoutingReport | null>(null)

  // Report generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMessage, setGenerationMessage] = useState('')

  const selectedTeam = teamId ? teams.find(t => t.id === teamId) : null
  const selectedTournament = tournamentFilter ? tournaments.find(t => t.id === tournamentFilter) : null

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

  const handleGenerateReport = async () => {
    if (!selectedTeam) return

    setIsGenerating(true)
    setGenerationMessage('Starting report generation...')

    try {
      const response = await fetch('/api/reports/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          teamName: selectedTeam.name,
          matchCount: matchCount === 0 ? undefined : matchCount,
        }),
      })

      if (!response.ok) throw new Error('Failed to generate report')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            if (data.stage === 'complete' && data.report) {
              setReport(data.report)
            } else if (data.message) {
              setGenerationMessage(data.message)
            }
          }
        }
      }
    } catch (error) {
      console.error('Report generation error:', error)
      setGenerationMessage('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-white">
        <div className="sticky top-[73px] p-4 space-y-6">
          {/* Team Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Team
            </label>
            <TeamSelector teams={teams} />
          </div>

          {/* Match Count */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Matches
            </label>
            <MatchCountSelector />
          </div>

          {/* Tournament Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tournament
            </label>
            <FilterTournament tournaments={tournaments} />
          </div>

          {/* Map Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Map
            </label>
            <FilterMap maps={maps} />
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            {/* Generate Button - Always visible */}
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedTeam || isGenerating}
              size="lg"
              className={`w-full gap-2 font-semibold transition-all duration-300
                ${selectedTeam && !isGenerating && !report
                  ? 'animate-pulse bg-primary hover:bg-primary/90'
                  : ''
                }
                ${!selectedTeam ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : report ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>

            {/* Generation status */}
            {isGenerating && (
              <p className="text-xs text-muted-foreground mt-2 text-center animate-pulse">
                {generationMessage}
              </p>
            )}

            {!selectedTeam && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Select a team to generate report
              </p>
            )}
          </div>

          {/* Active Filters Summary */}
          {(selectedTeam || mapFilter || tournamentFilter) && (
            <Card className="bg-muted/30">
              <CardHeader className="py-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                  Active Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="py-0 pb-3 px-3 space-y-1 text-sm">
                {selectedTeam && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Team</span>
                    <span className="font-medium truncate max-w-[120px]">{selectedTeam.name}</span>
                  </div>
                )}
                {matchCount !== 10 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matches</span>
                    <span className="font-medium">{matchCount === 0 ? 'All' : matchCount}</span>
                  </div>
                )}
                {selectedTournament && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tournament</span>
                    <span className="font-medium truncate max-w-[120px]">{selectedTournament.name}</span>
                  </div>
                )}
                {mapFilter && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Map</span>
                    <span className="font-medium capitalize">{mapFilter}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50/50">
        <div className="p-6">
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
                  <FileSearch className="h-16 w-16 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Select a Team</h3>
                  <p className="text-muted-foreground">
                    Choose a team from the sidebar to generate a comprehensive scouting report.
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
          {!snapshotId && selectedTeam && !report && !isGenerating && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md space-y-4">
                <div className="flex justify-center">
                  <Sparkles className="h-16 w-16 text-primary/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{selectedTeam.name}</h3>
                  <p className="text-muted-foreground">
                    Click Generate Report in the sidebar to create a scouting report for this team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generating state */}
          {!snapshotId && selectedTeam && !report && isGenerating && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Generating Report</h3>
                  <p className="text-muted-foreground animate-pulse">
                    {generationMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

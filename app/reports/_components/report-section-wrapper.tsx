'use client'

import { parseAsString, useQueryState } from 'nuqs'
import { ReportSection } from './report-section'
import { FileSearch, ArrowUp } from 'lucide-react'
import type { Team } from '@/app/lib/data/teams'

interface ReportSectionWrapperProps {
  teams: Team[]
}

export function ReportSectionWrapper({ teams }: ReportSectionWrapperProps) {
  const [teamId] = useQueryState('team', parseAsString)

  const selectedTeam = teamId ? teams.find(t => t.id === teamId) : null

  if (!selectedTeam) {
    return (
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
    )
  }

  return (
    <ReportSection
      teamId={selectedTeam.id}
      teamName={selectedTeam.name}
    />
  )
}

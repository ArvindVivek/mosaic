'use client'

import { parseAsString, parseAsInteger, parseAsIsoDate, useQueryStates } from 'nuqs'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Team } from '@/app/lib/data/teams'
import type { Tournament } from '@/app/lib/data/matches'

interface ActiveFiltersProps {
  teams: Team[]
  tournaments: Tournament[]
}

export function ActiveFilters({ teams, tournaments }: ActiveFiltersProps) {
  const [filters, setFilters] = useQueryStates({
    team: parseAsString,
    matchCount: parseAsInteger.withDefault(10),
    tournament: parseAsString,
    map: parseAsString,
    from: parseAsIsoDate,
    to: parseAsIsoDate,
  })

  const hasActiveFilters = () => {
    return (
      filters.team ||
      filters.tournament ||
      filters.map ||
      filters.from ||
      filters.to ||
      (filters.matchCount !== 10 && filters.matchCount !== null)
    )
  }

  if (!hasActiveFilters()) {
    return null
  }

  const selectedTeam = teams.find((t) => t.id === filters.team)
  const selectedTournament = tournaments.find((t) => t.id === filters.tournament)

  const clearAll = () => {
    setFilters({
      team: null,
      matchCount: 10,
      tournament: null,
      map: null,
      from: null,
      to: null,
    })
  }

  const activeFilterCount = [
    filters.team,
    filters.tournament,
    filters.map,
    filters.from,
    filters.to,
    filters.matchCount !== 10 ? filters.matchCount : null,
  ].filter(Boolean).length

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-dashed">

      {filters.team && selectedTeam && (
        <Badge variant="secondary" className="gap-1">
          Team: {selectedTeam.name}
          <button
            onClick={() => setFilters({ team: null })}
            className="ml-1 hover:bg-gray-300 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.tournament && selectedTournament && (
        <Badge variant="secondary" className="gap-1">
          Tournament: {selectedTournament.name}
          <button
            onClick={() => setFilters({ tournament: null })}
            className="ml-1 hover:bg-gray-300 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.map && (
        <Badge variant="secondary" className="gap-1">
          Map: {filters.map}
          <button
            onClick={() => setFilters({ map: null })}
            className="ml-1 hover:bg-gray-300 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.from && (
        <Badge variant="secondary" className="gap-1">
          From: {format(filters.from, 'MMM dd, yyyy')}
          <button
            onClick={() => setFilters({ from: null })}
            className="ml-1 hover:bg-gray-300 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.to && (
        <Badge variant="secondary" className="gap-1">
          To: {format(filters.to, 'MMM dd, yyyy')}
          <button
            onClick={() => setFilters({ to: null })}
            className="ml-1 hover:bg-gray-300 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.matchCount !== 10 && filters.matchCount !== null && (
        <Badge variant="secondary" className="gap-1">
          Matches: {filters.matchCount === 0 ? 'All' : filters.matchCount}
          <button
            onClick={() => setFilters({ matchCount: 10 })}
            className="ml-1 hover:bg-gray-300 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFilterCount > 1 && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear all
        </Button>
      )}
    </div>
  )
}

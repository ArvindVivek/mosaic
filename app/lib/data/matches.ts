// Data fetching functions for matches with 24-hour caching
// Supports filtering by team, tournament, map, and date range

import { unstable_cache as cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { Match } from '@/lib/grid/types'

const CACHE_TTL = 86400 // 24 hours in seconds

export interface MatchFilters {
  teamId?: string
  tournamentId?: string
  mapName?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

/**
 * Get matches with optional filters
 * Cached based on filter parameters
 */
export async function getMatches(filters: MatchFilters = {}): Promise<{
  matches: Match[]
  total: number
}> {
  // Generate cache key from filters
  const cacheKey = generateMatchesCacheKey(filters)

  return getCachedMatches(cacheKey, filters)
}

const getCachedMatches = cache(
  async (cacheKey: string, filters: MatchFilters): Promise<{ matches: Match[]; total: number }> => {
    const supabase = await createServerClient()

    let query = supabase
      .from('matches')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.teamId) {
      query = query.or(`team_home_id.eq.${filters.teamId},team_away_id.eq.${filters.teamId}`)
    }

    if (filters.tournamentId) {
      query = query.eq('tournament_id', filters.tournamentId)
    }

    if (filters.mapName) {
      query = query.eq('map_name', filters.mapName)
    }

    if (filters.dateFrom) {
      query = query.gte('match_date', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('match_date', filters.dateTo)
    }

    // Ordering and pagination
    query = query
      .order('match_date', { ascending: false })
      .limit(filters.limit ?? 20)

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      throw new Error(`Failed to fetch matches: ${error.message}`)
    }

    return {
      matches: data?.map(transformMatchFromDb) ?? [],
      total: count ?? 0,
    }
  },
  ['matches-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['matches'],
  }
)

/**
 * Get single match by ID with full event data
 */
export const getMatchById = cache(
  async (matchId: string): Promise<Match | null> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (error || !data) {
      console.error('Error fetching match:', error)
      return null
    }

    return transformMatchFromDb(data)
  },
  ['match-by-id'],
  {
    revalidate: CACHE_TTL,
    tags: ['matches'],
  }
)

/**
 * Get matches for a specific team
 * Commonly used for scouting reports
 */
export const getMatchesForTeam = cache(
  async (teamId: string, limit: number = 20): Promise<Match[]> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`team_home_id.eq.${teamId},team_away_id.eq.${teamId}`)
      .order('match_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching team matches:', error)
      return []
    }

    return data?.map(transformMatchFromDb) ?? []
  },
  ['matches-for-team'],
  {
    revalidate: CACHE_TTL,
    tags: ['matches'],
  }
)

/**
 * Get distinct tournaments from matches
 * Used for filter dropdowns
 */
export const getTournaments = cache(
  async (): Promise<Array<{ id: string; name: string }>> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('matches')
      .select('tournament_id, tournament_name')
      .not('tournament_name', 'is', null)

    if (error) {
      console.error('Error fetching tournaments:', error)
      return []
    }

    // Deduplicate
    const tournamentsMap = new Map<string, string>()
    data?.forEach((row) => {
      if (row.tournament_id && row.tournament_name) {
        tournamentsMap.set(row.tournament_id, row.tournament_name)
      }
    })

    return Array.from(tournamentsMap.entries()).map(([id, name]) => ({ id, name }))
  },
  ['tournaments-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['matches'],
  }
)

/**
 * Get distinct maps from matches
 * Used for filter dropdowns
 */
export const getMaps = cache(
  async (): Promise<string[]> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('matches')
      .select('map_name')
      .not('map_name', 'is', null)

    if (error) {
      console.error('Error fetching maps:', error)
      return []
    }

    // Deduplicate
    const maps = new Set<string>()
    data?.forEach((row) => {
      if (row.map_name) {
        maps.add(row.map_name)
      }
    })

    return Array.from(maps).sort()
  },
  ['maps-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['matches'],
  }
)

// Helper to generate cache key from filters
function generateMatchesCacheKey(filters: MatchFilters): string {
  return JSON.stringify(filters)
}

// Database row to TypeScript type transformer
function transformMatchFromDb(row: any): Match {
  return {
    id: row.id,
    gridMatchId: row.grid_match_id,
    gridSeriesId: row.grid_series_id,
    tournamentId: row.tournament_id,
    tournamentName: row.tournament_name,
    teamHomeId: row.team_home_id,
    teamAwayId: row.team_away_id,
    teamHomeScore: row.team_home_score,
    teamAwayScore: row.team_away_score,
    mapName: row.map_name,
    matchDate: row.match_date,
    eventData: row.event_data,
    fetchedAt: row.fetched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

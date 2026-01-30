// Data fetching functions for matches/series
// Uses shared VALORANT data from lumina ETL (public schema)
// Lumina schema: series -> games -> rounds

import { unstable_cache as cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

const CACHE_TTL = 86400 // 24 hours in seconds

// Series = a match (can be bo1, bo3, bo5)
export interface Series {
  id: string
  tournamentId: string | null
  startTime: string | null
  format: string | null
  teamAId: string | null
  teamBId: string | null
  winnerId: string | null
  processed: boolean
  createdAt: string
}

// Game = individual map within a series
export interface Game {
  id: string
  seriesId: string | null
  sequenceNumber: number | null
  mapName: string | null
  teamAScore: number | null
  teamBScore: number | null
  winnerId: string | null
  durationMs: number | null
  createdAt: string
}

// Tournament info
export interface Tournament {
  id: string
  name: string | null
  startDate: string | null
  endDate: string | null
  parentId: string | null
  createdAt: string
}

export interface SeriesFilters {
  teamId?: string
  tournamentId?: string
  limit?: number
  offset?: number
}

export interface GameFilters {
  seriesId?: string
  mapName?: string
  limit?: number
}

/**
 * Get series (matches) with optional filters
 */
export const getSeries = cache(
  async (filters: SeriesFilters = {}): Promise<{ series: Series[]; total: number }> => {
    const supabase = createServiceClient()

    let query = supabase
      .from('series')
      .select('*', { count: 'exact' })

    // Filter by team (either side)
    if (filters.teamId) {
      query = query.or(`team_a_id.eq.${filters.teamId},team_b_id.eq.${filters.teamId}`)
    }

    if (filters.tournamentId) {
      query = query.eq('tournament_id', filters.tournamentId)
    }

    // Order by start time descending
    query = query
      .order('start_time', { ascending: false, nullsFirst: false })
      .limit(filters.limit ?? 20)

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching series:', error)
      throw new Error(`Failed to fetch series: ${error.message}`)
    }

    return {
      series: data?.map(transformSeriesFromDb) ?? [],
      total: count ?? 0,
    }
  },
  ['series-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['series'],
  }
)

/**
 * Get series for a specific team
 * Used for scouting reports
 */
export const getSeriesForTeam = cache(
  async (teamId: string, limit: number = 20): Promise<Series[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('series')
      .select('*')
      .or(`team_a_id.eq.${teamId},team_b_id.eq.${teamId}`)
      .order('start_time', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching team series:', error)
      return []
    }

    return data?.map(transformSeriesFromDb) ?? []
  },
  ['series-for-team'],
  {
    revalidate: CACHE_TTL,
    tags: ['series'],
  }
)

/**
 * Get single series by ID
 */
export const getSeriesById = cache(
  async (seriesId: string): Promise<Series | null> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('id', seriesId)
      .single()

    if (error || !data) {
      console.error('Error fetching series:', error)
      return null
    }

    return transformSeriesFromDb(data)
  },
  ['series-by-id'],
  {
    revalidate: CACHE_TTL,
    tags: ['series'],
  }
)

/**
 * Get games (maps) for a series
 */
export const getGamesForSeries = cache(
  async (seriesId: string): Promise<Game[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('series_id', seriesId)
      .order('sequence_number', { ascending: true })

    if (error) {
      console.error('Error fetching games:', error)
      return []
    }

    return data?.map(transformGameFromDb) ?? []
  },
  ['games-for-series'],
  {
    revalidate: CACHE_TTL,
    tags: ['games'],
  }
)

/**
 * Get all games with optional filters
 */
export const getGames = cache(
  async (filters: GameFilters = {}): Promise<Game[]> => {
    const supabase = createServiceClient()

    let query = supabase
      .from('games')
      .select('*')

    if (filters.seriesId) {
      query = query.eq('series_id', filters.seriesId)
    }

    if (filters.mapName) {
      query = query.eq('map_name', filters.mapName)
    }

    query = query
      .order('created_at', { ascending: false })
      .limit(filters.limit ?? 50)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching games:', error)
      return []
    }

    return data?.map(transformGameFromDb) ?? []
  },
  ['games-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['games'],
  }
)

/**
 * Get all tournaments
 */
export const getTournaments = cache(
  async (): Promise<Tournament[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching tournaments:', error)
      return []
    }

    return data?.map(transformTournamentFromDb) ?? []
  },
  ['tournaments-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['tournaments'],
  }
)

/**
 * Get distinct maps from games
 */
export const getMaps = cache(
  async (): Promise<string[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('games')
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
    tags: ['games'],
  }
)

// Database row transformers
function transformSeriesFromDb(row: Record<string, unknown>): Series {
  return {
    id: row.id as string,
    tournamentId: row.tournament_id as string | null,
    startTime: row.start_time as string | null,
    format: row.format as string | null,
    teamAId: row.team_a_id as string | null,
    teamBId: row.team_b_id as string | null,
    winnerId: row.winner_id as string | null,
    processed: row.processed as boolean,
    createdAt: row.created_at as string,
  }
}

function transformGameFromDb(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    seriesId: row.series_id as string | null,
    sequenceNumber: row.sequence_number as number | null,
    mapName: row.map_name as string | null,
    teamAScore: row.team_a_score as number | null,
    teamBScore: row.team_b_score as number | null,
    winnerId: row.winner_id as string | null,
    durationMs: row.duration_ms as number | null,
    createdAt: row.created_at as string,
  }
}

function transformTournamentFromDb(row: Record<string, unknown>): Tournament {
  return {
    id: row.id as string,
    name: row.name as string | null,
    startDate: row.start_date as string | null,
    endDate: row.end_date as string | null,
    parentId: row.parent_id as string | null,
    createdAt: row.created_at as string,
  }
}

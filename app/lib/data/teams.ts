// Data fetching functions for teams
// Uses shared VALORANT data from lumina ETL (public schema)

import { unstable_cache as cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

const CACHE_TTL = 86400 // 24 hours in seconds

export interface Team {
  id: string
  name: string
  createdAt: string
}

export interface Player {
  id: string
  name: string
  teamId: string | null
  createdAt: string
}

/**
 * Get all teams from shared VALORANT data
 */
export const getTeams = cache(
  async (): Promise<Team[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching teams:', error)
      throw new Error(`Failed to fetch teams: ${error.message}`)
    }

    return data?.map(transformTeamFromDb) ?? []
  },
  ['teams-list'],
  {
    revalidate: CACHE_TTL,
    tags: ['teams'],
  }
)

/**
 * Get single team by ID with roster
 */
export const getTeamById = cache(
  async (teamId: string): Promise<{ team: Team; players: Player[] } | null> => {
    const supabase = createServiceClient()

    // Fetch team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (teamError || !team) {
      console.error('Error fetching team:', teamError)
      return null
    }

    // Fetch players for team
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('name')

    if (playersError) {
      console.error('Error fetching players:', playersError)
    }

    return {
      team: transformTeamFromDb(team),
      players: players?.map(transformPlayerFromDb) ?? [],
    }
  },
  ['team-by-id'],
  {
    revalidate: CACHE_TTL,
    tags: ['teams'],
  }
)

/**
 * Search teams by name
 */
export const searchTeams = cache(
  async (query: string): Promise<Team[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10)

    if (error) {
      console.error('Error searching teams:', error)
      return []
    }

    return data?.map(transformTeamFromDb) ?? []
  },
  ['team-search'],
  {
    revalidate: CACHE_TTL,
    tags: ['teams'],
  }
)

/**
 * Get players for a team
 */
export const getPlayersByTeam = cache(
  async (teamId: string): Promise<Player[]> => {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('name')

    if (error) {
      console.error('Error fetching players:', error)
      return []
    }

    return data?.map(transformPlayerFromDb) ?? []
  },
  ['players-by-team'],
  {
    revalidate: CACHE_TTL,
    tags: ['teams'],
  }
)

// Database row to TypeScript type transformers
function transformTeamFromDb(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
  }
}

function transformPlayerFromDb(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    teamId: row.team_id as string | null,
    createdAt: row.created_at as string,
  }
}

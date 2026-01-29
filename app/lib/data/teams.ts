// Data fetching functions for teams with 24-hour caching
// Uses Next.js cache with tag-based invalidation

import { unstable_cache as cache } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import type { Team, Player } from '@/lib/grid/types'

const CACHE_TTL = 86400 // 24 hours in seconds

/**
 * Get all VCT Americas teams
 * Cached for 24 hours with 'teams' tag for invalidation
 */
export const getTeams = cache(
  async (): Promise<Team[]> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('region', 'Americas')
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
 * Cached per team ID
 */
export const getTeamById = cache(
  async (teamId: string): Promise<{ team: Team; players: Player[] } | null> => {
    const supabase = await createServerClient()

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
 * Get team by GRID ID (for linking)
 */
export const getTeamByGridId = cache(
  async (gridTeamId: string): Promise<Team | null> => {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('grid_team_id', gridTeamId)
      .single()

    if (error || !data) {
      return null
    }

    return transformTeamFromDb(data)
  },
  ['team-by-grid-id'],
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
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('region', 'Americas')
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

// Database row to TypeScript type transformers
function transformTeamFromDb(row: any): Team {
  return {
    id: row.id,
    gridTeamId: row.grid_team_id,
    name: row.name,
    shortName: row.short_name,
    logoUrl: row.logo_url,
    region: row.region,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function transformPlayerFromDb(row: any): Player {
  return {
    id: row.id,
    gridPlayerId: row.grid_player_id,
    name: row.name,
    realName: row.real_name,
    teamId: row.team_id,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

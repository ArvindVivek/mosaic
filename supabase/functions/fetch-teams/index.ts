// Edge Function: Fetch VCT Americas teams and rosters from GRID Central Data API
// Covers DATA-02: System fetches VCT Americas team roster and metadata

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createGridClient, queryWithRetry, extractErrorInfo } from '../_shared/grid-client.ts'
import { getSupabaseClient, getEnvVars, jsonResponse, errorResponse } from '../_shared/supabase.ts'
import { GET_TEAMS_QUERY, GET_TEAM_DETAILS_QUERY } from '../_shared/queries.ts'
import { normalizeTeam, normalizePlayersFromTeam } from '../_shared/normalizers.ts'
import type { GridTeam } from '../_shared/types.ts'

interface FetchTeamsRequest {
  region?: string
  tournamentId?: string
  teamId?: string // For single team fetch
}

interface TeamsResponse {
  teams?: {
    edges?: Array<{ node: GridTeam }>
  }
}

interface TeamResponse {
  team?: GridTeam
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Parse request body
    const body: FetchTeamsRequest = req.method === 'POST'
      ? await req.json()
      : {}

    const { region = 'Americas', tournamentId, teamId } = body

    // Initialize clients
    const { supabaseUrl, serviceRoleKey, gridApiKey } = getEnvVars()
    const gridClient = createGridClient(gridApiKey)
    const supabase = getSupabaseClient(supabaseUrl, serviceRoleKey)

    let teamsToProcess: GridTeam[] = []

    if (teamId) {
      // Fetch single team
      console.log(`Fetching team details for: ${teamId}`)
      const response = await queryWithRetry<TeamResponse>(
        gridClient,
        GET_TEAM_DETAILS_QUERY,
        { teamId }
      )

      if (response.team) {
        teamsToProcess = [response.team]
      }
    } else {
      // Fetch all teams for region
      console.log(`Fetching teams for region: ${region}`)
      const response = await queryWithRetry<TeamsResponse>(
        gridClient,
        GET_TEAMS_QUERY,
        { region, tournamentId }
      )

      teamsToProcess = response.teams?.edges?.map((e) => e.node) ?? []
    }

    if (teamsToProcess.length === 0) {
      return jsonResponse({
        success: true,
        message: 'No teams found',
        teamsCount: 0,
        playersCount: 0
      })
    }

    console.log(`Processing ${teamsToProcess.length} teams`)

    // Normalize and upsert teams
    const normalizedTeams = teamsToProcess.map(normalizeTeam)

    const { data: insertedTeams, error: teamsError } = await supabase
      .from('teams')
      .upsert(
        normalizedTeams.map((t) => ({
          grid_team_id: t.gridTeamId,
          name: t.name,
          short_name: t.shortName,
          logo_url: t.logoUrl,
          region: t.region,
        })),
        { onConflict: 'grid_team_id' }
      )
      .select('id, grid_team_id')

    if (teamsError) {
      console.error('Error upserting teams:', teamsError)
      throw new Error(`Database error: ${teamsError.message}`)
    }

    // Build team ID lookup map (grid_team_id -> internal id)
    const teamIdMap = new Map<string, string>()
    insertedTeams?.forEach((t) => {
      teamIdMap.set(t.grid_team_id, t.id)
    })

    // Process players for each team
    let totalPlayersProcessed = 0

    for (const gridTeam of teamsToProcess) {
      const normalizedPlayers = normalizePlayersFromTeam(gridTeam)

      if (normalizedPlayers.length === 0) continue

      const teamInternalId = teamIdMap.get(gridTeam.id)

      const { error: playersError } = await supabase
        .from('players')
        .upsert(
          normalizedPlayers.map((p) => ({
            grid_player_id: p.gridPlayerId,
            name: p.name,
            real_name: p.realName,
            team_id: teamInternalId,
            role: p.role,
          })),
          { onConflict: 'grid_player_id' }
        )

      if (playersError) {
        console.error(`Error upserting players for team ${gridTeam.name}:`, playersError)
        // Continue processing other teams
      } else {
        totalPlayersProcessed += normalizedPlayers.length
      }
    }

    console.log(`Successfully processed ${teamsToProcess.length} teams, ${totalPlayersProcessed} players`)

    return jsonResponse({
      success: true,
      teamsCount: teamsToProcess.length,
      playersCount: totalPlayersProcessed,
    })

  } catch (error) {
    console.error('Error in fetch-teams:', error)
    const errorInfo = extractErrorInfo(error)
    return errorResponse(errorInfo.message, 500)
  }
})

// Edge Function: Fetch match metadata from GRID Central Data API
// Covers DATA-03: System fetches historical match data with configurable filters

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createGridClient, queryWithRetry, extractErrorInfo } from '../_shared/grid-client.ts'
import { getSupabaseClient, getEnvVars, jsonResponse, errorResponse } from '../_shared/supabase.ts'
import { GET_MATCHES_QUERY } from '../_shared/queries.ts'
import { normalizeMatchesResponse } from '../_shared/normalizers.ts'
import type { GridMatch } from '../_shared/types.ts'

interface FetchMatchesRequest {
  teamId?: string
  tournamentId?: string
  mapName?: string
  dateFrom?: string // ISO date string
  dateTo?: string   // ISO date string
  limit?: number    // Max matches per request (default: 20)
  fetchAll?: boolean // Paginate through all results
}

interface MatchesResponse {
  matches?: {
    edges?: Array<{ node: GridMatch }>
    pageInfo?: {
      hasNextPage: boolean
      endCursor: string
    }
  }
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

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
    const body: FetchMatchesRequest = req.method === 'POST'
      ? await req.json()
      : {}

    const {
      teamId,
      tournamentId,
      mapName,
      dateFrom,
      dateTo,
      limit = DEFAULT_LIMIT,
      fetchAll = false,
    } = body

    // Validate at least one filter is provided
    if (!teamId && !tournamentId) {
      return errorResponse('At least teamId or tournamentId must be provided', 400)
    }

    // Initialize clients
    const { supabaseUrl, serviceRoleKey, gridApiKey } = getEnvVars()
    const gridClient = createGridClient(gridApiKey)
    const supabase = getSupabaseClient(supabaseUrl, serviceRoleKey)

    // Fetch team ID mappings for linking
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('id, grid_team_id')

    const teamIdMap = new Map<string, string>()
    existingTeams?.forEach((t) => {
      teamIdMap.set(t.grid_team_id, t.id)
    })

    // Build query variables
    const queryVars = {
      teamId,
      tournamentId,
      mapName,
      dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
      limit: Math.min(limit, MAX_LIMIT),
      after: undefined as string | undefined,
    }

    let allMatches: ReturnType<typeof normalizeMatchesResponse>['matches'] = []
    let hasMore = true

    console.log(`Fetching matches with filters:`, { teamId, tournamentId, mapName, dateFrom, dateTo })

    // Paginate through results if fetchAll is true
    while (hasMore) {
      const response = await queryWithRetry<MatchesResponse>(
        gridClient,
        GET_MATCHES_QUERY,
        queryVars
      )

      const { matches, hasNextPage, endCursor } = normalizeMatchesResponse(response)
      allMatches = allMatches.concat(matches)

      if (!fetchAll || !hasNextPage || !endCursor) {
        hasMore = false
      } else {
        queryVars.after = endCursor
        console.log(`Fetching next page, cursor: ${endCursor}`)
      }

      // Safety limit to prevent infinite loops
      if (allMatches.length >= 500) {
        console.warn('Reached safety limit of 500 matches')
        hasMore = false
      }
    }

    if (allMatches.length === 0) {
      return jsonResponse({
        success: true,
        message: 'No matches found matching filters',
        matchesCount: 0,
      })
    }

    console.log(`Processing ${allMatches.length} matches`)

    // Prepare matches for database upsert
    const matchesForDb = allMatches.map((m) => ({
      grid_match_id: m.gridMatchId,
      grid_series_id: m.gridSeriesId,
      tournament_id: m.tournamentId,
      tournament_name: m.tournamentName,
      team_home_id: m.teamHomeGridId ? teamIdMap.get(m.teamHomeGridId) : null,
      team_away_id: m.teamAwayGridId ? teamIdMap.get(m.teamAwayGridId) : null,
      team_home_score: m.teamHomeScore,
      team_away_score: m.teamAwayScore,
      map_name: m.mapName,
      match_date: m.matchDate,
      fetched_at: m.fetchedAt,
      // Note: event_data is not populated here - that's handled by fetch-round-events
    }))

    // Upsert matches to database
    const { error: matchesError, count } = await supabase
      .from('matches')
      .upsert(matchesForDb, {
        onConflict: 'grid_match_id',
        count: 'exact'
      })

    if (matchesError) {
      console.error('Error upserting matches:', matchesError)
      throw new Error(`Database error: ${matchesError.message}`)
    }

    // Track which teams need to be fetched (referenced but not in DB)
    const missingTeamIds = new Set<string>()
    allMatches.forEach((m) => {
      if (m.teamHomeGridId && !teamIdMap.has(m.teamHomeGridId)) {
        missingTeamIds.add(m.teamHomeGridId)
      }
      if (m.teamAwayGridId && !teamIdMap.has(m.teamAwayGridId)) {
        missingTeamIds.add(m.teamAwayGridId)
      }
    })

    console.log(`Successfully processed ${allMatches.length} matches`)
    if (missingTeamIds.size > 0) {
      console.log(`Note: ${missingTeamIds.size} teams referenced but not in database`)
    }

    return jsonResponse({
      success: true,
      matchesCount: allMatches.length,
      upsertedCount: count,
      missingTeamIds: missingTeamIds.size > 0 ? Array.from(missingTeamIds) : undefined,
      filters: {
        teamId,
        tournamentId,
        mapName,
        dateFrom,
        dateTo,
      },
    })

  } catch (error) {
    console.error('Error in fetch-matches:', error)
    const errorInfo = extractErrorInfo(error)
    return errorResponse(errorInfo.message, 500)
  }
})

// Edge Function: Fetch round-by-round event data from GRID Series State API
// Covers DATA-04: System parses round-by-round event data (kills, economy, spike events)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createGridClient, queryWithRetry, extractErrorInfo } from '../_shared/grid-client.ts'
import { getSupabaseClient, getEnvVars } from '../_shared/supabase.ts'
import { GET_SERIES_STATE_QUERY, GET_SERIES_STATUS_QUERY } from '../_shared/series-queries.ts'
import { normalizeSeriesState, extractKeyStats } from '../_shared/event-normalizers.ts'

interface FetchRoundEventsRequest {
  seriesId?: string       // Fetch specific series
  matchId?: string        // Fetch by internal match ID (looks up series_id)
  matchIds?: string[]     // Batch fetch multiple matches
  forceRefresh?: boolean  // Re-fetch even if event_data exists
}

interface SeriesStateResponse {
  seriesState?: {
    id: string
    finished: boolean
    teams: unknown[]
    games: unknown[]
  }
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

/**
 * Create error response
 */
function errorResponse(message: string, status = 500) {
  return jsonResponse({ error: message }, status)
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
    const body: FetchRoundEventsRequest = req.method === 'POST'
      ? await req.json()
      : {}

    const { seriesId, matchId, matchIds, forceRefresh = false } = body

    // Get environment variables
    const env = getEnvVars()

    // Initialize clients
    const gridClient = createGridClient(env.gridApiKey)
    const supabase = getSupabaseClient(env.supabaseUrl, env.serviceRoleKey)

    // Determine which matches to process
    let matchesToProcess: Array<{ id: string; gridSeriesId: string }> = []

    if (seriesId) {
      // Direct series ID provided - find matching match
      const { data: matches } = await supabase
        .from('matches')
        .select('id, grid_series_id')
        .eq('grid_series_id', seriesId)

      matchesToProcess = matches ?? []
    } else if (matchId) {
      // Single match ID
      const { data: match } = await supabase
        .from('matches')
        .select('id, grid_series_id')
        .eq('id', matchId)
        .single()

      if (match) {
        matchesToProcess = [match]
      }
    } else if (matchIds && matchIds.length > 0) {
      // Batch of match IDs
      const { data: matches } = await supabase
        .from('matches')
        .select('id, grid_series_id')
        .in('id', matchIds)

      matchesToProcess = matches ?? []
    } else {
      // No filter - get matches without event_data (up to 10)
      const { data: matches } = await supabase
        .from('matches')
        .select('id, grid_series_id')
        .is('event_data', null)
        .limit(10)

      matchesToProcess = matches ?? []
    }

    if (matchesToProcess.length === 0) {
      return jsonResponse({
        success: true,
        message: 'No matches to process',
        processedCount: 0,
      })
    }

    // Filter out matches that already have event_data (unless forceRefresh)
    if (!forceRefresh) {
      const { data: withEventData } = await supabase
        .from('matches')
        .select('id')
        .in('id', matchesToProcess.map((m) => m.id))
        .not('event_data', 'is', null)

      const idsWithData = new Set(withEventData?.map((m) => m.id) ?? [])
      matchesToProcess = matchesToProcess.filter((m) => !idsWithData.has(m.id))
    }

    if (matchesToProcess.length === 0) {
      return jsonResponse({
        success: true,
        message: 'All matches already have event data (use forceRefresh to update)',
        processedCount: 0,
      })
    }

    console.log(`Processing ${matchesToProcess.length} matches for round events`)

    let successCount = 0
    let errorCount = 0
    const errors: Array<{ matchId: string; error: string }> = []

    // Process each match
    for (const match of matchesToProcess) {
      try {
        // Check series status first (lighter query)
        const statusResponse = await queryWithRetry<SeriesStateResponse>(
          gridClient,
          GET_SERIES_STATUS_QUERY,
          { seriesId: match.gridSeriesId }
        )

        if (!statusResponse.seriesState) {
          console.log(`No series state found for series ${match.gridSeriesId}`)
          errors.push({ matchId: match.id, error: 'Series state not found' })
          errorCount++
          continue
        }

        // Only fetch full state for finished series
        if (!statusResponse.seriesState.finished) {
          console.log(`Series ${match.gridSeriesId} not finished, skipping`)
          errors.push({ matchId: match.id, error: 'Series not finished' })
          errorCount++
          continue
        }

        // Fetch complete series state
        console.log(`Fetching full series state for: ${match.gridSeriesId}`)
        const fullResponse = await queryWithRetry<SeriesStateResponse>(
          gridClient,
          GET_SERIES_STATE_QUERY,
          { seriesId: match.gridSeriesId }
        )

        if (!fullResponse.seriesState) {
          throw new Error('Failed to fetch series state')
        }

        // Normalize the event data
        const normalizedData = normalizeSeriesState(fullResponse.seriesState as any)
        const keyStats = extractKeyStats(normalizedData)

        console.log(`Normalized data for ${match.gridSeriesId}: ${keyStats.totalRounds} rounds, ${keyStats.totalKills} kills`)

        // Update match with event_data
        const { error: updateError } = await supabase
          .from('matches')
          .update({
            event_data: normalizedData,
            fetched_at: new Date().toISOString(),
          })
          .eq('id', match.id)

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`)
        }

        successCount++

      } catch (matchError) {
        console.error(`Error processing match ${match.id}:`, matchError)
        const errorInfo = extractErrorInfo(matchError)
        errors.push({ matchId: match.id, error: errorInfo.message })
        errorCount++
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`Completed: ${successCount} success, ${errorCount} errors`)

    return jsonResponse({
      success: true,
      processedCount: matchesToProcess.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    })

  } catch (error) {
    console.error('Error in fetch-round-events:', error)
    const errorInfo = extractErrorInfo(error)
    return errorResponse(errorInfo.message, 500)
  }
})

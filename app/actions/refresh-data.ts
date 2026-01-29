// Server Actions for data refresh and cache invalidation
// Triggers Edge Functions and invalidates Next.js cache tags

'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

const EDGE_FUNCTION_TIMEOUT = 30000 // 30 seconds

interface RefreshResult {
  success: boolean
  message: string
  count?: number
  error?: string
}

/**
 * Refresh team data from GRID API
 * Triggers fetch-teams Edge Function and invalidates teams cache
 */
export async function refreshTeamData(options?: {
  teamId?: string
  tournamentId?: string
}): Promise<RefreshResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Call Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/fetch-teams`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          region: 'Americas',
          teamId: options?.teamId,
          tournamentId: options?.tournamentId,
        }),
        signal: AbortSignal.timeout(EDGE_FUNCTION_TIMEOUT),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Edge function failed: ${response.status}`)
    }

    const result = await response.json()

    // Invalidate caches
    revalidateTag('teams')

    // Update cache metadata
    const supabase = createServiceClient()
    await supabase.rpc('update_cache_metadata', {
      p_cache_key: options?.teamId ? `team-${options.teamId}` : 'teams-all',
      p_cache_type: 'teams',
      p_entity_id: options?.teamId,
      p_record_count: result.teamsCount,
    })

    return {
      success: true,
      message: `Successfully refreshed ${result.teamsCount} teams, ${result.playersCount} players`,
      count: result.teamsCount,
    }

  } catch (error) {
    console.error('Error refreshing team data:', error)
    return {
      success: false,
      message: 'Failed to refresh team data',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Refresh match data from GRID API
 * Triggers fetch-matches Edge Function and invalidates matches cache
 */
export async function refreshMatchData(options: {
  teamId?: string
  tournamentId?: string
  mapName?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}): Promise<RefreshResult> {
  try {
    if (!options.teamId && !options.tournamentId) {
      return {
        success: false,
        message: 'At least teamId or tournamentId must be provided',
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Call Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/fetch-matches`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify(options),
        signal: AbortSignal.timeout(EDGE_FUNCTION_TIMEOUT),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Edge function failed: ${response.status}`)
    }

    const result = await response.json()

    // Invalidate caches
    revalidateTag('matches')
    if (options.teamId) {
      revalidatePath(`/teams/${options.teamId}`)
    }

    // Update cache metadata
    const supabase = createServiceClient()
    await supabase.rpc('update_cache_metadata', {
      p_cache_key: `matches-${options.teamId || options.tournamentId}`,
      p_cache_type: 'matches',
      p_entity_id: options.teamId || options.tournamentId,
      p_record_count: result.matchesCount,
      p_metadata: { filters: options },
    })

    return {
      success: true,
      message: `Successfully refreshed ${result.matchesCount} matches`,
      count: result.matchesCount,
    }

  } catch (error) {
    console.error('Error refreshing match data:', error)
    return {
      success: false,
      message: 'Failed to refresh match data',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Refresh round event data for matches
 * Triggers fetch-round-events Edge Function
 */
export async function refreshRoundEvents(options: {
  matchId?: string
  matchIds?: string[]
  forceRefresh?: boolean
}): Promise<RefreshResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration')
    }

    // Call Edge Function
    const response = await fetch(
      `${supabaseUrl}/functions/v1/fetch-round-events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify(options),
        signal: AbortSignal.timeout(EDGE_FUNCTION_TIMEOUT * 2), // Longer timeout for batch
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Edge function failed: ${response.status}`)
    }

    const result = await response.json()

    // Invalidate caches
    revalidateTag('matches')

    return {
      success: true,
      message: `Processed ${result.processedCount} matches (${result.successCount} success, ${result.errorCount} errors)`,
      count: result.successCount,
    }

  } catch (error) {
    console.error('Error refreshing round events:', error)
    return {
      success: false,
      message: 'Failed to refresh round events',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Full data refresh for a team (teams + matches + events)
 * Used when preparing a scouting report
 */
export async function fullTeamDataRefresh(teamId: string, options?: {
  matchLimit?: number
  dateFrom?: string
}): Promise<RefreshResult> {
  try {
    // Step 1: Refresh team data
    const teamResult = await refreshTeamData({ teamId })
    if (!teamResult.success) {
      return teamResult
    }

    // Step 2: Refresh match data
    const matchResult = await refreshMatchData({
      teamId,
      limit: options?.matchLimit ?? 20,
      dateFrom: options?.dateFrom,
    })
    if (!matchResult.success) {
      return {
        ...matchResult,
        message: `Team refreshed, but match refresh failed: ${matchResult.error}`,
      }
    }

    // Step 3: Refresh round events for matches without event data
    const eventResult = await refreshRoundEvents({})

    return {
      success: true,
      message: `Full refresh complete: ${teamResult.count} teams, ${matchResult.count} matches, ${eventResult.count ?? 0} events`,
      count: matchResult.count,
    }

  } catch (error) {
    console.error('Error in full team data refresh:', error)
    return {
      success: false,
      message: 'Full data refresh failed',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get cache status for monitoring
 */
export async function getCacheStatus(): Promise<{
  teams: { lastFetched?: string; isValid: boolean }
  matches: { lastFetched?: string; isValid: boolean }
}> {
  try {
    const supabase = createServiceClient()

    const { data: teamCache } = await supabase
      .rpc('get_cache_info', { p_cache_key: 'teams-all' })

    const { data: matchCache } = await supabase
      .rpc('get_cache_info', { p_cache_key: 'matches-all' })

    return {
      teams: {
        lastFetched: teamCache?.[0]?.last_fetched,
        isValid: teamCache?.[0]?.is_valid ?? false,
      },
      matches: {
        lastFetched: matchCache?.[0]?.last_fetched,
        isValid: matchCache?.[0]?.is_valid ?? false,
      },
    }

  } catch (error) {
    console.error('Error getting cache status:', error)
    return {
      teams: { isValid: false },
      matches: { isValid: false },
    }
  }
}

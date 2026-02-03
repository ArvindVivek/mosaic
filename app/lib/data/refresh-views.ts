'use server'

import { createServiceClient } from '@/app/lib/supabase/server'

/**
 * Refresh all materialized views
 * Call this after data imports or when stats seem stale
 */
export async function refreshMaterializedViews() {
  const supabase = createServiceClient()

  const views = [
    'mv_player_core_stats',
    'mv_player_agent_pool',
    'mv_team_map_stats',
    'mv_team_compositions'
  ]

  const results: Record<string, { success: boolean, error?: string }> = {}

  for (const view of views) {
    try {
      // Try using the refresh function if it exists
      const { error } = await supabase.rpc(`refresh_${view}`) as any

      if (error && !error.message?.includes('does not exist')) {
        results[view] = { success: false, error: error.message }
      } else {
        results[view] = { success: true }
      }
    } catch (err: any) {
      // If individual refresh functions don't exist, we need to run REFRESH MATERIALIZED VIEW via SQL
      // For now, mark as needing manual refresh
      results[view] = { success: false, error: 'Manual refresh required via SQL' }
    }
  }

  return results
}

/**
 * Check materialized view row counts
 */
export async function checkMaterializedViews() {
  const supabase = createServiceClient()

  const views = [
    'mv_player_core_stats',
    'mv_player_agent_pool',
    'mv_team_map_stats',
    'mv_team_compositions'
  ]

  const counts: Record<string, number | null> = {}

  for (const view of views) {
    const { count } = await supabase
      .from(view)
      .select('*', { count: 'exact', head: true })

    counts[view] = count
  }

  return counts
}

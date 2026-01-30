import { createServerClient } from '@/app/lib/supabase/server';

export interface RefreshResult {
  refreshed_at: string;
  duration_ms: number;
  views_refreshed: string[];
}

/**
 * Refresh all analytics materialized views.
 * Call this after data ingestion to update pre-computed stats.
 * Uses REFRESH MATERIALIZED VIEW CONCURRENTLY to avoid locking.
 */
export async function refreshAnalyticsViews(): Promise<RefreshResult> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.rpc('refresh_analytics_views');

  if (error) {
    throw new Error(`Failed to refresh analytics views: ${error.message}`);
  }

  return data as RefreshResult;
}

/**
 * Check if analytics views need refresh based on data staleness.
 * Returns true if last refresh was more than `maxAgeMs` ago.
 */
export async function shouldRefreshViews(maxAgeMs: number = 3600000): Promise<boolean> {
  // For MVP, always allow refresh - could track last refresh time in cache_metadata table
  return true;
}

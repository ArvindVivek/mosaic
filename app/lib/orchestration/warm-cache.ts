import {
  getCachedTeamStrategies,
  getCachedPlayersSummary,
  getCachedCompositions,
  getCachedMapPerformance,
} from '@/app/lib/cache/report-cache';
import { getTeams } from '@/app/lib/data/teams';
import type { Team } from '@/app/lib/data/teams';

export interface WarmCacheResult {
  teamId: string;
  teamName: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

/**
 * Warm cache for a single team by calling all analytics functions
 */
export async function warmTeamCache(
  teamId: string,
  teamName: string
): Promise<WarmCacheResult> {
  const startTime = Date.now();
  const filters = { teamId, seriesIds: [] };

  try {
    await Promise.all([
      getCachedTeamStrategies(filters),
      getCachedPlayersSummary(filters),
      getCachedCompositions(filters),
      getCachedMapPerformance(filters),
    ]);

    return {
      teamId,
      teamName,
      success: true,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      teamId,
      teamName,
      success: false,
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Warm cache for top N teams by name (alphabetically sorted from getTeams)
 * Uses getTeams() and slices the first N results
 * Runs sequentially to avoid overwhelming database
 */
export async function warmTopTeams(
  count: number = 10
): Promise<WarmCacheResult[]> {
  // Get all teams and take the first N
  // Note: getTeams returns teams ordered by name alphabetically
  // For VCT Americas teams, this provides a consistent subset
  const allTeams = await getTeams();
  const teams: Team[] = allTeams.slice(0, count);
  const results: WarmCacheResult[] = [];

  console.log(`Warming cache for ${teams.length} teams...`);

  for (const team of teams) {
    console.log(`Warming cache for ${team.name}...`);
    const result = await warmTeamCache(team.id, team.name);
    results.push(result);

    if (result.success) {
      console.log(`  Completed in ${result.durationMs}ms`);
    } else {
      console.error(`  Failed: ${result.error}`);
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`Cache warming complete: ${successful}/${results.length} teams`);

  return results;
}

/**
 * Warm cache for all teams
 * Use with caution - may take several minutes
 */
export async function warmReportCache(): Promise<WarmCacheResult[]> {
  const allTeams = await getTeams();
  return warmTopTeams(allTeams.length);
}

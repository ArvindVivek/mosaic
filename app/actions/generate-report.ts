'use server';

// Server Action for scouting report generation
// Orchestrates parallel analytics execution with 60s timeout and graceful degradation

import {
  getCachedTeamStrategies,
  getCachedPlayersSummary,
  getCachedCompositions,
  getCachedMapPerformance,
} from '@/app/lib/cache/report-cache';
import { executeBatch } from '@/app/lib/orchestration/batch-executor';
import { getTeamById } from '@/app/lib/data/teams';
import type {
  GenerateReportParams,
  ReportResponse,
  ScoutingReport,
  ReportSection,
} from '@/app/lib/orchestration/types';

// =============================================================================
// Configuration
// =============================================================================

// Vercel function timeout (60s max on free tier)
export const maxDuration = 60;

// Timeout for report generation (55s with 5s buffer for serialization)
const REPORT_TIMEOUT_MS = 55000;

// =============================================================================
// Main Server Action
// =============================================================================

/**
 * Generate a scouting report for a team
 * Orchestrates parallel execution of analytics functions with timeout and graceful degradation
 *
 * @param params - Report generation parameters (teamId, seriesIds, teamName)
 * @returns Report response with success status and metadata
 */
export async function generateReport(
  params: GenerateReportParams
): Promise<ReportResponse> {
  const startTime = Date.now();

  // =============================================================================
  // Input Validation
  // =============================================================================

  if (!params.teamId || params.teamId.trim() === '') {
    return {
      success: false,
      report: null,
      metadata: {
        generatedAt: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        seriesCount: 0,
        cacheHit: false,
        partialFailures: 0,
      },
      error: 'teamId is required',
    };
  }

  const seriesIds = params.seriesIds ?? [];

  // =============================================================================
  // Timeout Setup
  // =============================================================================

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);

  try {
    // =============================================================================
    // Execute Report Generation with Timeout
    // =============================================================================

    const result = await Promise.race([
      executeReportGeneration(params, seriesIds, startTime),
      new Promise<ReportResponse>((_, reject) => {
        controller.signal.addEventListener(
          'abort',
          () => {
            reject(new Error('Report generation timed out after 60s'));
          },
          { once: true }
        );
      }),
    ]);

    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout error
    if (error instanceof Error && error.message.includes('timed out')) {
      console.error('Report generation timeout:', error);
      return {
        success: false,
        report: null,
        metadata: {
          generatedAt: new Date().toISOString(),
          executionTimeMs: Date.now() - startTime,
          seriesCount: seriesIds.length,
          cacheHit: false,
          partialFailures: 0,
        },
        error: 'Report generation timed out. Please try again with fewer series or contact support.',
      };
    }

    // Handle other errors
    console.error('Report generation error:', error);
    return {
      success: false,
      report: null,
      metadata: {
        generatedAt: new Date().toISOString(),
        executionTimeMs: Date.now() - startTime,
        seriesCount: seriesIds.length,
        cacheHit: false,
        partialFailures: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error during report generation',
    };
  }
}

// =============================================================================
// Report Execution Logic
// =============================================================================

/**
 * Execute the actual report generation
 * Separated from main function to enable Promise.race with timeout
 */
async function executeReportGeneration(
  params: GenerateReportParams,
  seriesIds: string[],
  startTime: number
): Promise<ReportResponse> {
  // =============================================================================
  // Resolve Team Name
  // =============================================================================

  let teamName = params.teamName;

  if (!teamName) {
    const teamData = await getTeamById(params.teamId);
    teamName = teamData?.team?.name ?? params.teamId;
  }

  // =============================================================================
  // Execute Analytics Functions in Parallel
  // =============================================================================

  const filters = {
    teamId: params.teamId,
    seriesIds,
  };

  // Execute all 4 cached functions in single batch (already cached, safe to parallelize)
  const batchResults = await executeBatch([
    () => getCachedTeamStrategies(filters),
    () => getCachedPlayersSummary(filters),
    () => getCachedCompositions(filters),
    () => getCachedMapPerformance(filters),
  ]);

  // =============================================================================
  // Map Results to Report Sections
  // =============================================================================

  const [strategiesResult, playersResult, compositionsResult, mapsResult] = batchResults;

  const strategies: ReportSection<typeof strategiesResult.value> = {
    status: strategiesResult.status === 'fulfilled' ? 'success' : 'failed',
    data: strategiesResult.status === 'fulfilled' ? strategiesResult.value ?? null : null,
    error: strategiesResult.status === 'rejected' ? strategiesResult.reason?.message : undefined,
  };

  const players: ReportSection<typeof playersResult.value> = {
    status: playersResult.status === 'fulfilled' ? 'success' : 'failed',
    data: playersResult.status === 'fulfilled' ? playersResult.value ?? null : null,
    error: playersResult.status === 'rejected' ? playersResult.reason?.message : undefined,
  };

  const compositions: ReportSection<typeof compositionsResult.value> = {
    status: compositionsResult.status === 'fulfilled' ? 'success' : 'failed',
    data: compositionsResult.status === 'fulfilled' ? compositionsResult.value ?? null : null,
    error: compositionsResult.status === 'rejected' ? compositionsResult.reason?.message : undefined,
  };

  const maps: ReportSection<typeof mapsResult.value> = {
    status: mapsResult.status === 'fulfilled' ? 'success' : 'failed',
    data: mapsResult.status === 'fulfilled' ? mapsResult.value ?? null : null,
    error: mapsResult.status === 'rejected' ? mapsResult.reason?.message : undefined,
  };

  // =============================================================================
  // Assemble Report
  // =============================================================================

  const report: ScoutingReport = {
    teamId: params.teamId,
    teamName,
    strategies,
    players,
    compositions,
    maps,
  };

  // =============================================================================
  // Calculate Metadata
  // =============================================================================

  const partialFailures = [strategies, players, compositions, maps].filter(
    (section) => section.status === 'failed'
  ).length;

  const atLeastOneSuccess = partialFailures < 4;

  const metadata = {
    generatedAt: new Date().toISOString(),
    executionTimeMs: Date.now() - startTime,
    seriesCount: seriesIds.length,
    cacheHit: false, // TODO: Track actual cache hits
    partialFailures,
  };

  // =============================================================================
  // Return Response
  // =============================================================================

  return {
    success: atLeastOneSuccess,
    report: atLeastOneSuccess ? report : null,
    metadata,
    error: atLeastOneSuccess
      ? undefined
      : 'All analytics functions failed. Please check logs and try again.',
  };
}

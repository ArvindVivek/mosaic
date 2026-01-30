// TypeScript types for report generation orchestration
// Defines the scouting report structure and metadata

// Import existing analytics types
import type {
  TeamStrategiesSummary,
  TeamPlayerSummary,
  CompositionStats,
  MapWinRate,
} from '@/app/lib/analytics/types';

// =============================================================================
// Report Generation Parameters
// =============================================================================

/**
 * Parameters for generating a scouting report
 */
export interface GenerateReportParams {
  /** Team ID to generate report for */
  teamId: string;
  /** Series IDs to include (empty array = all series for team) */
  seriesIds: string[];
  /** Team name for display (fetched if not provided) */
  teamName?: string;
}

// =============================================================================
// Report Sections with Status
// =============================================================================

/**
 * Individual report section with execution status
 * Enables graceful degradation on partial failures
 */
export interface ReportSection<T> {
  /** Execution status */
  status: 'success' | 'failed' | 'skipped';
  /** Section data (null if failed/skipped) */
  data: T | null;
  /** Error message if status is 'failed' */
  error?: string;
}

// =============================================================================
// Complete Scouting Report
// =============================================================================

/**
 * Complete scouting report structure
 * Aggregates all analytics into a single report
 */
export interface ScoutingReport {
  /** Team ID */
  teamId: string;
  /** Team name */
  teamName: string;
  /** Team strategies (pistol, economy, site preferences) */
  strategies: ReportSection<TeamStrategiesSummary>;
  /** Player performance summary */
  players: ReportSection<TeamPlayerSummary[]>;
  /** Team compositions with win rates */
  compositions: ReportSection<CompositionStats[]>;
  /** Map performance statistics */
  maps: ReportSection<MapWinRate[]>;
}

// =============================================================================
// Report Metadata
// =============================================================================

/**
 * Report generation metadata
 * Tracks performance and execution details
 */
export interface ReportMetadata {
  /** ISO timestamp when report was generated */
  generatedAt: string;
  /** Total execution time in milliseconds */
  executionTimeMs: number;
  /** Number of series analyzed */
  seriesCount: number;
  /** Whether result was served from cache */
  cacheHit: boolean;
  /** Count of sections that failed */
  partialFailures: number;
}

// =============================================================================
// Report Response
// =============================================================================

/**
 * Full report generation response
 */
export interface ReportResponse {
  /** Overall success status */
  success: boolean;
  /** Scouting report data (null if failed) */
  report: ScoutingReport | null;
  /** Execution metadata */
  metadata: ReportMetadata;
  /** Error message if success is false */
  error?: string;
}

// =============================================================================
// Progress Updates (for SSE)
// =============================================================================

/**
 * Progress stages for real-time updates
 */
export type ProgressStage =
  | 'initializing'
  | 'team-strategies'
  | 'player-analytics'
  | 'compositions'
  | 'maps'
  | 'assembling'
  | 'complete'
  | 'error';

/**
 * Progress update for Server-Sent Events streaming
 */
export interface ProgressUpdate {
  /** Current execution stage */
  stage: ProgressStage;
  /** Human-readable status message */
  message: string;
  /** Complete report data (only on 'complete' stage) */
  data?: ScoutingReport;
  /** Error message (only on 'error' stage) */
  error?: string;
}

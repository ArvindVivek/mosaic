// Snapshot types for shareable reports

import type { ScoutingReport } from '@/app/lib/orchestration/types';

/**
 * Database row structure for report_snapshots table
 */
export interface ReportSnapshot {
  id: string;
  team_id: string;
  team_name: string;
  series_ids: string[];
  report_data: ScoutingReport;
  created_at: string;
  expires_at: string;
}

/**
 * Input for creating a new snapshot
 */
export interface CreateSnapshotInput {
  teamId: string;
  teamName: string;
  seriesIds: string[];
  report: ScoutingReport;
}

/**
 * Result from snapshot creation
 */
export interface CreateSnapshotResult {
  success: boolean;
  snapshotId?: string;
  shareUrl?: string;
  error?: string;
}

/**
 * Result from loading a snapshot
 */
export interface LoadSnapshotResult {
  success: boolean;
  snapshot?: ReportSnapshot;
  error?: string;
  expired?: boolean;
}

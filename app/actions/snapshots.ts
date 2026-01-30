'use server';

import { nanoid } from 'nanoid';
import { createServerClient } from '@/lib/supabase/server';
import type {
  CreateSnapshotInput,
  CreateSnapshotResult,
  LoadSnapshotResult,
  ReportSnapshot,
} from '@/app/lib/snapshots/types';

/**
 * Create a shareable snapshot of a scouting report
 * Stores the complete report data in JSONB for permanent retrieval
 */
export async function createSnapshot(
  input: CreateSnapshotInput
): Promise<CreateSnapshotResult> {
  try {
    const supabase = await createServerClient();

    // Generate short collision-resistant ID (10 chars)
    const snapshotId = nanoid(10);

    // Calculate expiration (90 days from now)
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

    // Insert snapshot
    const { error } = await supabase.from('report_snapshots').insert({
      id: snapshotId,
      team_id: input.teamId,
      team_name: input.teamName,
      series_ids: input.seriesIds,
      report_data: input.report,
      expires_at: expiresAt,
    });

    if (error) {
      console.error('Failed to create snapshot:', error);
      return {
        success: false,
        error: `Failed to create snapshot: ${error.message}`,
      };
    }

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/reports?snapshot=${snapshotId}`;

    return {
      success: true,
      snapshotId,
      shareUrl,
    };
  } catch (err) {
    console.error('Snapshot creation error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Load a snapshot by ID
 * Returns the frozen report data or error if expired/not found
 */
export async function loadSnapshot(
  snapshotId: string
): Promise<LoadSnapshotResult> {
  try {
    const supabase = await createServerClient();

    // Fetch snapshot
    const { data, error } = await supabase
      .from('report_snapshots')
      .select('*')
      .eq('id', snapshotId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return {
          success: false,
          error: 'Snapshot not found',
        };
      }
      return {
        success: false,
        error: `Failed to load snapshot: ${error.message}`,
      };
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return {
        success: false,
        expired: true,
        error: 'This shared report has expired',
      };
    }

    return {
      success: true,
      snapshot: data as ReportSnapshot,
    };
  } catch (err) {
    console.error('Snapshot load error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check if a snapshot exists and is valid (not expired)
 */
export async function checkSnapshotExists(
  snapshotId: string
): Promise<boolean> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('report_snapshots')
      .select('id, expires_at')
      .eq('id', snapshotId)
      .single();

    if (error || !data) return false;

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

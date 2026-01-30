import type { ProgressStage, ProgressUpdate, ScoutingReport } from './types';

// Stage messages for UI display
export const STAGE_MESSAGES: Record<ProgressStage, string> = {
  initializing: 'Initializing report generation...',
  'team-strategies': 'Analyzing team strategies...',
  'player-analytics': 'Computing player performance...',
  compositions: 'Analyzing team compositions...',
  maps: 'Calculating map performance...',
  assembling: 'Assembling final report...',
  complete: 'Report generation complete',
  error: 'Error generating report',
};

/**
 * Format a progress update as SSE data
 */
export function formatSSE(update: ProgressUpdate): string {
  return `data: ${JSON.stringify(update)}\n\n`;
}

/**
 * Create a progress update object
 */
export function createProgressUpdate(
  stage: ProgressStage,
  options?: {
    message?: string;
    data?: ScoutingReport;
    error?: string;
  }
): ProgressUpdate {
  return {
    stage,
    message: options?.message ?? STAGE_MESSAGES[stage],
    ...(options?.data && { data: options.data }),
    ...(options?.error && { error: options.error }),
  };
}

/**
 * Helper to enqueue a progress update to a stream controller
 */
export function emitProgress(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  stage: ProgressStage,
  options?: {
    message?: string;
    data?: ScoutingReport;
    error?: string;
  }
): void {
  const update = createProgressUpdate(stage, options);
  controller.enqueue(encoder.encode(formatSSE(update)));
}

import { NextRequest } from 'next/server';
import {
  getCachedTeamStrategies,
  getCachedPlayersSummary,
  getCachedCompositions,
  getCachedMapPerformance,
} from '@/app/lib/cache/report-cache';
import { emitProgress } from '@/app/lib/orchestration/progress-emitter';
import type { ScoutingReport, ReportSection, GenerateReportParams } from '@/app/lib/orchestration/types';

// Vercel function timeout
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const params: GenerateReportParams = await request.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Stage 1: Initializing
        emitProgress(controller, encoder, 'initializing');

        const filters = {
          teamId: params.teamId,
          seriesIds: params.seriesIds ?? [],
        };

        // Stage 2: Team Strategies
        emitProgress(controller, encoder, 'team-strategies');
        const strategiesResult = await executeSafe(() => getCachedTeamStrategies(filters));

        // Stage 3: Player Analytics
        emitProgress(controller, encoder, 'player-analytics');
        const playersResult = await executeSafe(() => getCachedPlayersSummary(filters));

        // Stage 4: Compositions
        emitProgress(controller, encoder, 'compositions');
        const compositionsResult = await executeSafe(() => getCachedCompositions(filters));

        // Stage 5: Maps
        emitProgress(controller, encoder, 'maps');
        const mapsResult = await executeSafe(() => getCachedMapPerformance(filters));

        // Stage 6: Assembling
        emitProgress(controller, encoder, 'assembling');

        const report: ScoutingReport = {
          teamId: params.teamId,
          teamName: params.teamName ?? params.teamId,
          strategies: strategiesResult,
          players: playersResult,
          compositions: compositionsResult,
          maps: mapsResult,
        };

        // Stage 7: Complete
        emitProgress(controller, encoder, 'complete', { data: report });

        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        emitProgress(controller, encoder, 'error', { error: message });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper to execute a function safely and return ReportSection
async function executeSafe<T>(fn: () => Promise<T>): Promise<ReportSection<T>> {
  try {
    const data = await fn();
    return { status: 'success', data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Function execution failed:', message);
    return { status: 'failed', data: null, error: message };
  }
}

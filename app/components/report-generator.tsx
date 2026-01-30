'use client';

import { useState, useCallback } from 'react';
import type { ProgressUpdate, ScoutingReport, ProgressStage } from '@/app/lib/orchestration/types';

interface ReportGeneratorProps {
  teamId: string;
  teamName: string;
  seriesIds?: string[];
  onComplete?: (report: ScoutingReport) => void;
  onError?: (error: string) => void;
}

export function ReportGenerator({
  teamId,
  teamName,
  seriesIds = [],
  onComplete,
  onError,
}: ReportGeneratorProps) {
  const [stage, setStage] = useState<ProgressStage | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setStage('initializing');
    setMessage('Starting report generation...');

    try {
      const response = await fetch('/api/reports/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, teamName, seriesIds }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start report generation');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const update: ProgressUpdate = JSON.parse(line.slice(6));
            setStage(update.stage);
            setMessage(update.message);

            if (update.stage === 'complete' && update.data) {
              onComplete?.(update.data);
            } else if (update.stage === 'error' && update.error) {
              setError(update.error);
              onError?.(update.error);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setStage('error');
      setMessage('Failed to generate report');
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [teamId, teamName, seriesIds, onComplete, onError]);

  return (
    <div className="space-y-4">
      <button
        onClick={generateReport}
        disabled={isGenerating}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? 'Generating...' : 'Generate Report'}
      </button>

      {isGenerating && (
        <div className="flex items-center gap-3">
          {/* Animated spinner */}
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600 animate-pulse">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {stage === 'complete' && !error && (
        <div className="p-3 bg-green-50 text-green-700 rounded-md">
          Report generated successfully!
        </div>
      )}
    </div>
  );
}

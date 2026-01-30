'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ProgressUpdate, ScoutingReport, ProgressStage } from '@/app/lib/orchestration/types';

interface ReportGeneratorProps {
  teamId: string;
  teamName: string;
  seriesIds?: string[];
  matchCount?: number;
  onComplete?: (report: ScoutingReport) => void;
  onError?: (error: string) => void;
  hasReport?: boolean;
}

export function ReportGenerator({
  teamId,
  teamName,
  seriesIds = [],
  matchCount,
  onComplete,
  onError,
  hasReport = false,
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
        body: JSON.stringify({ teamId, teamName, seriesIds, matchCount }),
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
  }, [teamId, teamName, seriesIds, matchCount, onComplete, onError]);

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={generateReport}
        disabled={isGenerating}
        size="lg"
        className={`
          gap-2 font-semibold shadow-lg transition-all duration-300
          ${!hasReport && !isGenerating
            ? 'animate-pulse bg-primary hover:bg-primary/90 hover:scale-105'
            : 'hover:scale-102'
          }
          ${isGenerating ? 'opacity-80' : ''}
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : hasReport ? (
          <>
            <Sparkles className="h-4 w-4" />
            Regenerate
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Report
          </>
        )}
      </Button>

      {/* Status indicators */}
      {isGenerating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
          <span className="animate-pulse">{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {stage === 'complete' && !error && !isGenerating && (
        <div className="flex items-center gap-2 text-sm text-green-600 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Report ready</span>
        </div>
      )}
    </div>
  );
}

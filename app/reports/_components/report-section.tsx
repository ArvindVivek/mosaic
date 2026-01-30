'use client';

import { useState, useEffect } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import { loadSnapshot } from '@/app/actions/snapshots';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share2 } from 'lucide-react';
import { ReportGenerator } from '@/app/components/report-generator';
import { ReportTabs } from './report-tabs';
import { ReportDisplay } from './report-display';
import type { ScoutingReport } from '@/app/lib/orchestration/types';

interface ReportSectionProps {
  teamId: string;
  teamName: string;
}

export function ReportSection({ teamId, teamName }: ReportSectionProps) {
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Read matchCount from URL for display (0 = All)
  const [matchCount] = useQueryState('matchCount', parseAsInteger.withDefault(10));

  // Snapshot loading state
  const searchParams = useSearchParams();
  const snapshotId = searchParams.get('snapshot');
  const [snapshotData, setSnapshotData] = useState<ScoutingReport | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [snapshotMeta, setSnapshotMeta] = useState<{ createdAt: string } | null>(null);

  // Load snapshot if param exists
  useEffect(() => {
    if (snapshotId) {
      setIsLoadingSnapshot(true);
      setSnapshotError(null);
      loadSnapshot(snapshotId).then((result) => {
        setIsLoadingSnapshot(false);
        if (result.success && result.snapshot) {
          setSnapshotData(result.snapshot.report_data as ScoutingReport);
          setSnapshotMeta({ createdAt: result.snapshot.created_at });
        } else {
          setSnapshotError(result.error || 'Failed to load shared report');
        }
      });
    }
  }, [snapshotId]);

  const handleComplete = (generatedReport: ScoutingReport) => {
    setReport(generatedReport);
    setIsGenerating(false);
  };

  const handleError = () => {
    setIsGenerating(false);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
  };

  // If viewing a snapshot, show snapshot content
  if (snapshotId) {
    if (isLoadingSnapshot) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading shared report...</div>
          </div>
        </div>
      );
    }

    if (snapshotError) {
      return (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertDescription>{snapshotError}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (snapshotData) {
      return (
        <div className="space-y-6">
          <Alert>
            <Share2 className="h-4 w-4" />
            <AlertDescription>
              Viewing shared report snapshot
              {snapshotMeta?.createdAt && ` (created ${new Date(snapshotMeta.createdAt).toLocaleDateString()})`}
            </AlertDescription>
          </Alert>
          <ReportTabs report={snapshotData} loading={false} />
          <ReportDisplay report={snapshotData} isSnapshot={true} />
        </div>
      );
    }
  }

  // Live report generation
  return (
    <div className="space-y-6">
      {/* Report Generator with Button */}
      <div onClick={handleGenerate}>
        <ReportGenerator
          teamId={teamId}
          teamName={teamName}
          matchCount={matchCount === 0 ? undefined : matchCount}
          onComplete={handleComplete}
          onError={handleError}
        />
      </div>

      {/* Report Tabs and Display */}
      {report && (
        <div className="space-y-4">
          <ReportTabs report={report} loading={isGenerating} />
          <ReportDisplay report={report} isSnapshot={false} seriesIds={report.seriesIds ?? []} />
        </div>
      )}
    </div>
  );
}

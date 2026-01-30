'use client';

import { useState, useEffect } from 'react';
import { useQueryState, parseAsInteger, parseAsStringLiteral } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import { loadSnapshot } from '@/app/actions/snapshots';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share2 } from 'lucide-react';
import { ReportGenerator } from '@/app/components/report-generator';
import { ReportTabs } from './report-tabs';
import { ReportDisplay } from './report-display';
import type { ScoutingReport } from '@/app/lib/orchestration/types';

const TAB_VALUES = ['overview', 'strategies', 'players', 'compositions', 'maps', 'counters'] as const;
type TabValue = typeof TAB_VALUES[number];

interface ReportSectionProps {
  teamId: string;
  teamName: string;
}

export function ReportSection({ teamId, teamName }: ReportSectionProps) {
  const [report, setReport] = useState<ScoutingReport | null>(null);

  // Read matchCount from URL for display (0 = All)
  const [matchCount] = useQueryState('matchCount', parseAsInteger.withDefault(10));

  // Tab state - managed here and passed to children
  const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(TAB_VALUES).withDefault('overview'));

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
  };

  const handleError = () => {
    // Error is handled by ReportGenerator
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
          <ReportTabs report={snapshotData} loading={false} tab={tab} onTabChange={(v) => setTab(v as TabValue)} />
          <ReportDisplay report={snapshotData} isSnapshot={true} tab={tab} />
        </div>
      );
    }
  }

  // Live report generation
  return (
    <div className="space-y-4">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{teamName}</h2>
          <p className="text-sm text-muted-foreground">
            {matchCount === 0 ? 'All matches' : `Last ${matchCount} matches`}
          </p>
        </div>
        <ReportGenerator
          teamId={teamId}
          teamName={teamName}
          matchCount={matchCount === 0 ? undefined : matchCount}
          onComplete={handleComplete}
          onError={handleError}
          hasReport={!!report}
        />
      </div>

      {/* Report Tabs and Display */}
      {report && (
        <div className="space-y-4">
          <ReportTabs report={report} loading={false} tab={tab} onTabChange={(v) => setTab(v as TabValue)} />
          <ReportDisplay report={report} isSnapshot={false} seriesIds={report.seriesIds ?? []} tab={tab} />
        </div>
      )}
    </div>
  );
}

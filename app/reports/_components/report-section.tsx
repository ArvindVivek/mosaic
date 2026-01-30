'use client';

import { useState } from 'react';
import { useQueryState, parseAsInteger } from 'nuqs';
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
          <ReportDisplay report={report} />
        </div>
      )}
    </div>
  );
}

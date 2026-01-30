'use client';

import { useQueryState, parseAsStringLiteral } from 'nuqs';
import { TabsContent } from '@/components/ui/tabs';
import type { ScoutingReport, ReportSection } from '@/app/lib/orchestration/types';
import { ExecutiveSummary } from './sections/executive-summary';
import { StrategiesSection } from './sections/strategies-section';
import { PlayersSection } from './sections/players-section';
import { CompositionsSection } from './sections/compositions-section';
import { MapsSection } from './sections/maps-section';
import { CounterStrategiesSection } from './sections/counter-strategies-section';
import { DataFreshness } from './visualizations/data-freshness';
import { ShareButton } from './share-button';

// Must match TAB_VALUES from report-tabs.tsx
const TAB_VALUES = ['strategies', 'players', 'compositions', 'maps', 'counters'] as const;

interface ReportDisplayProps {
  report: ScoutingReport | null;
  metadata?: {
    generatedAt: string;
    seriesCount: number;
  };
  seriesIds?: string[];
  isSnapshot?: boolean;
}

export function ReportDisplay({ report, metadata, seriesIds, isSnapshot }: ReportDisplayProps) {
  const [tab] = useQueryState(
    'tab',
    parseAsStringLiteral(TAB_VALUES).withDefault('strategies')
  );

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-[400px] mt-6 space-y-6">
      {/* Executive Summary - Always visible above tabs */}
      <div className="flex items-start justify-between gap-4">
        <ExecutiveSummary report={report} />
        {!isSnapshot && seriesIds && seriesIds.length > 0 && (
          <ShareButton report={report} seriesIds={seriesIds} />
        )}
      </div>

      {/* Tab Content */}
      {/* Strategies Tab */}
      <TabsContent value="strategies" className="space-y-4">
        <h2 className="text-2xl font-bold">Team Strategies</h2>
        <SectionContent section={report.strategies}>
          {(data) => <StrategiesSection strategies={data} />}
        </SectionContent>
      </TabsContent>

      {/* Players Tab */}
      <TabsContent value="players" className="space-y-4">
        <h2 className="text-2xl font-bold">Player Performance</h2>
        <SectionContent section={report.players}>
          {(data) => <PlayersSection players={data} />}
        </SectionContent>
      </TabsContent>

      {/* Compositions Tab */}
      <TabsContent value="compositions" className="space-y-4">
        <h2 className="text-2xl font-bold">Team Compositions</h2>
        <SectionContent section={report.compositions}>
          {(data) => <CompositionsSection compositions={data} />}
        </SectionContent>
      </TabsContent>

      {/* Maps Tab */}
      <TabsContent value="maps" className="space-y-4">
        <h2 className="text-2xl font-bold">Map Performance</h2>
        <SectionContent section={report.maps}>
          {(data) => <MapsSection maps={data} />}
        </SectionContent>
      </TabsContent>

      {/* Counter-Strategies Tab */}
      <TabsContent value="counters" className="space-y-4">
        <h2 className="text-2xl font-bold">Counter-Strategies</h2>
        <CounterStrategiesSection report={report} />
      </TabsContent>

      {/* Data Freshness Footer */}
      {metadata && (
        <DataFreshness
          matchCount={metadata.seriesCount}
          lastUpdated={metadata.generatedAt}
        />
      )}
    </div>
  );
}

// Helper component to handle section status
interface SectionContentProps<T> {
  section: ReportSection<T>;
  children: (data: T) => React.ReactNode;
}

function SectionContent<T>({ section, children }: SectionContentProps<T>) {
  if (section.status === 'failed') {
    return (
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <p className="text-red-700 font-semibold">Failed to load section</p>
        <p className="text-red-600 text-sm mt-2">{section.error || 'Unknown error'}</p>
      </div>
    );
  }

  if (section.status === 'skipped' || !section.data) {
    return (
      <div className="border rounded-lg p-6 bg-muted/10">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return <>{children(section.data)}</>;
}

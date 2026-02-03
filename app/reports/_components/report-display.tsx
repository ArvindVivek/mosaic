'use client';

import { useEffect, useState } from 'react';
import type { ScoutingReport, ReportSection } from '@/app/lib/orchestration/types';
import { ExecutiveSummary } from './sections/executive-summary';
import { StrategiesSection } from './sections/strategies-section';
import { PlayersSection } from './sections/players-section';
import { CompositionsSection } from './sections/compositions-section';
import { MapsSection } from './sections/maps-section';
import { CounterStrategiesSection } from './sections/counter-strategies-section';
import { VODAnalysisSection } from './sections/vod-analysis-section';
import { DataFreshness } from './visualizations/data-freshness';
import { ShareButton } from './share-button';
import { OverviewSection } from './sections/overview-section';

type TabValue = 'overview' | 'strategies' | 'players' | 'compositions' | 'maps' | 'counters' | 'vod';

interface ReportDisplayProps {
  report: ScoutingReport | null;
  metadata?: {
    generatedAt: string;
    seriesCount: number;
  };
  seriesIds?: string[];
  isSnapshot?: boolean;
  tab: TabValue;
}

export function ReportDisplay({ report, metadata, seriesIds, isSnapshot, tab }: ReportDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTab, setCurrentTab] = useState(tab);

  // Handle tab transitions with fade animation
  useEffect(() => {
    if (currentTab !== tab) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentTab(tab);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [tab, currentTab]);

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-[600px]">
      {/* Share Button - Fixed Position */}
      {!isSnapshot && seriesIds && seriesIds.length > 0 && (
        <div className="flex justify-end mb-4 animate-fade-in">
          <ShareButton report={report} seriesIds={seriesIds} />
        </div>
      )}

      {/* Tab Content - Self-contained with CSS animations */}
      <div
        className={`space-y-6 transition-all duration-200 ${
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {currentTab === 'overview' && (
          <OverviewSection report={report} metadata={metadata} />
        )}

        {currentTab === 'strategies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Team Strategies</h2>
            </div>
            <SectionContent section={report.strategies}>
              {(data) => <StrategiesSection strategies={data} />}
            </SectionContent>
          </div>
        )}

        {currentTab === 'players' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Player Performance</h2>
            </div>
            <SectionContent section={report.players}>
              {(data) => <PlayersSection players={data} />}
            </SectionContent>
          </div>
        )}

        {currentTab === 'compositions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Team Compositions</h2>
            </div>
            <SectionContent section={report.compositions}>
              {(data) => <CompositionsSection compositions={data} />}
            </SectionContent>
          </div>
        )}

        {currentTab === 'maps' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Map Performance</h2>
            </div>
            <SectionContent section={report.maps}>
              {(data) => <MapsSection maps={data} />}
            </SectionContent>
          </div>
        )}

        {currentTab === 'counters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Counter-Strategies</h2>
            </div>
            <CounterStrategiesSection report={report} />
          </div>
        )}

        {currentTab === 'vod' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">VOD Analysis</h2>
            </div>
            <VODAnalysisSection
              teamId={report.teamId}
              teamName={report.teamName}
            />
          </div>
        )}

        {/* Data Freshness Footer - Only show on non-overview tabs */}
        {currentTab !== 'overview' && metadata && (
          <div className="pt-6 border-t">
            <DataFreshness
              matchCount={metadata.seriesCount}
              lastUpdated={metadata.generatedAt}
            />
          </div>
        )}
      </div>
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

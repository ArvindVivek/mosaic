'use client';

import { useQueryState, parseAsStringLiteral } from 'nuqs';
import { TabsContent } from '@/components/ui/tabs';
import type { ScoutingReport, ReportSection } from '@/app/lib/orchestration/types';

// Must match TAB_VALUES from report-tabs.tsx
const TAB_VALUES = ['strategies', 'players', 'compositions', 'maps', 'counters'] as const;

interface ReportDisplayProps {
  report: ScoutingReport | null;
}

export function ReportDisplay({ report }: ReportDisplayProps) {
  const [tab] = useQueryState(
    'tab',
    parseAsStringLiteral(TAB_VALUES).withDefault('strategies')
  );

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-[400px] mt-6">
      {/* Strategies Tab */}
      <TabsContent value="strategies" className="space-y-4">
        <h2 className="text-2xl font-bold">Team Strategies</h2>
        <SectionContent section={report.strategies}>
          {(data) => (
            <div className="border rounded-lg p-6 bg-white space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Pistol Round Strategy</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(data.pistolRound, null, 2)}
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Economy Management</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(data.economyManagement, null, 2)}
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Site Preferences</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(data.sitePreferences, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SectionContent>
      </TabsContent>

      {/* Players Tab */}
      <TabsContent value="players" className="space-y-4">
        <h2 className="text-2xl font-bold">Player Performance</h2>
        <SectionContent section={report.players}>
          {(data) => (
            <div className="space-y-4">
              {data.map((player, idx) => (
                <div key={idx} className="border rounded-lg p-6 bg-white space-y-3">
                  <h3 className="text-lg font-semibold">{player.playerName || 'Unknown Player'}</h3>
                  <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(player, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </SectionContent>
      </TabsContent>

      {/* Compositions Tab */}
      <TabsContent value="compositions" className="space-y-4">
        <h2 className="text-2xl font-bold">Team Compositions</h2>
        <SectionContent section={report.compositions}>
          {(data) => (
            <div className="space-y-4">
              {data.map((comp, idx) => (
                <div key={idx} className="border rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-3">
                    Composition {idx + 1}
                  </h3>
                  <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(comp, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </SectionContent>
      </TabsContent>

      {/* Maps Tab */}
      <TabsContent value="maps" className="space-y-4">
        <h2 className="text-2xl font-bold">Map Performance</h2>
        <SectionContent section={report.maps}>
          {(data) => (
            <div className="space-y-4">
              {data.map((map, idx) => (
                <div key={idx} className="border rounded-lg p-6 bg-white">
                  <h3 className="text-lg font-semibold mb-3">
                    {map.mapName || 'Unknown Map'}
                  </h3>
                  <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(map, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </SectionContent>
      </TabsContent>

      {/* Counter-Strategies Tab */}
      <TabsContent value="counters" className="space-y-4">
        <h2 className="text-2xl font-bold">Counter-Strategies</h2>
        <div className="border rounded-lg p-8 bg-gray-50 text-center">
          <p className="text-gray-500 text-lg">
            Counter-strategies coming in Phase 6
          </p>
        </div>
      </TabsContent>
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
      <div className="border rounded-lg p-6 bg-gray-50">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return <>{children(section.data)}</>;
}

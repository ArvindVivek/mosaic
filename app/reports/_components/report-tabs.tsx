'use client';

import { useQueryState, parseAsStringLiteral } from 'nuqs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ScoutingReport } from '@/app/lib/orchestration/types';

// Define tab values as const for type safety
const TAB_VALUES = ['strategies', 'players', 'compositions', 'maps', 'counters'] as const;
type TabValue = typeof TAB_VALUES[number];

interface ReportTabsProps {
  report: ScoutingReport | null;
  loading?: boolean;
}

export function ReportTabs({ report, loading = false }: ReportTabsProps) {
  // URL-synced tab state with type-safe literal values
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringLiteral(TAB_VALUES).withDefault('strategies')
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as TabValue)}
      className="w-full"
    >
      <TabsList className="flex flex-wrap w-full h-auto">
        <TabsTrigger
          value="strategies"
          disabled={loading || !report}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Strategies
        </TabsTrigger>
        <TabsTrigger
          value="players"
          disabled={loading || !report}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Players
        </TabsTrigger>
        <TabsTrigger
          value="compositions"
          disabled={loading || !report}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Compositions
        </TabsTrigger>
        <TabsTrigger
          value="maps"
          disabled={loading || !report}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Maps
        </TabsTrigger>
        <TabsTrigger
          value="counters"
          disabled={loading || !report}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Counter-Strategies
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

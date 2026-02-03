'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, Layers, Map, Target, LayoutDashboard, Film } from 'lucide-react';
import type { ScoutingReport } from '@/app/lib/orchestration/types';

// Define tab values with overview as first tab
const TAB_VALUES = ['overview', 'strategies', 'players', 'compositions', 'maps', 'counters', 'vod'] as const;
type TabValue = typeof TAB_VALUES[number];

interface ReportTabsProps {
  report: ScoutingReport | null;
  loading?: boolean;
  tab: TabValue;
  onTabChange: (tab: string) => void;
}

const TAB_CONFIG = [
  { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  { value: 'strategies', label: 'Strategies', icon: BarChart3 },
  { value: 'players', label: 'Players', icon: Users },
  { value: 'compositions', label: 'Compositions', icon: Layers },
  { value: 'maps', label: 'Maps', icon: Map },
  { value: 'counters', label: 'Counter-Strategies', icon: Target },
  { value: 'vod', label: 'VOD Analysis', icon: Film },
] as const;

export function ReportTabs({ report, loading = false, tab, onTabChange }: ReportTabsProps) {

  return (
    <Tabs
      value={tab}
      onValueChange={onTabChange}
      className="w-full"
    >
      <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
        {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            disabled={loading || !report}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

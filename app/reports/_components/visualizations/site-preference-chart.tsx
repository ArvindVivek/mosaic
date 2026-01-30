'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { SitePreference } from '@/app/lib/analytics/types';

const chartConfig = {
  preference_pct: {
    label: 'Attack %',
    color: 'hsl(var(--chart-1))',
  },
  win_rate: {
    label: 'Win Rate',
    color: 'hsl(var(--chart-3))',
  },
};

interface SitePreferenceChartProps {
  sitePrefs: SitePreference[];
  mapName?: string;
  title?: string;
}

export function SitePreferenceChart({
  sitePrefs,
  mapName,
  title,
}: SitePreferenceChartProps) {
  // Filter by map if specified
  const filteredData = mapName
    ? sitePrefs.filter((s) => s.map_name === mapName)
    : sitePrefs;

  // Transform for chart display
  const chartData = filteredData.map((pref) => ({
    site: mapName ? pref.site : `${pref.map_name} ${pref.site}`,
    preference_pct: pref.preference_pct,
    win_rate: pref.win_rate,
    attacks: pref.attacks,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No site preference data available</p>
      </div>
    );
  }

  const chartTitle = title ?? (mapName
    ? `${mapName} Site Preferences`
    : 'Site Attack Patterns');

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-semibold">{chartTitle}</h3>
        <p className="text-sm text-muted-foreground">
          Attack frequency and success rate by site
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="site"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (name === 'preference_pct') return [`${value}%`, 'Attack %'];
                  if (name === 'win_rate') return [`${value}%`, 'Win Rate'];
                  return [value, name];
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="preference_pct"
            fill="var(--color-preference_pct)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="win_rate"
            fill="var(--color-win_rate)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

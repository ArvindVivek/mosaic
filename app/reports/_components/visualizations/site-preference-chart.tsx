'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { SitePreference } from '@/app/lib/analytics/types';

const chartConfig = {
  preference_pct: {
    label: 'Attack %',
    color: 'hsl(var(--chart-1))',
  },
};

interface SitePreferenceChartProps {
  sitePrefs: SitePreference[];
  mapName?: string;
  title?: string;
}

// Custom label renderer
const renderLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="hsl(var(--foreground))"
      textAnchor="middle"
      className="text-xs font-semibold"
    >
      {value}%
    </text>
  );
};

export function SitePreferenceChart({
  sitePrefs,
  mapName,
  title,
}: SitePreferenceChartProps) {
  // Filter by map if specified with null checks
  const filteredData = mapName
    ? sitePrefs.filter((s) => s.map_name === mapName)
    : sitePrefs;

  // Transform for chart display with null checks
  const chartData = filteredData.map((pref) => {
    const preferencePct = pref.preference_pct ?? 0;
    const winRate = pref.win_rate ?? 0;

    return {
      site: mapName ? pref.site : `${pref.map_name} ${pref.site}`,
      preference_pct: preferencePct,
      win_rate: winRate,
      attacks: pref.attacks ?? 0,
      // Color based on win rate
      fill: winRate >= 60
        ? 'hsl(142, 76%, 36%)'
        : winRate < 40
        ? 'hsl(0, 84%, 60%)'
        : 'hsl(var(--chart-1))',
    };
  });

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
          Attack frequency by site (color shows win rate)
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <BarChart
          data={chartData}
          accessibilityLayer
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="site"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 13, fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const data = props.payload;
                  return [
                    <span key="tooltip" className="flex flex-col gap-1">
                      <span className="font-semibold text-base">
                        {data.site}
                      </span>
                      <span className="text-sm">
                        {data.preference_pct}% attack frequency
                      </span>
                      <span className="text-sm">
                        {data.win_rate}% win rate
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.attacks} attacks
                      </span>
                    </span>,
                    '',
                  ];
                }}
              />
            }
          />
          <Bar
            dataKey="preference_pct"
            radius={[6, 6, 0, 0]}
            barSize={60}
          >
            <LabelList dataKey="preference_pct" content={renderLabel} />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Win rate legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
          <span>High win rate (60%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
          <span>Neutral (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }} />
          <span>Low win rate (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
}

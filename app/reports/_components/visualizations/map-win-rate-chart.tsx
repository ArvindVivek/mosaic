'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { MapWinRate } from '@/app/lib/analytics/types';

const chartConfig = {
  win_rate: {
    label: 'Win Rate',
    color: 'hsl(var(--chart-1))',
  },
};

interface MapWinRateChartProps {
  maps: MapWinRate[];
  title?: string;
}

// Custom label renderer for data labels on bars
const renderCustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  const winRate = value ?? 0;

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="hsl(var(--foreground))"
      textAnchor="start"
      dominantBaseline="middle"
      className="text-sm font-semibold"
    >
      {winRate}%
    </text>
  );
};

export function MapWinRateChart({
  maps,
  title = 'Map Win Rates',
}: MapWinRateChartProps) {
  // Sort by win rate descending with null checks
  const sortedMaps = [...maps].sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0));

  // Transform data with gradient color coding
  const chartData = sortedMaps.map((map) => {
    const winRate = map.win_rate ?? 0;
    let fill = 'url(#gradientNeutral)';

    if (winRate >= 60) {
      fill = 'url(#gradientGreen)';
    } else if (winRate < 40) {
      fill = 'url(#gradientRed)';
    }

    return {
      map_name: map.map_name,
      win_rate: winRate,
      games_played: map.games_played ?? 0,
      wins: map.wins ?? 0,
      losses: map.losses ?? 0,
      fill,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No map data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Win rate by map (green = strength, amber = neutral, red = weakness)
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          accessibilityLayer
          margin={{ left: 10, right: 50, top: 5, bottom: 5 }}
          barGap={8}
        >
          <defs>
            <linearGradient id="gradientGreen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(142, 76%, 36%)" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="gradientRed" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="gradientNeutral" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="map_name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 13, fontWeight: 500 }}
            width={90}
          />
          <ReferenceLine
            x={50}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const data = props.payload;
                  return [
                    <span key="tooltip" className="flex flex-col gap-1">
                      <span className="font-semibold text-base">
                        {data.win_rate}% Win Rate
                      </span>
                      <span className="text-sm">
                        {data.wins}W - {data.losses}L
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {data.games_played} games played
                      </span>
                    </span>,
                    '',
                  ];
                }}
              />
            }
          />
          <Bar
            dataKey="win_rate"
            radius={[0, 6, 6, 0]}
            barSize={32}
          >
            <LabelList dataKey="win_rate" content={renderCustomLabel} />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

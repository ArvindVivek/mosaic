'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ReferenceLine } from 'recharts';
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

export function MapWinRateChart({
  maps,
  title = 'Map Win Rates',
}: MapWinRateChartProps) {
  // Sort by win rate descending
  const sortedMaps = [...maps].sort((a, b) => b.win_rate - a.win_rate);

  // Transform data with color coding
  const chartData = sortedMaps.map((map) => ({
    map_name: map.map_name,
    win_rate: map.win_rate,
    games_played: map.games_played,
    wins: map.wins,
    losses: map.losses,
    // Color: green if >60%, red if <40%, neutral otherwise
    fill:
      map.win_rate >= 60
        ? 'hsl(var(--chart-2))'  // green-ish
        : map.win_rate < 40
        ? 'hsl(var(--destructive))'  // red-ish
        : 'hsl(var(--chart-1))',  // neutral
  }));

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
          Win rate by map (green = strength, red = weakness)
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          accessibilityLayer
          margin={{ left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <YAxis
            type="category"
            dataKey="map_name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={80}
          />
          <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const data = props.payload;
                  return [
                    <span key="tooltip">
                      {data.win_rate}% ({data.wins}W - {data.losses}L)
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {data.games_played} games
                      </span>
                    </span>,
                    'Win Rate',
                  ];
                }}
              />
            }
          />
          <Bar dataKey="win_rate" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

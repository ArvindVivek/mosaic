'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import type { CompositionStats } from '@/app/lib/analytics/types';

const chartConfig = {
  games_played: {
    label: 'Games Played',
    color: 'hsl(var(--chart-1))',
  },
};

interface CompositionFrequencyChartProps {
  compositions: CompositionStats[];
  title?: string;
  maxComps?: number;
}

// Custom label to show win rate badges on bars
const renderWinRateLabel = (props: any) => {
  const { x, y, width, height, value, winRate } = props;
  const displayWinRate = winRate ?? 0;
  const badgeColor = displayWinRate >= 60 ? '#16a34a' : displayWinRate < 40 ? '#dc2626' : '#6b7280';

  return (
    <g>
      <rect
        x={x + width + 8}
        y={y + height / 2 - 10}
        width={50}
        height={20}
        rx={4}
        fill={badgeColor}
        opacity={0.9}
      />
      <text
        x={x + width + 33}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-semibold"
      >
        {displayWinRate}%
      </text>
    </g>
  );
};

export function CompositionFrequencyChart({
  compositions,
  title = 'Top Team Compositions',
  maxComps = 5,
}: CompositionFrequencyChartProps) {
  // Sort by games played and take top N with null checks
  const topComps = [...compositions]
    .sort((a, b) => (b.games_played ?? 0) - (a.games_played ?? 0))
    .slice(0, maxComps);

  // Transform composition array to readable string with agent names
  const chartData = topComps.map((comp, index) => {
    const composition = comp.composition ?? [];
    const gamesPlayed = comp.games_played ?? 0;
    const winRate = comp.win_rate ?? 0;
    const winCount = comp.win_count ?? 0;

    // Shorten agent names for cleaner display (take first 3 agents + "...")
    const displayName = composition.length > 3
      ? `${composition.slice(0, 3).join(', ')}...`
      : composition.join(', ');

    const fullComp = composition.join(', ');

    return {
      name: displayName,
      fullComp,
      games_played: gamesPlayed,
      win_rate: winRate,
      win_count: winCount,
      // Color based on usage frequency
      fill: index === 0
        ? 'hsl(var(--chart-1))'
        : index === 1
        ? 'hsl(var(--chart-2))'
        : 'hsl(var(--chart-3))',
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No composition data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Most frequently used team compositions with win rates
        </p>
      </div>

      <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          accessibilityLayer
          margin={{ left: 10, right: 80, top: 5, bottom: 5 }}
          barGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            label={{ value: 'Games Played', position: 'bottom', offset: 0 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fontWeight: 500 }}
            width={180}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const data = props.payload;
                  return [
                    <span key="tooltip" className="flex flex-col gap-1">
                      <span className="font-semibold text-sm mb-1">{data.fullComp}</span>
                      <span className="text-sm">
                        {data.games_played} games played
                      </span>
                      <span className="text-sm">
                        {data.win_count}W - {data.games_played - data.win_count}L
                      </span>
                      <span className="text-sm font-semibold">
                        {data.win_rate}% win rate
                      </span>
                    </span>,
                    '',
                  ];
                }}
              />
            }
          />
          <Bar
            dataKey="games_played"
            radius={[0, 6, 6, 0]}
            barSize={36}
          >
            <LabelList
              dataKey="win_rate"
              content={(props) => renderWinRateLabel({ ...props, winRate: props.value })}
            />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Composition details legend */}
      <div className="space-y-2 pt-2 border-t">
        <h4 className="text-sm font-semibold">Full Compositions</h4>
        <div className="space-y-2">
          {chartData.map((comp, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-[100px]">
                <span className="font-medium text-muted-foreground">#{index + 1}</span>
                <Badge variant={comp.win_rate >= 60 ? 'default' : comp.win_rate < 40 ? 'destructive' : 'secondary'}>
                  {comp.win_rate}% WR
                </Badge>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {topComps[index]?.composition?.map((agent) => (
                    <Badge key={agent} variant="outline" className="text-xs">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {comp.games_played} games
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

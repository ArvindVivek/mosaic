'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { CompositionStats } from '@/app/lib/analytics/types';

const chartConfig = {
  games_played: {
    label: 'Games',
    color: 'hsl(var(--chart-1))',
  },
  win_rate: {
    label: 'Win Rate',
    color: 'hsl(var(--chart-2))',
  },
};

interface CompositionFrequencyChartProps {
  compositions: CompositionStats[];
  title?: string;
  maxComps?: number;
}

export function CompositionFrequencyChart({
  compositions,
  title = 'Composition Usage',
  maxComps = 5,
}: CompositionFrequencyChartProps) {
  // Sort by games played and take top N
  const topComps = [...compositions]
    .sort((a, b) => b.games_played - a.games_played)
    .slice(0, maxComps);

  // Transform composition array to readable string
  const chartData = topComps.map((comp, index) => ({
    name: `Comp ${index + 1}`,
    fullComp: comp.composition.join(', '),
    games_played: comp.games_played,
    win_rate: comp.win_rate,
    win_count: comp.win_count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No composition data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Games played and win rate by team composition
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  if (name === 'games_played') {
                    return [
                      <span key="games">
                        {value} games
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {props.payload?.fullComp}
                        </span>
                      </span>,
                      'Usage',
                    ];
                  }
                  if (name === 'win_rate') {
                    return [`${value}%`, 'Win Rate'];
                  }
                  return [value, name];
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            yAxisId="left"
            dataKey="games_played"
            fill="var(--color-games_played)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="win_rate"
            fill="var(--color-win_rate)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
      {/* Composition legend */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2">
        {chartData.map((comp) => (
          <div key={comp.name} className="flex gap-2">
            <span className="font-medium">{comp.name}:</span>
            <span>{comp.fullComp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

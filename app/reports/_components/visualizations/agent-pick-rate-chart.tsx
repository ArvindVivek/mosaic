'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { PlayerAgentStats } from '@/app/lib/analytics/types';

const chartConfig = {
  pick_rate: {
    label: 'Pick Rate',
    color: 'hsl(var(--chart-1))',
  },
  win_rate: {
    label: 'Win Rate',
    color: 'hsl(var(--chart-2))',
  },
};

interface AgentPickRateChartProps {
  agents: PlayerAgentStats[];
  title?: string;
  description?: string;
  maxAgents?: number;
}

export function AgentPickRateChart({
  agents,
  title = 'Agent Pool',
  description = 'Pick rate and win rate by agent',
  maxAgents = 5,
}: AgentPickRateChartProps) {
  // Sort by pick rate and take top N
  const topAgents = [...agents]
    .sort((a, b) => b.pick_rate - a.pick_rate)
    .slice(0, maxAgents);

  if (topAgents.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No agent data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart data={topAgents} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="agent"
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
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="pick_rate"
            fill="var(--color-pick_rate)"
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

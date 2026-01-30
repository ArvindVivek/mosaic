'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { PlayerAgentStats } from '@/app/lib/analytics/types';

const chartConfig = {
  pick_rate: {
    label: 'Pick Rate',
    color: 'hsl(var(--chart-1))',
  },
};

interface AgentPickRateChartProps {
  agents: PlayerAgentStats[];
  title?: string;
  description?: string;
  maxAgents?: number;
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

export function AgentPickRateChart({
  agents,
  title = 'Agent Pool',
  description = 'Pick rate by agent (color shows win rate)',
  maxAgents = 5,
}: AgentPickRateChartProps) {
  // Sort by pick rate and take top N with null checks
  const topAgents = [...agents]
    .sort((a, b) => (b.pick_rate ?? 0) - (a.pick_rate ?? 0))
    .slice(0, maxAgents);

  const chartData = topAgents.map((agent) => {
    const pickRate = agent.pick_rate ?? 0;
    const winRate = agent.win_rate ?? 0;
    const avgAcs = agent.avg_acs ?? 0;

    return {
      agent: agent.agent,
      pick_rate: pickRate,
      win_rate: winRate,
      avg_acs: avgAcs,
      games_played: agent.games_played ?? 0,
      rounds_played: agent.rounds_played ?? 0,
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
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <BarChart
          data={chartData}
          accessibilityLayer
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="agent"
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
                        {data.agent}
                      </span>
                      <span className="text-sm">
                        {data.pick_rate}% pick rate
                      </span>
                      <span className="text-sm">
                        {data.win_rate}% win rate
                      </span>
                      <span className="text-sm">
                        {Math.round(data.avg_acs)} avg ACS
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
            dataKey="pick_rate"
            radius={[6, 6, 0, 0]}
            barSize={60}
          >
            <LabelList dataKey="pick_rate" content={renderLabel} />
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

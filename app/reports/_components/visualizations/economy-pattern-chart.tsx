'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, LabelList } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { EconomyPattern } from '@/app/lib/analytics/types';

const chartConfig = {
  occurrences: {
    label: 'Rounds',
    color: 'hsl(var(--chart-1))',
  },
};

// Display labels for economy types
const economyLabels: Record<string, string> = {
  eco: 'Eco',
  half_buy: 'Half Buy',
  force_buy: 'Force Buy',
  full_buy: 'Full Buy',
};

interface EconomyPatternChartProps {
  patterns: EconomyPattern[];
  title?: string;
}

// Custom label for win rate
const renderWinRateLabel = (props: any) => {
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

export function EconomyPatternChart({
  patterns,
  title = 'Economy Management',
}: EconomyPatternChartProps) {
  // Order: eco -> half_buy -> force_buy -> full_buy
  const order = ['eco', 'half_buy', 'force_buy', 'full_buy'];
  const sortedPatterns = [...patterns].sort(
    (a, b) => order.indexOf(a.economy_type) - order.indexOf(b.economy_type)
  );

  const chartData = sortedPatterns.map((pattern) => {
    const occurrences = Number(pattern.occurrences ?? 0); // BIGINT comes as string
    const winRate = pattern.win_rate ?? 0;
    const avgLoadoutValue = pattern.avg_loadout_value ?? 0;

    return {
      economy_type: economyLabels[pattern.economy_type] ?? pattern.economy_type,
      occurrences,
      win_rate: winRate,
      avg_loadout_value: avgLoadoutValue,
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
        <p className="text-muted-foreground">No economy data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Round frequency by economy type (color shows win rate)
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
            dataKey="economy_type"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 13, fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            label={{ value: 'Rounds', angle: -90, position: 'insideLeft' }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const data = props.payload;
                  return [
                    <span key="tooltip" className="flex flex-col gap-1">
                      <span className="font-semibold text-base">
                        {data.economy_type}
                      </span>
                      <span className="text-sm">
                        {data.occurrences} rounds
                      </span>
                      <span className="text-sm">
                        {data.win_rate}% win rate
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Avg loadout: ${Math.round(data.avg_loadout_value).toLocaleString()}
                      </span>
                    </span>,
                    '',
                  ];
                }}
              />
            }
          />
          <Bar
            dataKey="occurrences"
            radius={[6, 6, 0, 0]}
            barSize={60}
          >
            <LabelList dataKey="win_rate" content={renderWinRateLabel} />
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

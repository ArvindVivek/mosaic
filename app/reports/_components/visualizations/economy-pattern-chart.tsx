'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { EconomyPattern } from '@/app/lib/analytics/types';

const chartConfig = {
  occurrences: {
    label: 'Rounds',
    color: 'hsl(var(--chart-1))',
  },
  win_rate: {
    label: 'Win Rate',
    color: 'hsl(var(--chart-2))',
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

export function EconomyPatternChart({
  patterns,
  title = 'Economy Management',
}: EconomyPatternChartProps) {
  // Order: eco -> half_buy -> force_buy -> full_buy
  const order = ['eco', 'half_buy', 'force_buy', 'full_buy'];
  const sortedPatterns = [...patterns].sort(
    (a, b) => order.indexOf(a.economy_type) - order.indexOf(b.economy_type)
  );

  const chartData = sortedPatterns.map((pattern) => ({
    economy_type: economyLabels[pattern.economy_type] ?? pattern.economy_type,
    occurrences: Number(pattern.occurrences), // BIGINT comes as string
    win_rate: pattern.win_rate,
    avg_loadout_value: pattern.avg_loadout_value,
  }));

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
          Round frequency and win rate by economy type
        </p>
      </div>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="economy_type"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
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
                  const data = props.payload;
                  if (name === 'occurrences') {
                    return [
                      <span key="rounds">
                        {value} rounds
                        <br />
                        <span className="text-xs text-muted-foreground">
                          Avg loadout: ${Math.round(data.avg_loadout_value).toLocaleString()}
                        </span>
                      </span>,
                      'Frequency',
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
            dataKey="occurrences"
            fill="var(--color-occurrences)"
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
    </div>
  );
}

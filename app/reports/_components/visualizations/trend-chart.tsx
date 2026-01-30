'use client';

import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface TrendDataPoint {
  date: string; // ISO date string
  value: number;
  label?: string;
}

export interface TrendSeries {
  id: string;
  name: string;
  data: TrendDataPoint[];
  color?: string;
  yAxisId?: 'left' | 'right';
}

interface TrendChartProps {
  title: string;
  description?: string;
  series: TrendSeries[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  className?: string;
}

// Chart config for shadcn/ui
const chartConfig = {
  primary: {
    label: 'Primary',
    color: 'hsl(var(--chart-1))',
  },
  secondary: {
    label: 'Secondary',
    color: 'hsl(var(--chart-2))',
  },
  tertiary: {
    label: 'Tertiary',
    color: 'hsl(var(--chart-3))',
  },
};

export function TrendChart({
  title,
  description,
  series,
  leftAxisLabel,
  rightAxisLabel,
  className,
}: TrendChartProps) {
  // Combine all series data into unified data points
  const allDates = new Set<string>();
  series.forEach((s) => s.data.forEach((d) => allDates.add(d.date)));
  const sortedDates = Array.from(allDates).sort();

  // Build chart data with all series values per date
  const chartData = sortedDates.map((date) => {
    const point: Record<string, string | number> = { date };
    series.forEach((s) => {
      const dataPoint = s.data.find((d) => d.date === date);
      point[s.id] = dataPoint?.value ?? 0;
    });
    return point;
  });

  // Empty state
  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No trend data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we need dual Y-axes
  const hasRightAxis = series.some((s) => s.yAxisId === 'right');

  // Color palette
  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: hasRightAxis ? 60 : 20, left: 20, bottom: 5 }}
              accessibilityLayer
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={
                  leftAxisLabel
                    ? {
                        value: leftAxisLabel,
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 11 },
                      }
                    : undefined
                }
              />

              {hasRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  label={
                    rightAxisLabel
                      ? {
                          value: rightAxisLabel,
                          angle: 90,
                          position: 'insideRight',
                          style: { textAnchor: 'middle', fontSize: 11 },
                        }
                      : undefined
                  }
                />
              )}

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                }
              />

              <Legend />

              {series.map((s, i) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.name}
                  yAxisId={s.yAxisId || 'left'}
                  stroke={s.color || colors[i % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

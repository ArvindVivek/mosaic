'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  comparison?: {
    value: number; // percentage change (positive = good, negative = bad)
    label: string; // "vs average" or "vs last period"
  };
  description?: string;
  invertTrend?: boolean; // for metrics where lower is better
}

export function StatCard({ title, value, comparison, description, invertTrend = false }: StatCardProps) {
  const getTrendIcon = () => {
    if (!comparison) return null;
    if (comparison.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (comparison.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendVariant = (): 'default' | 'destructive' | 'secondary' => {
    if (!comparison) return 'secondary';
    const isPositive = invertTrend ? comparison.value < 0 : comparison.value > 0;
    const isNegative = invertTrend ? comparison.value > 0 : comparison.value < 0;
    return isPositive ? 'default' : isNegative ? 'destructive' : 'secondary';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {comparison && (
          <Badge variant={getTrendVariant()} className="gap-1">
            {getTrendIcon()}
            {Math.abs(comparison.value).toFixed(1)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {comparison && (
          <p className="text-xs text-muted-foreground mt-1">{comparison.label}</p>
        )}
      </CardContent>
    </Card>
  );
}

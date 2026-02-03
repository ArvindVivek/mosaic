'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Zap, Shield, Target, Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StatCardProps {
  title: string;
  value: string | number;
  comparison?: {
    value: number; // percentage change (positive = good, negative = bad)
    label: string; // "vs average" or "vs last period"
  };
  description?: string;
  invertTrend?: boolean; // for metrics where lower is better
  variant?: 'default' | 'duelist' | 'controller' | 'initiator' | 'sentinel';
  highlight?: boolean; // Add spotlight effect for important stats
  icon?: 'zap' | 'shield' | 'target' | 'activity';
  tooltip?: string; // Tooltip text explaining the metric
}

export function StatCard({
  title,
  value,
  comparison,
  description,
  invertTrend = false,
  variant = 'default',
  highlight = false,
  icon,
  tooltip
}: StatCardProps) {
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

  const getVariantStyles = () => {
    const styles = {
      default: {
        border: 'border-border',
        gradient: 'from-background to-background',
        glow: '',
        accent: 'text-foreground'
      },
      duelist: {
        border: 'border-role-duelist/30',
        gradient: 'from-role-duelist/5 via-background to-background',
        glow: 'hover-glow-duelist',
        accent: 'text-role-duelist'
      },
      controller: {
        border: 'border-role-controller/30',
        gradient: 'from-role-controller/5 via-background to-background',
        glow: 'hover-glow-controller',
        accent: 'text-role-controller'
      },
      initiator: {
        border: 'border-role-initiator/30',
        gradient: 'from-role-initiator/5 via-background to-background',
        glow: 'hover-glow-initiator',
        accent: 'text-role-initiator'
      },
      sentinel: {
        border: 'border-role-sentinel/30',
        gradient: 'from-role-sentinel/5 via-background to-background',
        glow: 'hover-glow-sentinel',
        accent: 'text-role-sentinel'
      }
    };
    return styles[variant];
  };

  const getStatIcon = () => {
    if (!icon) return null;
    const iconClass = cn('h-4 w-4', getVariantStyles().accent);
    switch (icon) {
      case 'zap':
        return <Zap className={iconClass} />;
      case 'shield':
        return <Shield className={iconClass} />;
      case 'target':
        return <Target className={iconClass} />;
      case 'activity':
        return <Activity className={iconClass} />;
      default:
        return null;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:-translate-y-1',
        'bg-gradient-to-br',
        variantStyles.gradient,
        variantStyles.border,
        variantStyles.glow,
        highlight && 'spotlight',
        'group'
      )}
    >
      {/* Corner accents */}
      <div className={cn(
        'absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 opacity-30 transition-opacity duration-300 group-hover:opacity-60',
        variantStyles.border
      )} />
      <div className={cn(
        'absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 opacity-30 transition-opacity duration-300 group-hover:opacity-60',
        variantStyles.border
      )} />

      {/* Scanline effect on hover */}
      {variant !== 'default' && (
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'scanline pointer-events-none'
        )} />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {getStatIcon()}
          <CardTitle className={cn(
            'text-sm font-medium tracking-tight',
            variant !== 'default' && 'gaming-underline'
          )}>
            {title}
          </CardTitle>
          {tooltip && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center justify-center">
                  <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-w-xs text-sm" side="top">
                {tooltip}
              </PopoverContent>
            </Popover>
          )}
        </div>
        {comparison && (
          <Badge
            variant={getTrendVariant()}
            className={cn(
              'gap-1 backdrop-blur-sm',
              'transition-all duration-300 group-hover:scale-105'
            )}
          >
            {getTrendIcon()}
            {Math.abs(comparison.value).toFixed(1)}%
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn(
          'text-3xl font-bold tracking-tight',
          variant !== 'default' && variantStyles.accent,
          'transition-all duration-300 group-hover:scale-105'
        )}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {description}
          </p>
        )}
        {comparison && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {comparison.label}
          </p>
        )}

        {/* Energy bar decoration for non-default variants */}
        {variant !== 'default' && (
          <div className="mt-3 h-1 rounded-full bg-muted/30 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full energy-bar',
                variant === 'duelist' && 'bg-role-duelist',
                variant === 'controller' && 'bg-role-controller',
                variant === 'initiator' && 'bg-role-initiator',
                variant === 'sentinel' && 'bg-role-sentinel'
              )}
              style={{
                width: comparison
                  ? `${Math.min(Math.abs(comparison.value) + 50, 100)}%`
                  : '75%'
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized stat card variants for quick use
export function DuelistStatCard(props: Omit<StatCardProps, 'variant'>) {
  return <StatCard {...props} variant="duelist" icon="zap" />;
}

export function ControllerStatCard(props: Omit<StatCardProps, 'variant'>) {
  return <StatCard {...props} variant="controller" icon="activity" />;
}

export function InitiatorStatCard(props: Omit<StatCardProps, 'variant'>) {
  return <StatCard {...props} variant="initiator" icon="target" />;
}

export function SentinelStatCard(props: Omit<StatCardProps, 'variant'>) {
  return <StatCard {...props} variant="sentinel" icon="shield" />;
}

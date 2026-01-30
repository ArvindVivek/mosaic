'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SitePreferenceChart } from '../visualizations/site-preference-chart';
import { EconomyPatternChart } from '../visualizations/economy-pattern-chart';
import type { TeamStrategiesSummary, PistolPattern } from '@/app/lib/analytics/types';

interface StrategiesSectionProps {
  strategies: TeamStrategiesSummary;
}

// Display labels for pistol pattern types
const pistolLabels: Record<string, string> = {
  fast_execute: 'Fast Execute',
  default: 'Default Setup',
  no_plant: 'No Plant',
};

export function StrategiesSection({ strategies }: StrategiesSectionProps) {
  const { pistol_patterns, economy_patterns, site_preferences } = strategies;

  return (
    <div className="space-y-8">
      {/* Pistol Round Patterns */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pistol Round Patterns</h3>
        {pistol_patterns.length === 0 ? (
          <EmptyState message="No pistol pattern data available" />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {pistol_patterns.map((pattern) => (
              <PistolPatternCard key={pattern.pattern_type} pattern={pattern} />
            ))}
          </div>
        )}
      </div>

      {/* Economy Management */}
      <div>
        <EconomyPatternChart patterns={economy_patterns} />
      </div>

      {/* Site Attack Preferences */}
      <div>
        <SitePreferenceChart sitePrefs={site_preferences} />
      </div>
    </div>
  );
}

function PistolPatternCard({ pattern }: { pattern: PistolPattern }) {
  const label = pistolLabels[pattern.pattern_type] ?? pattern.pattern_type;
  const isHighWinRate = pattern.win_rate >= 55;
  const isLowWinRate = pattern.win_rate < 40;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{label}</CardTitle>
          <Badge
            variant={isHighWinRate ? 'default' : isLowWinRate ? 'destructive' : 'secondary'}
          >
            {pattern.win_rate}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Occurrences</span>
            <span className="font-medium">{pattern.occurrences}</span>
          </div>
          {pattern.avg_plant_time !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Plant Time</span>
              <span className="font-medium">{pattern.avg_plant_time.toFixed(1)}s</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[150px] border rounded-lg bg-muted/10">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

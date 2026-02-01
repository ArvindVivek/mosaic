'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, DollarSign, Crosshair } from 'lucide-react';
import type { TeamStrategiesSummary, PistolPattern, EconomyPattern, SitePreference } from '@/app/lib/analytics/types';

interface StrategiesSectionProps {
  strategies: TeamStrategiesSummary;
}

// Display labels for pistol pattern types
const pistolLabels: Record<string, string> = {
  fast_execute: 'Fast Execute',
  default: 'Default Setup',
  no_plant: 'No Plant',
};

// Display labels for economy types
const economyLabels: Record<string, string> = {
  eco: 'Eco',
  half_buy: 'Half Buy',
  force_buy: 'Force Buy',
  full_buy: 'Full Buy',
};

export function StrategiesSection({ strategies }: StrategiesSectionProps) {
  const { pistol_patterns, economy_patterns, site_preferences } = strategies;

  // Filter out "unknown" site values and invalid data
  const validSitePrefs = site_preferences.filter(
    (s) => s.site && s.site.toLowerCase() !== 'unknown' && s.attacks > 0
  );

  // Group site preferences by map
  const sitesByMap = validSitePrefs.reduce((acc, pref) => {
    const map = pref.map_name;
    if (!acc[map]) acc[map] = [];
    acc[map].push(pref);
    return acc;
  }, {} as Record<string, SitePreference[]>);

  return (
    <div className="space-y-8">
      {/* Pistol Round Patterns */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Crosshair className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Pistol Round Patterns</h3>
        </div>
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

      {/* Economy Management - Table format instead of bar graph */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Economy Management</h3>
        </div>
        {economy_patterns.length === 0 ? (
          <EmptyState message="No economy data available" />
        ) : (
          <EconomyTable patterns={economy_patterns} />
        )}
      </div>

      {/* Site Preferences - Grouped by map */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Site Attack Preferences</h3>
        </div>
        {Object.keys(sitesByMap).length === 0 ? (
          <EmptyState message="No site preference data available" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(sitesByMap).map(([mapName, prefs]) => (
              <MapSiteCard key={mapName} mapName={mapName} sitePrefs={prefs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PistolPatternCard({ pattern }: { pattern: PistolPattern }) {
  const label = pistolLabels[pattern.pattern_type] ?? pattern.pattern_type;
  const winRate = pattern.win_rate ?? 0;
  const occurrences = pattern.occurrences ?? 0;
  const avgPlantTime = pattern.avg_plant_time;

  const isHighWinRate = winRate >= 55;
  const isLowWinRate = winRate < 40;

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 left-0 h-1 w-full"
        style={{
          background: isHighWinRate
            ? 'hsl(142, 76%, 36%)'
            : isLowWinRate
            ? 'hsl(0, 84%, 60%)'
            : 'hsl(var(--primary))'
        }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{label}</CardTitle>
          <Badge
            variant={isHighWinRate ? 'default' : isLowWinRate ? 'destructive' : 'secondary'}
          >
            {winRate}% WR
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Times Used</span>
            <span className="font-semibold">{occurrences}</span>
          </div>
          {avgPlantTime !== null && avgPlantTime !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Avg Plant Time</span>
              <span className="font-semibold">{avgPlantTime.toFixed(1)}s</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EconomyTable({ patterns }: { patterns: EconomyPattern[] }) {
  // Sort by occurrences descending
  const sorted = [...patterns].sort((a, b) => (b.occurrences ?? 0) - (a.occurrences ?? 0));
  const totalRounds = sorted.reduce((sum, p) => sum + (p.occurrences ?? 0), 0);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 font-medium">Round Type</th>
                <th className="text-right py-3 px-4 font-medium">Rounds</th>
                <th className="text-right py-3 px-4 font-medium">Frequency</th>
                <th className="text-right py-3 px-4 font-medium">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pattern) => {
                const label = economyLabels[pattern.economy_type] ?? pattern.economy_type;
                const freq = totalRounds > 0
                  ? Math.round((pattern.occurrences / totalRounds) * 100)
                  : 0;
                const winRate = pattern.win_rate ?? 0;
                const isHighWinRate = winRate >= 55;
                const isLowWinRate = winRate < 40;

                return (
                  <tr key={pattern.economy_type} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{label}</td>
                    <td className="text-right py-3 px-4">{pattern.occurrences}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground">{freq}%</td>
                    <td className="text-right py-3 px-4">
                      <Badge
                        variant={isHighWinRate ? 'default' : isLowWinRate ? 'destructive' : 'secondary'}
                        className="w-16 justify-center"
                      >
                        {winRate}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function MapSiteCard({ mapName, sitePrefs }: { mapName: string; sitePrefs: SitePreference[] }) {
  // Sort by preference percentage descending
  const sorted = [...sitePrefs].sort((a, b) => (b.preference_pct ?? 0) - (a.preference_pct ?? 0));
  const totalAttacks = sorted.reduce((sum, s) => sum + (s.attacks ?? 0), 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base capitalize">{mapName}</CardTitle>
        <p className="text-xs text-muted-foreground">{totalAttacks} total attacks</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((pref) => {
          const prefPct = pref.preference_pct ?? 0;
          const winRate = pref.win_rate ?? 0;
          const isHighWinRate = winRate >= 55;
          const isLowWinRate = winRate < 40;

          return (
            <div key={pref.site} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">{pref.site} Site</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{prefPct}%</span>
                  <Badge
                    variant={isHighWinRate ? 'default' : isLowWinRate ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {winRate}% WR
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${prefPct}%`,
                    background: isHighWinRate
                      ? 'hsl(142, 76%, 36%)'
                      : isLowWinRate
                      ? 'hsl(0, 84%, 60%)'
                      : 'hsl(var(--primary))'
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {pref.attacks} attacks
              </p>
            </div>
          );
        })}
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

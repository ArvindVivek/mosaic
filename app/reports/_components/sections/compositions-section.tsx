'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompositionFrequencyChart } from '../visualizations/composition-frequency-chart';
import type { CompositionStats } from '@/app/lib/analytics/types';

interface CompositionsSectionProps {
  compositions: CompositionStats[];
}

export function CompositionsSection({ compositions }: CompositionsSectionProps) {
  if (compositions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No composition data available</p>
      </div>
    );
  }

  // Sort by usage (games_played) descending with null checks
  const sortedComps = [...compositions].sort((a, b) => (b.games_played ?? 0) - (a.games_played ?? 0));

  return (
    <div className="space-y-8">
      {/* Composition Usage Chart */}
      <CompositionFrequencyChart compositions={sortedComps} />

      {/* Composition Details Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Composition Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {sortedComps.slice(0, 6).map((comp, index) => (
            <CompositionCard key={index} comp={comp} rank={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CompositionCardProps {
  comp: CompositionStats;
  rank: number;
}

function CompositionCard({ comp, rank }: CompositionCardProps) {
  const winRate = comp.win_rate ?? 0;
  const gamesPlayed = comp.games_played ?? 0;
  const winCount = comp.win_count ?? 0;
  const composition = comp.composition ?? [];
  const mapsPlayed = comp.maps_played ?? [];

  const winRateColor =
    winRate >= 60
      ? 'text-green-600'
      : winRate < 40
      ? 'text-red-500'
      : '';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Composition #{rank}</CardTitle>
          <Badge variant={winRate >= 50 ? 'default' : 'secondary'}>
            {winRate}% WR
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Agent List */}
        <div className="flex flex-wrap gap-1">
          {composition.map((agent) => (
            <Badge key={agent} variant="outline" className="text-xs">
              {agent}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <div className="font-semibold">{gamesPlayed}</div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
          <div>
            <div className={`font-semibold ${winRateColor}`}>{winCount}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div>
            <div className="font-semibold">{gamesPlayed - winCount}</div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
        </div>

        {/* Maps Played */}
        {mapsPlayed.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Maps Played</div>
            <div className="flex flex-wrap gap-1">
              {mapsPlayed.map((map) => (
                <Badge key={map} variant="secondary" className="text-xs">
                  {map}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

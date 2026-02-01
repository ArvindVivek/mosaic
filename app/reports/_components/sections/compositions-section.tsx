'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { StatCard } from '../visualizations/stat-card';
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

  // Sort by win rate descending (primary), then by games played (secondary for ties)
  const sortedByWinRate = [...compositions]
    .filter(c => (c.games_played ?? 0) >= 2) // Only show comps with at least 2 games
    .sort((a, b) => {
      const winRateDiff = (b.win_rate ?? 0) - (a.win_rate ?? 0);
      if (winRateDiff !== 0) return winRateDiff;
      return (b.games_played ?? 0) - (a.games_played ?? 0);
    });

  // Separate into tiers based on win rate
  const strongComps = sortedByWinRate.filter(c => (c.win_rate ?? 0) >= 55);
  const neutralComps = sortedByWinRate.filter(c => (c.win_rate ?? 0) >= 40 && (c.win_rate ?? 0) < 55);
  const weakComps = sortedByWinRate.filter(c => (c.win_rate ?? 0) < 40);

  // Calculate totals
  const totalGames = compositions.reduce((sum, c) => sum + (c.games_played ?? 0), 0);
  const totalWins = compositions.reduce((sum, c) => sum + (c.win_count ?? 0), 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Compositions"
          value={compositions.length}
          description="Unique lineups used"
        />
        <StatCard
          title="Total Games"
          value={totalGames}
          description={`${totalWins}W - ${totalGames - totalWins}L`}
        />
        <StatCard
          title="Overall Win Rate"
          value={`${overallWinRate}%`}
        />
        <StatCard
          title="Best Composition"
          value={`${sortedByWinRate[0]?.win_rate ?? 0}% WR`}
          description={`${sortedByWinRate[0]?.games_played ?? 0} games`}
        />
      </div>

      {/* Strong Compositions */}
      {strongComps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">Strong Compositions</h3>
            <Badge variant="default" className="ml-2">{strongComps.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strongComps.slice(0, 6).map((comp, index) => (
              <CompositionCard key={index} comp={comp} tier="strong" />
            ))}
          </div>
        </div>
      )}

      {/* Neutral Compositions */}
      {neutralComps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Neutral Compositions</h3>
            <Badge variant="secondary" className="ml-2">{neutralComps.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {neutralComps.slice(0, 6).map((comp, index) => (
              <CompositionCard key={index} comp={comp} tier="neutral" />
            ))}
          </div>
        </div>
      )}

      {/* Weak Compositions */}
      {weakComps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Struggling Compositions</h3>
            <Badge variant="destructive" className="ml-2">{weakComps.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weakComps.slice(0, 6).map((comp, index) => (
              <CompositionCard key={index} comp={comp} tier="weak" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface CompositionCardProps {
  comp: CompositionStats;
  tier: 'strong' | 'neutral' | 'weak';
}

function CompositionCard({ comp, tier }: CompositionCardProps) {
  const winRate = comp.win_rate ?? 0;
  const gamesPlayed = comp.games_played ?? 0;
  const winCount = comp.win_count ?? 0;
  const composition = comp.composition ?? [];
  const mapsPlayed = comp.maps_played ?? [];

  const borderColor = tier === 'strong'
    ? 'border-l-green-500'
    : tier === 'weak'
    ? 'border-l-red-500'
    : 'border-l-gray-300';

  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge
            variant={tier === 'strong' ? 'default' : tier === 'weak' ? 'destructive' : 'secondary'}
            className="text-sm"
          >
            {winRate}% WR
          </Badge>
          <span className="text-sm text-muted-foreground">
            {winCount}W - {gamesPlayed - winCount}L
          </span>
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

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{gamesPlayed} games played</span>
        </div>

        {/* Maps Played */}
        {mapsPlayed.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">Maps</div>
            <div className="flex flex-wrap gap-1">
              {mapsPlayed.map((map) => (
                <Badge key={map} variant="secondary" className="text-xs capitalize">
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

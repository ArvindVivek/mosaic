'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapWinRateChart } from '../visualizations/map-win-rate-chart';
import { StatCard } from '../visualizations/stat-card';
import type { MapWinRate } from '@/app/lib/analytics/types';

interface MapsSectionProps {
  maps: MapWinRate[];
}

export function MapsSection({ maps }: MapsSectionProps) {
  if (maps.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No map data available</p>
      </div>
    );
  }

  // Sort by win rate for analysis
  const sortedMaps = [...maps].sort((a, b) => b.win_rate - a.win_rate);

  // Identify strengths and weaknesses
  const strengths = sortedMaps.filter((m) => m.win_rate >= 60);
  const weaknesses = sortedMaps.filter((m) => m.win_rate < 40);

  // Overall stats
  const totalGames = maps.reduce((sum, m) => sum + (m.games_played ?? 0), 0);
  const totalWins = maps.reduce((sum, m) => sum + (m.wins ?? 0), 0);
  const avgRoundsWon = totalGames > 0
    ? maps.reduce((sum, m) => sum + (m.avg_rounds_won ?? 0) * (m.games_played ?? 0), 0) / totalGames
    : 0;
  const avgRoundsLost = totalGames > 0
    ? maps.reduce((sum, m) => sum + (m.avg_rounds_lost ?? 0) * (m.games_played ?? 0), 0) / totalGames
    : 0;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Maps Played"
          value={maps.length}
          description="Active map pool"
        />
        <StatCard
          title="Total Games"
          value={totalGames}
          description={`${totalWins}W - ${totalGames - totalWins}L`}
        />
        <StatCard
          title="Avg Rounds Won"
          value={avgRoundsWon.toFixed(1)}
          description="Per game"
        />
        <StatCard
          title="Avg Rounds Lost"
          value={avgRoundsLost.toFixed(1)}
          description="Per game"
        />
      </div>

      {/* Win Rate Chart */}
      <MapWinRateChart maps={maps} />

      {/* Strengths and Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Map Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No maps with 60%+ win rate
              </p>
            ) : (
              <div className="space-y-2">
                {strengths.map((map) => (
                  <MapStrengthRow key={map.map_name} map={map} type="strength" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Map Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No maps with &lt;40% win rate
              </p>
            ) : (
              <div className="space-y-2">
                {weaknesses.map((map) => (
                  <MapStrengthRow key={map.map_name} map={map} type="weakness" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Map Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Map Details</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedMaps.map((map) => (
            <MapDetailCard key={map.map_name} map={map} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MapStrengthRow({
  map,
  type,
}: {
  map: MapWinRate;
  type: 'strength' | 'weakness';
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="font-medium">{map.map_name}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {map.wins}W - {map.losses}L
        </span>
        <Badge variant={type === 'strength' ? 'default' : 'destructive'}>
          {map.win_rate}%
        </Badge>
      </div>
    </div>
  );
}

function MapDetailCard({ map }: { map: MapWinRate }) {
  const winRateColor =
    map.win_rate >= 60
      ? 'text-green-600'
      : map.win_rate < 40
      ? 'text-red-500'
      : '';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{map.map_name}</CardTitle>
          <Badge
            variant={
              map.win_rate >= 60
                ? 'default'
                : map.win_rate < 40
                ? 'destructive'
                : 'secondary'
            }
          >
            {map.win_rate}% WR
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Record</div>
            <div className="font-semibold">
              {map.wins}W - {map.losses}L
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Games</div>
            <div className="font-semibold">{map.games_played}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Rounds Won</div>
            <div className="font-semibold">{(map.avg_rounds_won ?? 0).toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Rounds Lost</div>
            <div className="font-semibold">{(map.avg_rounds_lost ?? 0).toFixed(1)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

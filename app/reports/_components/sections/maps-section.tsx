'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapWinRateChart } from '../visualizations/map-win-rate-chart';
import { StatCard } from '../visualizations/stat-card';
import type { MapWinRate } from '@/app/lib/analytics/types';
import { formatMapName } from '@/lib/format';
import { getMapImage, hasMapImage, getMapGradient } from '@/lib/valorant-assets';
import { Map as MapIcon, Trophy, AlertTriangle } from 'lucide-react';

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
  const sortedMaps = [...maps].sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0));

  // Identify strengths and weaknesses
  const strengths = sortedMaps.filter((m) => (m.win_rate ?? 0) >= 60);
  const weaknesses = sortedMaps.filter((m) => (m.win_rate ?? 0) < 40);

  // Helper to get games played - fallback to wins + losses if games_played is 0
  const getGamesPlayed = (m: MapWinRate) => {
    const gp = m.games_played ?? 0;
    if (gp > 0) return gp;
    return (m.wins ?? 0) + (m.losses ?? 0);
  };

  // Overall stats with comprehensive null checks
  const totalGames = maps.reduce((sum, m) => sum + getGamesPlayed(m), 0);
  const totalWins = maps.reduce((sum, m) => sum + (m.wins ?? 0), 0);
  const avgRoundsWon = totalGames > 0
    ? maps.reduce((sum, m) => sum + (m.avg_rounds_won ?? 0) * getGamesPlayed(m), 0) / totalGames
    : 0;
  const avgRoundsLost = totalGames > 0
    ? maps.reduce((sum, m) => sum + (m.avg_rounds_lost ?? 0) * getGamesPlayed(m), 0) / totalGames
    : 0;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-1 w-12 bg-gradient-to-r from-valorant-red to-valorant-gold rounded-full"></div>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MapIcon className="h-6 w-6 text-valorant-red" />
          Map Pool Analysis
        </h3>
      </div>

      {/* Overview Stats */}
      <div className={`grid gap-4 ${avgRoundsWon > 0 ? 'md:grid-cols-4' : 'md:grid-cols-2'} animate-fade-in`}>
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
        {avgRoundsWon > 0 && (
          <StatCard
            title="Avg Rounds Won"
            value={avgRoundsWon.toFixed(1)}
            description="Per game"
          />
        )}
        {avgRoundsLost > 0 && (
          <StatCard
            title="Avg Rounds Lost"
            value={avgRoundsLost.toFixed(1)}
            description="Per game"
          />
        )}
      </div>

      {/* Win Rate Chart */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <MapWinRateChart maps={maps} />
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        {/* Strengths */}
        <Card className="border-valorant-red/20 card-hover">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-valorant-red" />
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
        <Card className="border-valorant-gold/20 card-hover">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Areas to Improve
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

      {/* Detailed Map Cards with Images */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
        <h3 className="text-lg font-semibold mb-4">Detailed Map Performance</h3>
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
  const winRate = map.win_rate ?? 0;

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md border-l-2 transition-all duration-200 hover:bg-muted/30 border-l-transparent hover:border-l-valorant-red">
      <span className="font-medium">{formatMapName(map.map_name)}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-mono">
          {map.wins ?? 0}W - {map.losses ?? 0}L
        </span>
        <Badge
          variant={type === 'strength' ? 'default' : 'destructive'}
          className={type === 'strength' ? 'bg-valorant-red hover:bg-valorant-red/90' : ''}
        >
          {winRate}%
        </Badge>
      </div>
    </div>
  );
}

function MapDetailCard({ map }: { map: MapWinRate }) {
  const winRate = map.win_rate ?? 0;
  const wins = map.wins ?? 0;
  const losses = map.losses ?? 0;
  const gamesPlayed = (map.games_played ?? 0) > 0 ? map.games_played : wins + losses;
  const mapImage = getMapImage(map.map_name);
  const hasImage = hasMapImage(map.map_name);
  const gradientClass = getMapGradient(map.map_name);

  return (
    <Card className="card-hover overflow-hidden group relative">
      {/* Map Image/Background */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-valorant-dark to-valorant-darker">
        {hasImage && mapImage ? (
          <>
            <Image
              src={mapImage}
              alt={formatMapName(map.map_name)}
              fill
              className="object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
        )}

        {/* Map Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {formatMapName(map.map_name)}
          </h3>
        </div>

        {/* Win Rate Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={
              winRate >= 60
                ? 'default'
                : winRate < 40
                ? 'destructive'
                : 'secondary'
            }
            className={`${
              winRate >= 60 ? 'bg-valorant-red hover:bg-valorant-red/90' : ''
            } font-bold shadow-lg`}
          >
            {winRate}% WR
          </Badge>
        </div>
      </div>

      {/* Stats Content */}
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Record</div>
            <div className="font-bold text-lg">
              <span className="text-valorant-red">{wins}</span>
              <span className="text-muted-foreground mx-1">-</span>
              <span className="text-muted-foreground">{losses}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground text-xs">Games</div>
            <div className="font-bold text-lg">{gamesPlayed}</div>
          </div>
          {(map.avg_rounds_won ?? 0) > 0 && (
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Avg Rounds Won</div>
              <div className="font-semibold">{(map.avg_rounds_won ?? 0).toFixed(1)}</div>
            </div>
          )}
          {(map.avg_rounds_lost ?? 0) > 0 && (
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Avg Rounds Lost</div>
              <div className="font-semibold">{(map.avg_rounds_lost ?? 0).toFixed(1)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

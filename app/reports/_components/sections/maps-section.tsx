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
      <h3 className="text-xl font-bold flex items-center gap-2">
        <MapIcon className="h-6 w-6 text-valorant-red" />
        Map Pool Analysis
        <div className="h-0.5 flex-1 bg-gradient-to-r from-valorant-red/50 to-transparent rounded-full ml-2"></div>
      </h3>

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

  // Determine border color based on win rate
  const borderColor = winRate >= 60 ? 'border-green-500/50' : winRate < 40 ? 'border-red-500/50' : 'border-border';

  return (
    <Card className={`card-hover overflow-hidden group relative border-2 ${borderColor}`}>
      {/* Full-size Map Image Background */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {hasImage && mapImage ? (
          <>
            <Image
              src={mapImage}
              alt={formatMapName(map.map_name)}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`}></div>
        )}

        {/* Content overlaid on image */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top: Win Rate Badge */}
          <div className="flex justify-between items-start">
            <Badge
              variant="outline"
              className="bg-black/60 border-white/20 text-white backdrop-blur-sm text-xs"
            >
              {gamesPlayed} games
            </Badge>
            <Badge
              className={`${
                winRate >= 60
                  ? 'bg-green-500 hover:bg-green-600'
                  : winRate < 40
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-yellow-500 hover:bg-yellow-600'
              } text-white font-bold shadow-lg text-sm px-3`}
            >
              {winRate}%
            </Badge>
          </div>

          {/* Bottom: Map name and stats */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white drop-shadow-lg tracking-tight">
              {formatMapName(map.map_name)}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-md px-3 py-1.5">
                <span className="text-green-400 font-bold text-lg">{wins}W</span>
                <span className="text-white/50">-</span>
                <span className="text-red-400 font-bold text-lg">{losses}L</span>
              </div>
              {(map.avg_rounds_won ?? 0) > 0 && (
                <div className="text-white/80 text-sm bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
                  <span className="text-white/60">Avg: </span>
                  <span className="font-semibold">{(map.avg_rounds_won ?? 0).toFixed(1)}</span>
                  <span className="text-white/60"> - </span>
                  <span className="font-semibold">{(map.avg_rounds_lost ?? 0).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

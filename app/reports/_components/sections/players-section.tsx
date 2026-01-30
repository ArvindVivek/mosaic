'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import type { TeamPlayerSummary } from '@/app/lib/analytics/types';

interface PlayersSectionProps {
  players: TeamPlayerSummary[];
}

export function PlayersSection({ players }: PlayersSectionProps) {
  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No player data available</p>
      </div>
    );
  }

  // Sort players by ACS descending
  const sortedPlayers = [...players].sort((a, b) => b.acs - a.acs);

  // Calculate team averages for comparison
  const avgACS = players.reduce((sum, p) => sum + p.acs, 0) / players.length;
  const avgKD = players.reduce((sum, p) => sum + p.kd_ratio, 0) / players.length;
  const avgKAST = players.reduce((sum, p) => sum + p.kast_pct, 0) / players.length;

  return (
    <div className="space-y-6">
      {/* Team Overview Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Player Rankings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Player</th>
                <th className="text-right py-3 px-4 font-medium">ACS</th>
                <th className="text-right py-3 px-4 font-medium">K/D</th>
                <th className="text-right py-3 px-4 font-medium">KAST</th>
                <th className="text-left py-3 px-4 font-medium">Top Agents</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.player_id}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-4">{index + 1}.</span>
                      <span className="font-medium">{player.player_name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <StatValue
                      value={Math.round(player.acs)}
                      average={avgACS}
                      higherIsBetter={true}
                    />
                  </td>
                  <td className="text-right py-3 px-4">
                    <StatValue
                      value={player.kd_ratio}
                      average={avgKD}
                      higherIsBetter={true}
                      decimals={2}
                    />
                  </td>
                  <td className="text-right py-3 px-4">
                    <StatValue
                      value={player.kast_pct}
                      average={avgKAST}
                      higherIsBetter={true}
                      suffix="%"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {player.top_agents.slice(0, 3).map((agent) => (
                        <Badge key={agent} variant="outline" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Player Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Player Details</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPlayers.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              avgACS={avgACS}
              avgKD={avgKD}
              avgKAST={avgKAST}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: TeamPlayerSummary;
  avgACS: number;
  avgKD: number;
  avgKAST: number;
}

function PlayerCard({ player, avgACS, avgKD, avgKAST }: PlayerCardProps) {
  const acsComparison = ((player.acs - avgACS) / avgACS) * 100;
  const kdComparison = ((player.kd_ratio - avgKD) / avgKD) * 100;
  const kastComparison = ((player.kast_pct - avgKAST) / avgKAST) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">{player.player_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold">{Math.round(player.acs)}</div>
            <div className="text-xs text-muted-foreground">ACS</div>
            <ComparisonBadge value={acsComparison} />
          </div>
          <div>
            <div className="text-2xl font-bold">{player.kd_ratio.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">K/D</div>
            <ComparisonBadge value={kdComparison} />
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(player.kast_pct)}%</div>
            <div className="text-xs text-muted-foreground">KAST</div>
            <ComparisonBadge value={kastComparison} />
          </div>
        </div>

        {/* Agent Pool */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">Agent Pool</div>
          <div className="flex gap-1 flex-wrap">
            {player.top_agents.map((agent, index) => (
              <Badge
                key={agent}
                variant={index === 0 ? 'default' : 'outline'}
                className="text-xs"
              >
                {agent}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatValue({
  value,
  average,
  higherIsBetter,
  decimals = 0,
  suffix = '',
}: {
  value: number;
  average: number;
  higherIsBetter: boolean;
  decimals?: number;
  suffix?: string;
}) {
  const isAboveAvg = higherIsBetter ? value > average : value < average;
  const formattedValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value);

  return (
    <span className={isAboveAvg ? 'text-green-600 font-medium' : ''}>
      {formattedValue}{suffix}
    </span>
  );
}

function ComparisonBadge({ value }: { value: number }) {
  if (Math.abs(value) < 5) return null;

  const isPositive = value > 0;
  return (
    <div className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
      {isPositive ? '+' : ''}{value.toFixed(0)}%
    </div>
  );
}

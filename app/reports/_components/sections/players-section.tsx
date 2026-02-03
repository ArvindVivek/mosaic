'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users, Target, Crosshair, Shield, Info } from 'lucide-react';
import type { TeamPlayerSummary } from '@/app/lib/analytics/types';
import { StatCard } from '../visualizations/stat-card';
import { AgentIcon, AgentGrid } from '../agent-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

  // Sort players by ACS descending with null checks
  const sortedPlayers = [...players].sort((a, b) => (b.acs ?? 0) - (a.acs ?? 0));

  // Calculate team averages for comparison with null checks
  const avgACS = players.reduce((sum, p) => sum + (p.acs ?? 0), 0) / players.length;
  const avgKD = players.reduce((sum, p) => sum + (p.kd_ratio ?? 0), 0) / players.length;
  const avgKAST = players.reduce((sum, p) => sum + (p.kast_pct ?? 0), 0) / players.length;

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
                <th className="text-right py-3 px-4 font-medium">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Mosaic ACS</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-muted/50 transition-colors">
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-sm" side="top">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Mosaic ACS Calculation</h4>
                          <p className="text-xs text-muted-foreground">
                            Average Combat Score per round, calculated as:
                          </p>
                          <div className="text-xs space-y-1 bg-muted/50 p-2 rounded font-mono">
                            <div><strong>Damage:</strong> 1 point per damage dealt</div>
                            <div><strong>Kills:</strong> 150/130/110/90/70 points (based on enemies alive)</div>
                            <div><strong>Multi-kills:</strong> +50 points per additional kill in round</div>
                            <div><strong>Assists:</strong> +25 points (non-damaging)</div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Formula: (Total Combat Score) ÷ (Total Rounds)
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </th>
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
                      value={Math.round(player.acs ?? 0)}
                      average={avgACS}
                      higherIsBetter={true}
                    />
                  </td>
                  <td className="text-right py-3 px-4">
                    <StatValue
                      value={player.kd_ratio ?? 0}
                      average={avgKD}
                      higherIsBetter={true}
                      decimals={2}
                    />
                  </td>
                  <td className="text-right py-3 px-4">
                    <StatValue
                      value={player.kast_pct ?? 0}
                      average={avgKAST}
                      higherIsBetter={true}
                      suffix="%"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <AgentGrid
                      agents={player.top_agents ?? []}
                      maxDisplay={3}
                      size="sm"
                      showNames={true}
                      showRoleBadges={false}
                    />
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

      {/* Team Performance Summary */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Team Performance Summary</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Team Avg Mosaic ACS"
            value={Math.round(avgACS)}
            description={`Across ${players.length} players`}
            tooltip="Mosaic Average Combat Score measures player impact per round. Formula: (Damage + Kill Points + Multikill Bonuses + Assists×25) ÷ Rounds. Kill points vary by enemies alive when kill happens (150/130/110/90/70)."
          />
          <StatCard
            title="Team Avg K/D"
            value={avgKD.toFixed(2)}
          />
          <StatCard
            title="Team Avg KAST"
            value={`${Math.round(avgKAST)}%`}
          />
          <StatCard
            title="Top Performer"
            value={sortedPlayers[0]?.player_name ?? '-'}
            description={`${Math.round(sortedPlayers[0]?.acs ?? 0)} Mosaic ACS`}
          />
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
  const acs = player.acs ?? 0;
  const kd = player.kd_ratio ?? 0;
  const kast = player.kast_pct ?? 0;

  const acsComparison = avgACS > 0 ? ((acs - avgACS) / avgACS) * 100 : 0;
  const kdComparison = avgKD > 0 ? ((kd - avgKD) / avgKD) * 100 : 0;
  const kastComparison = avgKAST > 0 ? ((kast - avgKAST) / avgKAST) * 100 : 0;

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
            <div className="text-2xl font-bold">{Math.round(acs)}</div>
            <div className="text-xs text-muted-foreground">Mosaic ACS</div>
            <ComparisonBadge value={acsComparison} />
          </div>
          <div>
            <div className="text-2xl font-bold">{kd.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">K/D</div>
            <ComparisonBadge value={kdComparison} />
          </div>
          <div>
            <div className="text-2xl font-bold">{Math.round(kast)}%</div>
            <div className="text-xs text-muted-foreground">KAST</div>
            <ComparisonBadge value={kastComparison} />
          </div>
        </div>

        {/* Agent Pool */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">Agent Pool</div>
          <AgentGrid
            agents={player.top_agents ?? []}
            maxDisplay={5}
            size="sm"
            showNames={true}
            showRoleBadges={false}
          />
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

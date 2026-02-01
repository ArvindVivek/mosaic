'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Target, Trophy, Crosshair, Zap } from 'lucide-react';
import { StatCard } from '../visualizations/stat-card';
import { DataFreshness } from '../visualizations/data-freshness';
import type { ScoutingReport } from '@/app/lib/orchestration/types';
import { formatMapName, formatAgentName, formatEconomyType, formatPistolPattern } from '@/lib/format';

interface OverviewSectionProps {
  report: ScoutingReport;
  metadata?: {
    generatedAt: string;
    seriesCount: number;
  };
}

interface Insight {
  title: string;
  description: string;
  data_backing: string;
  significance: 'high' | 'medium' | 'low';
  icon: 'alert' | 'trend' | 'target';
}

export function OverviewSection({ report, metadata }: OverviewSectionProps) {
  // Calculate team overview stats from player data
  const players = report.players.status === 'success' ? report.players.data ?? [] : [];
  const maps = report.maps.status === 'success' ? report.maps.data ?? [] : [];
  const strategies = report.strategies.status === 'success' ? report.strategies.data : null;
  const compositions = report.compositions.status === 'success' ? report.compositions.data ?? [] : [];

  // Team averages
  const avgACS = players.length > 0
    ? Math.round(players.reduce((sum, p) => sum + p.acs, 0) / players.length)
    : 0;
  const avgKD = players.length > 0
    ? (players.reduce((sum, p) => sum + p.kd_ratio, 0) / players.length).toFixed(2)
    : '0.00';
  const avgKAST = players.length > 0
    ? Math.round(players.reduce((sum, p) => sum + p.kast_pct, 0) / players.length)
    : 0;

  // Map performance - use actual wins/losses fields
  const totalWins = maps.reduce((sum, m) => sum + (m.wins ?? 0), 0);
  const totalLosses = maps.reduce((sum, m) => sum + (m.losses ?? 0), 0);
  const totalGames = totalWins + totalLosses;
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  // Best map - filter out invalid data
  const validMaps = maps.filter(m => m.map_name && m.games_played > 0);
  const bestMap = validMaps.length > 0
    ? [...validMaps].sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0))[0]
    : null;

  // Most used composition - use correct field names (composition, games_played)
  const validComps = compositions.filter(c => c.composition && c.composition.length > 0 && (c.games_played ?? 0) > 0);
  const mostUsedComp = validComps.length > 0
    ? [...validComps].sort((a, b) => (b.games_played ?? 0) - (a.games_played ?? 0))[0]
    : null;

  // Top player
  const topPlayer = players.length > 0
    ? [...players].sort((a, b) => b.acs - a.acs)[0]
    : null;

  // Generate insights
  const insights = generateInsights(report);

  return (
    <div className="space-y-8">
      {/* Overview Header with Valorant styling */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-gradient-valorant">Team Overview</h2>
          <p className="text-sm text-muted-foreground">Competitive intelligence and performance metrics</p>
        </div>
        {metadata && (
          <DataFreshness
            matchCount={metadata.seriesCount}
            lastUpdated={metadata.generatedAt}
          />
        )}
      </div>

      {/* Key Performance Metrics - Gaming Style */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-valorant-red to-valorant-gold rounded-full"></div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-valorant-red" />
            Performance Metrics
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Team Avg ACS"
            value={avgACS}
            description={`Across ${players.length} players`}
          />
          <StatCard
            title="Team Avg K/D"
            value={avgKD}
          />
          <StatCard
            title="Team Avg KAST"
            value={`${avgKAST}%`}
          />
          <StatCard
            title="Overall Win Rate"
            value={`${overallWinRate}%`}
            description={`${totalWins}W - ${totalLosses}L`}
          />
        </div>
      </div>

      {/* Key Highlights Grid - Enhanced Gaming Aesthetic */}
      <div className="grid gap-4 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
        {/* Best Map */}
        {bestMap && (
          <Card className="border-l-4 border-l-valorant-red card-hover relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-valorant-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-valorant-red" />
                Strongest Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-valorant-red">{formatMapName(bestMap.map_name)}</div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Badge variant="outline" className="border-valorant-red/30 text-valorant-red">
                  {bestMap.win_rate}% WR
                </Badge>
                <span>{bestMap.wins}W-{bestMap.losses}L</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Player */}
        {topPlayer && (
          <Card className="border-l-4 border-l-valorant-gold card-hover relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-valorant-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-valorant-gold" />
                Top Performer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-valorant-gold">{topPlayer.player_name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {Math.round(topPlayer.acs)} ACS • {topPlayer.kd_ratio.toFixed(2)} K/D
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferred Composition */}
        {mostUsedComp && (
          <Card className="border-l-4 border-l-purple-500 card-hover relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                Signature Comp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-2">
                {mostUsedComp.composition?.slice(0, 3).map((agent, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {formatAgentName(agent)}
                  </Badge>
                ))}
                {(mostUsedComp.composition?.length ?? 0) > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(mostUsedComp.composition?.length ?? 0) - 3}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Used {mostUsedComp.games_played ?? 0}x • {Math.round(mostUsedComp.win_rate ?? 0)}% WR
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Actionable Insights - Enhanced */}
      {insights.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-valorant-gold to-valorant-red rounded-full"></div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-valorant-gold" />
              Key Insights
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.slice(0, 6).map((insight, i) => (
              <InsightCard key={i} insight={insight} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Summary - Refined */}
      <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
        {/* Strategy Summary */}
        {strategies && (
          <Card className="card-hover border-valorant-red/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-1 bg-gradient-to-b from-valorant-red to-valorant-gold rounded-full"></div>
                Strategic Tendencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {strategies.site_preferences && strategies.site_preferences.filter(s => s.site && s.site.toLowerCase() !== 'unknown').length > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Top Site Preference</span>
                  <span className="text-sm font-medium">
                    {strategies.site_preferences.filter(s => s.site && s.site.toLowerCase() !== 'unknown')[0].site} on {formatMapName(strategies.site_preferences.filter(s => s.site && s.site.toLowerCase() !== 'unknown')[0].map_name)}
                  </span>
                </div>
              )}
              {strategies.economy_patterns && strategies.economy_patterns.length > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Best Economy Type</span>
                  <Badge variant="outline" className="text-sm">
                    {formatEconomyType(strategies.economy_patterns.sort((a, b) => b.win_rate - a.win_rate)[0].economy_type)}
                  </Badge>
                </div>
              )}
              {strategies.pistol_patterns && strategies.pistol_patterns.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Pistol Pattern</span>
                  <Badge variant="outline" className="text-sm">
                    {formatPistolPattern(strategies.pistol_patterns.sort((a, b) => b.win_rate - a.win_rate)[0].pattern_type)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Player Summary */}
        {players.length > 0 && (
          <Card className="card-hover border-valorant-gold/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-8 w-1 bg-gradient-to-b from-valorant-gold to-valorant-red rounded-full"></div>
                Player Roster
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {players.slice(0, 5).map((player, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm p-2 rounded-md transition-all duration-200 hover:bg-valorant-red/5 hover:border-l-2 hover:border-l-valorant-red group"
                >
                  <span className="font-medium group-hover:text-valorant-red transition-colors">{player.player_name}</span>
                  <div className="flex gap-3 text-muted-foreground text-xs">
                    <span className="font-mono">{Math.round(player.acs)} ACS</span>
                    <span className="font-mono">{player.kd_ratio.toFixed(2)} K/D</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight, delay }: { insight: Insight; delay: number }) {
  const getIcon = () => {
    switch (insight.icon) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-valorant-red" />;
      case 'target':
        return <Target className="h-5 w-5 text-valorant-gold" />;
    }
  };

  const getBorderColor = () => {
    switch (insight.significance) {
      case 'high':
        return 'border-l-4 border-l-valorant-red';
      case 'medium':
        return 'border-l-4 border-l-valorant-gold';
      default:
        return 'border-l-2 border-l-border';
    }
  };

  return (
    <Card
      className={`card-hover scale-in ${getBorderColor()} relative overflow-hidden group`}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'backwards' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-valorant-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2 items-start">
            {getIcon()}
            <CardTitle className="text-sm leading-tight">{insight.title}</CardTitle>
          </div>
          <Badge
            variant={
              insight.significance === 'high'
                ? 'default'
                : insight.significance === 'medium'
                ? 'secondary'
                : 'outline'
            }
            className={`text-xs ${insight.significance === 'high' ? 'bg-valorant-red text-white' : ''}`}
          >
            {insight.significance}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{insight.description}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-valorant-red inline-block"></span>
          {insight.data_backing}
        </p>
      </CardContent>
    </Card>
  );
}

function generateInsights(report: ScoutingReport): Insight[] {
  const insights: Insight[] = [];
  const maps = report.maps.status === 'success' ? report.maps.data ?? [] : [];
  const strategies = report.strategies.status === 'success' ? report.strategies.data : null;
  const players = report.players.status === 'success' ? report.players.data ?? [] : [];

  // Insight 1: Best and worst map
  if (maps.length >= 2) {
    const sortedMaps = [...maps].sort((a, b) => b.win_rate - a.win_rate);
    const bestMap = sortedMaps[0];
    const worstMap = sortedMaps[sortedMaps.length - 1];

    if (bestMap.win_rate >= 60) {
      insights.push({
        title: `Dominant on ${formatMapName(bestMap.map_name)}`,
        description: `Team excels on ${formatMapName(bestMap.map_name)} with ${bestMap.win_rate}% win rate.`,
        data_backing: `${bestMap.games_played} games played (${bestMap.wins}W-${bestMap.losses}L)`,
        significance: bestMap.win_rate >= 70 ? 'high' : 'medium',
        icon: 'trend',
      });
    }

    if (worstMap.win_rate < 40 && worstMap.games_played >= 3) {
      insights.push({
        title: `Weak on ${formatMapName(worstMap.map_name)}`,
        description: `Team struggles on ${formatMapName(worstMap.map_name)} with only ${worstMap.win_rate}% win rate.`,
        data_backing: `${worstMap.games_played} games analyzed (${worstMap.wins}W-${worstMap.losses}L)`,
        significance: worstMap.win_rate < 30 ? 'high' : 'medium',
        icon: 'alert',
      });
    }
  }

  // Insight 2: Site preference patterns (filter out "unknown" sites)
  if (strategies?.site_preferences && strategies.site_preferences.length > 0) {
    const prefs = strategies.site_preferences.filter(s => s.site && s.site.toLowerCase() !== 'unknown');
    if (prefs.length > 0) {
      const topSite = prefs.reduce((max, p) => (p.preference_pct > max.preference_pct ? p : max));
      if (topSite.preference_pct >= 60) {
        insights.push({
          title: `Favors ${formatMapName(topSite.map_name)} ${topSite.site} Site`,
          description: `Team attacks ${topSite.site} site ${topSite.preference_pct}% of the time on ${formatMapName(topSite.map_name)}.`,
          data_backing: `${topSite.attacks} attacks with ${topSite.win_rate}% success rate`,
          significance: topSite.preference_pct >= 70 ? 'high' : 'medium',
          icon: 'target',
        });
      }
    }
  }

  // Insight 3: Economy patterns
  if (strategies?.economy_patterns && strategies.economy_patterns.length > 0) {
    const ecoPattern = strategies.economy_patterns.find((p) => p.economy_type === 'eco');
    const forcePattern = strategies.economy_patterns.find((p) => p.economy_type === 'force_buy');

    if (forcePattern && forcePattern.win_rate >= 45) {
      insights.push({
        title: 'Strong Force Buy Execution',
        description: `Team wins ${forcePattern.win_rate}% of force buy rounds, above typical rates.`,
        data_backing: `${forcePattern.occurrences} force buy rounds analyzed`,
        significance: forcePattern.win_rate >= 50 ? 'high' : 'medium',
        icon: 'trend',
      });
    }

    if (ecoPattern && ecoPattern.win_rate >= 20) {
      insights.push({
        title: 'Eco Round Specialists',
        description: `Team wins ${ecoPattern.win_rate}% of eco rounds, showing resourceful play.`,
        data_backing: `${ecoPattern.occurrences} eco rounds analyzed`,
        significance: ecoPattern.win_rate >= 25 ? 'high' : 'medium',
        icon: 'trend',
      });
    }
  }

  // Insight 4: Star player
  if (players.length >= 3) {
    const topPlayer = [...players].sort((a, b) => b.acs - a.acs)[0];
    const avgACS = players.reduce((sum, p) => sum + p.acs, 0) / players.length;
    const aboveAvgPct = ((topPlayer.acs - avgACS) / avgACS) * 100;

    if (aboveAvgPct >= 15) {
      insights.push({
        title: `${topPlayer.player_name} Leads the Charge`,
        description: `${topPlayer.player_name} leads with ${Math.round(topPlayer.acs)} ACS, ${Math.round(aboveAvgPct)}% above team average.`,
        data_backing: `K/D: ${topPlayer.kd_ratio.toFixed(2)}, KAST: ${Math.round(topPlayer.kast_pct)}%`,
        significance: aboveAvgPct >= 25 ? 'high' : 'medium',
        icon: 'trend',
      });
    }
  }

  return insights;
}

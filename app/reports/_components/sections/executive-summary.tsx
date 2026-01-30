'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Target } from 'lucide-react';
import { StatCard } from '../visualizations/stat-card';
import type { ScoutingReport } from '@/app/lib/orchestration/types';

interface ExecutiveSummaryProps {
  report: ScoutingReport;
}

interface Insight {
  title: string;
  description: string;
  data_backing: string;
  significance: 'high' | 'medium' | 'low';
  icon: 'alert' | 'trend' | 'target';
}

export function ExecutiveSummary({ report }: ExecutiveSummaryProps) {
  // Calculate team overview stats from player data
  const players = report.players.status === 'success' ? report.players.data ?? [] : [];
  const maps = report.maps.status === 'success' ? report.maps.data ?? [] : [];

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

  // Map performance
  const totalGames = maps.reduce((sum, m) => sum + m.games_played, 0);
  const totalWins = maps.reduce((sum, m) => sum + m.wins, 0);
  const overallWinRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  // Generate insights from data
  const insights = generateInsights(report);

  return (
    <div className="space-y-6">
      {/* Team Overview Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4">Team Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Team Avg ACS"
            value={avgACS}
            description={`${players.length} players analyzed`}
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
            description={`${totalWins}W - ${totalGames - totalWins}L (${totalGames} games)`}
          />
        </div>
      </div>

      {/* Top 3 Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Top Actionable Insights</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {insights.slice(0, 3).map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const getIcon = () => {
    switch (insight.icon) {
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'target':
        return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2 items-start">
            {getIcon()}
            <CardTitle className="text-base leading-tight">{insight.title}</CardTitle>
          </div>
          <Badge
            variant={
              insight.significance === 'high'
                ? 'default'
                : insight.significance === 'medium'
                ? 'secondary'
                : 'outline'
            }
          >
            {insight.significance}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">{insight.description}</p>
        <p className="text-xs text-muted-foreground">{insight.data_backing}</p>
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
        title: `Strong on ${bestMap.map_name}`,
        description: `Team has ${bestMap.win_rate}% win rate on ${bestMap.map_name}, their strongest map.`,
        data_backing: `Based on ${bestMap.games_played} games (${bestMap.wins}W-${bestMap.losses}L)`,
        significance: bestMap.win_rate >= 70 ? 'high' : 'medium',
        icon: 'trend',
      });
    }

    if (worstMap.win_rate < 40 && worstMap.games_played >= 3) {
      insights.push({
        title: `Weak on ${worstMap.map_name}`,
        description: `Team struggles on ${worstMap.map_name} with only ${worstMap.win_rate}% win rate.`,
        data_backing: `Based on ${worstMap.games_played} games (${worstMap.wins}W-${worstMap.losses}L)`,
        significance: worstMap.win_rate < 30 ? 'high' : 'medium',
        icon: 'alert',
      });
    }
  }

  // Insight 2: Site preference patterns
  if (strategies?.site_preferences && strategies.site_preferences.length > 0) {
    const prefs = strategies.site_preferences;
    const topSite = prefs.reduce((max, p) => (p.preference_pct > max.preference_pct ? p : max));
    if (topSite.preference_pct >= 60) {
      insights.push({
        title: `Prefers ${topSite.map_name} ${topSite.site} site`,
        description: `Team attacks ${topSite.site} site ${topSite.preference_pct}% of the time on ${topSite.map_name}.`,
        data_backing: `${topSite.attacks} attacks with ${topSite.win_rate}% success rate`,
        significance: topSite.preference_pct >= 70 ? 'high' : 'medium',
        icon: 'target',
      });
    }
  }

  // Insight 3: Economy patterns
  if (strategies?.economy_patterns && strategies.economy_patterns.length > 0) {
    const ecoPattern = strategies.economy_patterns.find((p) => p.economy_type === 'eco');
    const forcePattern = strategies.economy_patterns.find((p) => p.economy_type === 'force_buy');

    if (forcePattern && forcePattern.win_rate >= 45) {
      insights.push({
        title: 'Strong force buy success',
        description: `Team wins ${forcePattern.win_rate}% of force buy rounds, above typical rates.`,
        data_backing: `${forcePattern.occurrences} force buy rounds analyzed`,
        significance: forcePattern.win_rate >= 50 ? 'high' : 'medium',
        icon: 'trend',
      });
    }

    if (ecoPattern && ecoPattern.win_rate >= 20) {
      insights.push({
        title: 'Eco round specialists',
        description: `Team wins ${ecoPattern.win_rate}% of eco rounds, showing scrappy play.`,
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
        title: `${topPlayer.player_name} is the star`,
        description: `${topPlayer.player_name} leads with ${Math.round(topPlayer.acs)} ACS, ${Math.round(aboveAvgPct)}% above team average.`,
        data_backing: `K/D: ${topPlayer.kd_ratio.toFixed(2)}, KAST: ${Math.round(topPlayer.kast_pct)}%`,
        significance: aboveAvgPct >= 25 ? 'high' : 'medium',
        icon: 'trend',
      });
    }
  }

  return insights;
}

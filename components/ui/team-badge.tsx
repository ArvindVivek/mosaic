/**
 * Team Badge Component
 * Display team logos, colors, and branding for esports teams
 */

'use client';

import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface TeamBadgeProps {
  teamName: string;
  teamLogo?: string;
  teamColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showGlow?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

// Common esports team colors
const TEAM_COLORS: Record<string, string> = {
  'Cloud9': '#0099FF',
  'C9': '#0099FF',
  'Team Liquid': '#1E3A5F',
  'TL': '#1E3A5F',
  'Sentinels': '#FF4655',
  'SEN': '#FF4655',
  'FaZe': '#FF0000',
  'NRG': '#000000',
  'Evil Geniuses': '#1034A6',
  'EG': '#1034A6',
  '100 Thieves': '#FF0040',
  '100T': '#FF0040',
  'TSM': '#000000',
  'OpTic': '#7AB800',
  'FNATIC': '#FF5900',
  'FNC': '#FF5900',
  'G2': '#FF5900',
  'Vitality': '#FFB800',
  'VIT': '#FFB800',
  'Navi': '#FFD700',
  'NAVI': '#FFD700',
  'FPX': '#000000',
  'EDG': '#FF0000',
  'PRX': '#FF6B6B',
  'DRX': '#4A90E2',
  'LOUD': '#00FF87',
};

export function TeamBadge({
  teamName,
  teamLogo,
  teamColor,
  size = 'md',
  showName = false,
  showGlow = false,
  className
}: TeamBadgeProps) {
  const displayColor = teamColor || TEAM_COLORS[teamName] || '#FF4655';
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  const glowStyle = showGlow
    ? { boxShadow: `0 0 20px ${displayColor}40, 0 0 40px ${displayColor}20` }
    : {};

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative rounded-lg overflow-hidden',
          'border-2 bg-card/50 backdrop-blur-sm',
          'flex items-center justify-center',
          'transition-all duration-300',
          'group cursor-pointer',
          sizeClass,
          showGlow && 'hover:scale-105'
        )}
        style={{
          borderColor: displayColor,
          ...glowStyle
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${displayColor}40 0%, transparent 100%)`
          }}
        />

        {/* Team logo or placeholder */}
        {teamLogo ? (
          <img
            src={teamLogo}
            alt={teamName}
            className="w-full h-full object-contain p-2 relative z-10 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <Shield
            className="relative z-10 transition-transform duration-300 group-hover:scale-110"
            size={size === 'sm' ? 16 : size === 'md' ? 24 : size === 'lg' ? 32 : 48}
            style={{ color: displayColor }}
          />
        )}

        {/* Corner accents */}
        <div
          className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 opacity-50 z-20"
          style={{ borderColor: displayColor }}
        />
        <div
          className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 opacity-50 z-20"
          style={{ borderColor: displayColor }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `linear-gradient(to top, ${displayColor}40, transparent)`
          }}
        />
      </div>

      {/* Team name */}
      {showName && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight', textSizeClass)}>
            {teamName}
          </span>
          <div
            className="h-0.5 w-full rounded-full mt-1"
            style={{ backgroundColor: displayColor }}
          />
        </div>
      )}
    </div>
  );
}

interface TeamComparisonProps {
  team1: { name: string; logo?: string; color?: string };
  team2: { name: string; logo?: string; color?: string };
  score1?: number;
  score2?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TeamComparison({
  team1,
  team2,
  score1,
  score2,
  size = 'md',
  className
}: TeamComparisonProps) {
  const winner = score1 !== undefined && score2 !== undefined && score1 !== score2
    ? (score1 > score2 ? 'team1' : 'team2')
    : null;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Team 1 */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {score1 !== undefined && (
          <span
            className={cn(
              'text-3xl font-bold tabular-nums',
              winner === 'team1' && 'text-valorant-gold',
              winner === 'team2' && 'text-muted-foreground'
            )}
          >
            {score1}
          </span>
        )}
        <TeamBadge
          teamName={team1.name}
          teamLogo={team1.logo}
          teamColor={team1.color}
          size={size}
          showName
          showGlow={winner === 'team1'}
        />
      </div>

      {/* VS Divider */}
      <div className="flex flex-col items-center px-4">
        <div className="h-px w-12 bg-border" />
        <span className="text-xs font-bold text-muted-foreground my-1">VS</span>
        <div className="h-px w-12 bg-border" />
      </div>

      {/* Team 2 */}
      <div className="flex items-center gap-3 flex-1">
        <TeamBadge
          teamName={team2.name}
          teamLogo={team2.logo}
          teamColor={team2.color}
          size={size}
          showName
          showGlow={winner === 'team2'}
        />
        {score2 !== undefined && (
          <span
            className={cn(
              'text-3xl font-bold tabular-nums',
              winner === 'team2' && 'text-valorant-gold',
              winner === 'team1' && 'text-muted-foreground'
            )}
          >
            {score2}
          </span>
        )}
      </div>
    </div>
  );
}

interface TeamRosterProps {
  teamName: string;
  teamColor?: string;
  players: Array<{
    name: string;
    role: string;
    agent?: string;
  }>;
  className?: string;
}

export function TeamRoster({
  teamName,
  teamColor,
  players,
  className
}: TeamRosterProps) {
  const displayColor = teamColor || TEAM_COLORS[teamName] || '#FF4655';

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-6 space-y-4',
        'bg-gradient-to-br from-card to-background',
        'hover-glow-duelist transition-all duration-300',
        className
      )}
      style={{ borderColor: displayColor }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: displayColor }}>
        <TeamBadge
          teamName={teamName}
          teamColor={teamColor}
          size="md"
        />
        <h3 className="text-xl font-bold">{teamName}</h3>
      </div>

      {/* Player list */}
      <div className="space-y-2">
        {players.map((player, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: displayColor }}
              />
              <div>
                <div className="font-semibold">{player.name}</div>
                <div className="text-xs text-muted-foreground">{player.role}</div>
              </div>
            </div>
            {player.agent && (
              <span className="text-sm text-muted-foreground">
                {player.agent}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

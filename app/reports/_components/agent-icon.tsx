'use client';

import Image from 'next/image';
import { getAgentIcon, hasAgentIcon, getAgentPlaceholder, getAgentRole, getRoleBgColor } from '@/lib/valorant-assets';
import { formatAgentName } from '@/lib/format';
import { User } from 'lucide-react';
import { RoleIcon, getRoleColorClass, getRoleBorderClass, getRoleGradientClass } from '@/components/ui/role-icons';
import { cn } from '@/lib/utils';

interface AgentIconProps {
  agentName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRole?: boolean;
  showRoleBadge?: boolean;
  showGlow?: boolean;
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

const iconSizes = {
  sm: 28,
  md: 36,
  lg: 52,
  xl: 76,
};

const roleBadgeSizes = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 18,
};

const nameSizes = {
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
  xl: 'text-sm',
};

export function AgentIcon({
  agentName,
  size = 'md',
  showRole = false,
  showRoleBadge = false,
  showGlow = false,
  showName = true,
  className = ''
}: AgentIconProps) {
  const agentIcon = getAgentIcon(agentName);
  const hasIcon = hasAgentIcon(agentName);
  const placeholder = getAgentPlaceholder(agentName);
  const role = getAgentRole(agentName) as 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';
  const roleBgColor = getRoleBgColor(role);
  const sizeClass = sizeClasses[size];
  const roleColorClass = getRoleColorClass(role);
  const roleBorderClass = getRoleBorderClass(role);
  const roleGradientClass = getRoleGradientClass(role);

  const containerClasses = cn(
    'relative',
    sizeClass,
    'rounded-lg overflow-hidden border',
    roleBorderClass,
    showGlow && 'transition-all duration-300',
    'bg-card/50 backdrop-blur-sm',
    'flex items-center justify-center group'
  );

  const hoverGlowClass = showGlow ? `hover-glow-${role.toLowerCase()}` : '';

  return (
    <div className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      {/* Agent Icon Container */}
      <div className={cn(containerClasses, hoverGlowClass, 'relative')}>
        {/* Background gradient */}
        <div className={cn('absolute inset-0', roleGradientClass, 'opacity-30')} />

        {/* Agent image or placeholder */}
        {hasIcon && agentIcon ? (
          <Image
            src={agentIcon}
            alt={formatAgentName(agentName)}
            width={iconSizes[size]}
            height={iconSizes[size]}
            className="object-cover group-hover:scale-110 transition-transform duration-300 relative z-10"
          />
        ) : (
          <div className={cn(
            'flex items-center justify-center w-full h-full',
            roleGradientClass,
            'relative z-10'
          )}>
            <User className={size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-10 w-10'} />
          </div>
        )}

        {/* Small role indicator in corner - only when showRoleBadge is true */}
        {showRoleBadge && (
          <div className={cn(
            'absolute -top-0.5 -right-0.5 z-30',
            'rounded-full p-0.5',
            'bg-background/95 backdrop-blur-sm border',
            roleBorderClass
          )}>
            <RoleIcon role={role} size={roleBadgeSizes[size]} />
          </div>
        )}
      </div>

      {/* Agent Name Caption */}
      {showName && (
        <span className={cn(
          nameSizes[size],
          'font-medium text-center leading-tight max-w-[60px] truncate',
          roleColorClass
        )}>
          {formatAgentName(agentName)}
        </span>
      )}

      {/* Full Role display (when showRole is true) */}
      {showRole && (
        <div className={cn(
          'flex items-center gap-1',
          'text-[9px] font-medium px-1.5 py-0.5',
          'rounded border backdrop-blur-sm',
          roleBgColor,
          roleColorClass
        )}>
          <RoleIcon role={role} size={10} />
          <span>{role}</span>
        </div>
      )}
    </div>
  );
}

interface AgentGridProps {
  agents: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  showNames?: boolean;
  showRoleBadges?: boolean;
}

export function AgentGrid({
  agents,
  maxDisplay = 5,
  size = 'md',
  showGlow = false,
  showNames = true,
  showRoleBadges = false
}: AgentGridProps) {
  const displayAgents = agents.slice(0, maxDisplay);
  const remainingCount = agents.length - maxDisplay;

  return (
    <div className="flex items-start gap-4 flex-wrap">
      {displayAgents.map((agent, idx) => (
        <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'backwards' }}>
          <AgentIcon
            agentName={agent}
            size={size}
            showGlow={showGlow}
            showName={showNames}
            showRoleBadge={showRoleBadges}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            sizeClasses[size],
            'rounded-lg border border-border/50 bg-muted/50 backdrop-blur-sm',
            'flex items-center justify-center',
            'text-xs font-medium text-muted-foreground',
            'hover:border-primary/50 hover:bg-primary/5 transition-all duration-300'
          )}>
            +{remainingCount}
          </div>
          {showNames && (
            <span className={cn(nameSizes[size], 'text-muted-foreground')}>more</span>
          )}
        </div>
      )}
    </div>
  );
}

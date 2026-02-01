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
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

const roleBadgeSizes = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export function AgentIcon({
  agentName,
  size = 'md',
  showRole = false,
  showRoleBadge = true,
  showGlow = false,
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
    'rounded-lg overflow-hidden border-2',
    roleBorderClass,
    showGlow && 'transition-all duration-300',
    'bg-card/50 backdrop-blur-sm',
    'flex items-center justify-center group cursor-pointer',
    className
  );

  const hoverGlowClass = showGlow ? `hover-glow-${role.toLowerCase()}` : '';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={cn(containerClasses, hoverGlowClass, 'relative')}>
        {/* Background gradient */}
        <div className={cn('absolute inset-0', roleGradientClass, 'opacity-40')} />

        {/* Agent image or placeholder */}
        {hasIcon && agentIcon ? (
          <>
            <Image
              src={agentIcon}
              alt={formatAgentName(agentName)}
              width={iconSizes[size]}
              height={iconSizes[size]}
              className="object-cover group-hover:scale-110 transition-transform duration-300 relative z-10"
            />
            <div className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20'
            )} />
          </>
        ) : (
          <div className={cn(
            'flex items-center justify-center w-full h-full',
            roleGradientClass,
            'relative z-10'
          )}>
            <User className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'} />
          </div>
        )}

        {/* Role badge in corner */}
        {showRoleBadge && (
          <div className={cn(
            'absolute -bottom-1 -right-1 z-30',
            'rounded-full p-0.5',
            'bg-background/90 backdrop-blur-sm border-2',
            roleBorderClass,
            'transition-transform duration-300 group-hover:scale-110'
          )}>
            <RoleIcon role={role} size={roleBadgeSizes[size]} />
          </div>
        )}

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 opacity-50 z-20" style={{ borderColor: 'currentColor' }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 opacity-50 z-20" style={{ borderColor: 'currentColor' }} />
      </div>

      {/* Role text display */}
      {showRole && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold tracking-tight">{formatAgentName(agentName)}</span>
          <div className={cn(
            'flex items-center gap-1.5',
            'text-[10px] font-medium px-2 py-0.5',
            'rounded-md border backdrop-blur-sm',
            roleBgColor,
            roleColorClass
          )}>
            <RoleIcon role={role} size={10} />
            <span>{role}</span>
          </div>
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
}

export function AgentGrid({ agents, maxDisplay = 5, size = 'md', showGlow = false }: AgentGridProps) {
  const displayAgents = agents.slice(0, maxDisplay);
  const remainingCount = agents.length - maxDisplay;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayAgents.map((agent, idx) => (
        <AgentIcon
          key={idx}
          agentName={agent}
          size={size}
          showGlow={showGlow}
          className="animate-fade-in"
          style={{ animationDelay: `${idx * 50}ms` }}
        />
      ))}
      {remainingCount > 0 && (
        <div className={cn(
          sizeClasses[size],
          'rounded-lg border-2 border-border/50 bg-muted/50 backdrop-blur-sm',
          'flex items-center justify-center',
          'text-xs font-medium text-muted-foreground',
          'hover:border-primary/50 hover:bg-primary/5 transition-all duration-300'
        )}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

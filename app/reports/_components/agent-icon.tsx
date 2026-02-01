'use client';

import Image from 'next/image';
import { getAgentIcon, hasAgentIcon, getAgentPlaceholder, getAgentRole, getRoleBgColor } from '@/lib/valorant-assets';
import { formatAgentName } from '@/lib/format';
import { User } from 'lucide-react';

interface AgentIconProps {
  agentName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showRole?: boolean;
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

export function AgentIcon({ agentName, size = 'md', showRole = false, className = '' }: AgentIconProps) {
  const agentIcon = getAgentIcon(agentName);
  const hasIcon = hasAgentIcon(agentName);
  const placeholder = getAgentPlaceholder(agentName);
  const role = getAgentRole(agentName);
  const roleBgColor = getRoleBgColor(role);
  const sizeClass = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClass} rounded-md overflow-hidden border-2 border-border bg-muted flex items-center justify-center group`}>
        {hasIcon && agentIcon ? (
          <>
            <Image
              src={agentIcon}
              alt={formatAgentName(agentName)}
              width={iconSizes[size]}
              height={iconSizes[size]}
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-valorant-red/20 to-valorant-gold/20">
            <User className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'} />
          </div>
        )}
      </div>
      {showRole && (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{formatAgentName(agentName)}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border ${roleBgColor}`}>
            {role}
          </span>
        </div>
      )}
    </div>
  );
}

interface AgentGridProps {
  agents: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AgentGrid({ agents, maxDisplay = 5, size = 'md' }: AgentGridProps) {
  const displayAgents = agents.slice(0, maxDisplay);
  const remainingCount = agents.length - maxDisplay;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayAgents.map((agent, idx) => (
        <AgentIcon key={idx} agentName={agent} size={size} />
      ))}
      {remainingCount > 0 && (
        <div className={`${sizeClasses[size]} rounded-md border-2 border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

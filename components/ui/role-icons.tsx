/**
 * Role-specific SVG icons for Valorant agents
 * Inspired by League of Legends role iconography
 */

import { cn } from '@/lib/utils';

interface RoleIconProps {
  role: 'Duelist' | 'Controller' | 'Initiator' | 'Sentinel';
  size?: number;
  className?: string;
  showGlow?: boolean;
}

export function RoleIcon({ role, size = 24, className, showGlow = false }: RoleIconProps) {
  const glowClass = showGlow ? getRoleGlowClass(role) : '';
  const colorClass = getRoleColorClass(role);

  return (
    <div className={cn('inline-flex items-center justify-center', glowClass, className)}>
      {role === 'Duelist' && <DuelistIcon size={size} className={colorClass} />}
      {role === 'Controller' && <ControllerIcon size={size} className={colorClass} />}
      {role === 'Initiator' && <InitiatorIcon size={size} className={colorClass} />}
      {role === 'Sentinel' && <SentinelIcon size={size} className={colorClass} />}
    </div>
  );
}

function DuelistIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L4 8V12L12 18L20 12V8L12 2Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M12 2L4 8M12 2L20 8M12 2V10M4 8V12L12 18M20 8V12L12 18M12 18V10M12 10L4 8M12 10L20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2" fill="currentColor" />
      <path
        d="M10 14L12 18L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ControllerIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.2" />
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path
        d="M12 4V8M12 16V20M4 12H8M16 12H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InitiatorIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 4L6 8L12 12L18 8L12 4Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M12 4L6 8M12 4L18 8M12 4V12M6 8V16L12 20M18 8V16L12 20M12 20V12M12 12L6 8M12 12L18 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path
        d="M9 6L7 8M15 6L17 8M9 18L7 16M15 18L17 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SentinelIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 3L4 7V12C4 16 6 19 12 21C18 19 20 16 20 12V7L12 3Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M12 3L4 7V12C4 16 6 19 12 21C18 19 20 16 20 12V7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 7V12M12 12L15 15M12 12L9 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function getRoleColorClass(role: string): string {
  const colors: Record<string, string> = {
    'Duelist': 'text-role-duelist',
    'Controller': 'text-role-controller',
    'Initiator': 'text-role-initiator',
    'Sentinel': 'text-role-sentinel',
  };
  return colors[role] || 'text-muted-foreground';
}

export function getRoleGlowClass(role: string): string {
  const glows: Record<string, string> = {
    'Duelist': 'glow-duelist',
    'Controller': 'glow-controller',
    'Initiator': 'glow-initiator',
    'Sentinel': 'glow-sentinel',
  };
  return glows[role] || '';
}

export function getRoleBorderClass(role: string): string {
  const borders: Record<string, string> = {
    'Duelist': 'border-role-duelist',
    'Controller': 'border-role-controller',
    'Initiator': 'border-role-initiator',
    'Sentinel': 'border-role-sentinel',
  };
  return borders[role] || 'border-muted';
}

export function getRoleGradientClass(role: string): string {
  const gradients: Record<string, string> = {
    'Duelist': 'bg-gradient-to-br from-role-duelist/20 via-role-duelist/10 to-transparent',
    'Controller': 'bg-gradient-to-br from-role-controller/20 via-role-controller/10 to-transparent',
    'Initiator': 'bg-gradient-to-br from-role-initiator/20 via-role-initiator/10 to-transparent',
    'Sentinel': 'bg-gradient-to-br from-role-sentinel/20 via-role-sentinel/10 to-transparent',
  };
  return gradients[role] || 'bg-gradient-to-br from-muted/20 to-transparent';
}

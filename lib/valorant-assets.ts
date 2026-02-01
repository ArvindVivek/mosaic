/**
 * Valorant asset management utilities
 * Uses locally downloaded assets for fast loading
 */

/**
 * Get Valorant agent icon URL (local assets)
 */
export function getAgentIcon(agentName: string): string {
  if (!agentName) return '';

  // Normalize agent name for file lookup
  const normalized = agentName.toLowerCase().trim().replace(/\s+/g, '').replace(/\//g, '');

  // Map special cases
  const fileMap: Record<string, string> = {
    'kayo': 'kayo',
    'kay/o': 'kayo',
  };

  const fileName = fileMap[normalized] || normalized;
  return `/valorant/agents/${fileName}.png`;
}

/**
 * Get Valorant map splash image URL (local assets)
 */
export function getMapImage(mapName: string): string {
  if (!mapName) return '';

  const lowerName = mapName.toLowerCase().trim();

  // All competitive maps we have downloaded
  const validMaps = [
    'ascent', 'bind', 'haven', 'split', 'icebox',
    'breeze', 'fracture', 'pearl', 'lotus', 'sunset',
    'abyss', 'corrode'
  ];

  if (validMaps.includes(lowerName)) {
    return `/valorant/maps/${lowerName}.png`;
  }

  return '';
}

/**
 * Get agent role
 */
export function getAgentRole(agentName: string): string {
  const roles: Record<string, string> = {
    // Duelists
    'jett': 'Duelist',
    'reyna': 'Duelist',
    'raze': 'Duelist',
    'phoenix': 'Duelist',
    'yoru': 'Duelist',
    'neon': 'Duelist',
    'iso': 'Duelist',
    // Initiators
    'sova': 'Initiator',
    'breach': 'Initiator',
    'skye': 'Initiator',
    'fade': 'Initiator',
    'gekko': 'Initiator',
    'kayo': 'Initiator',
    'kay/o': 'Initiator',
    'tejo': 'Initiator',
    // Controllers
    'omen': 'Controller',
    'brimstone': 'Controller',
    'viper': 'Controller',
    'astra': 'Controller',
    'harbor': 'Controller',
    'clove': 'Controller',
    // Sentinels
    'sage': 'Sentinel',
    'cypher': 'Sentinel',
    'killjoy': 'Sentinel',
    'chamber': 'Sentinel',
    'deadlock': 'Sentinel',
    'vyse': 'Sentinel',
  };

  const lowerName = agentName.toLowerCase().trim().replace(/\s+/g, '').replace(/\//g, '');
  return roles[lowerName] || 'Unknown';
}

/**
 * Get role color for styling
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    'Duelist': 'text-role-duelist border-role-duelist',
    'Initiator': 'text-role-initiator border-role-initiator',
    'Controller': 'text-role-controller border-role-controller',
    'Sentinel': 'text-role-sentinel border-role-sentinel',
  };

  return colors[role] || 'text-muted-foreground border-muted';
}

/**
 * Get role background color for badges
 */
export function getRoleBgColor(role: string): string {
  const colors: Record<string, string> = {
    'Duelist': 'bg-role-duelist/10 border-role-duelist/30',
    'Initiator': 'bg-role-initiator/10 border-role-initiator/30',
    'Controller': 'bg-role-controller/10 border-role-controller/30',
    'Sentinel': 'bg-role-sentinel/10 border-role-sentinel/30',
  };

  return colors[role] || 'bg-muted border-border';
}

/**
 * Get role description for tooltips
 */
export function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'Duelist': 'Aggressive entry fraggers who lead the charge',
    'Initiator': 'Setup plays and gather info for the team',
    'Controller': 'Block vision and control map territory',
    'Sentinel': 'Defensive anchors who hold sites and flank',
  };

  return descriptions[role] || 'Unknown role';
}

/**
 * Check if agent icon is available locally
 */
export function hasAgentIcon(agentName: string): boolean {
  const validAgents = [
    'jett', 'reyna', 'raze', 'phoenix', 'yoru', 'neon', 'iso',
    'sova', 'breach', 'skye', 'fade', 'gekko', 'kayo', 'tejo',
    'omen', 'brimstone', 'viper', 'astra', 'harbor', 'clove',
    'sage', 'cypher', 'killjoy', 'chamber', 'deadlock', 'vyse',
    'veto', 'waylay'
  ];
  const normalized = agentName.toLowerCase().trim().replace(/\s+/g, '').replace(/\//g, '');
  return validAgents.includes(normalized);
}

/**
 * Check if map image is available locally
 */
export function hasMapImage(mapName: string): boolean {
  const validMaps = [
    'ascent', 'bind', 'haven', 'split', 'icebox',
    'breeze', 'fracture', 'pearl', 'lotus', 'sunset',
    'abyss', 'corrode'
  ];
  return validMaps.includes(mapName.toLowerCase().trim());
}

/**
 * Get placeholder icon for agents without images
 */
export function getAgentPlaceholder(agentName: string): string {
  return agentName ? agentName.charAt(0).toUpperCase() : '?';
}

/**
 * Get default map colors for backgrounds when no image is available
 */
export function getMapGradient(mapName: string): string {
  const gradients: Record<string, string> = {
    'ascent': 'from-green-900/40 to-green-700/40',
    'bind': 'from-orange-900/40 to-orange-700/40',
    'haven': 'from-blue-900/40 to-blue-700/40',
    'split': 'from-purple-900/40 to-purple-700/40',
    'icebox': 'from-cyan-900/40 to-cyan-700/40',
    'breeze': 'from-teal-900/40 to-teal-700/40',
    'fracture': 'from-red-900/40 to-red-700/40',
    'pearl': 'from-pink-900/40 to-pink-700/40',
    'lotus': 'from-emerald-900/40 to-emerald-700/40',
    'sunset': 'from-amber-900/40 to-amber-700/40',
    'abyss': 'from-violet-900/40 to-violet-700/40',
    'corrode': 'from-lime-900/40 to-lime-700/40',
  };

  const lowerName = mapName.toLowerCase().trim();
  return gradients[lowerName] || 'from-gray-900/40 to-gray-700/40';
}

/**
 * All available agents list
 */
export const ALL_AGENTS = [
  'Jett', 'Reyna', 'Raze', 'Phoenix', 'Yoru', 'Neon', 'Iso',
  'Sova', 'Breach', 'Skye', 'Fade', 'Gekko', 'KAY/O', 'Tejo',
  'Omen', 'Brimstone', 'Viper', 'Astra', 'Harbor', 'Clove',
  'Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse'
];

/**
 * All competitive maps list
 */
export const ALL_MAPS = [
  'Ascent', 'Bind', 'Haven', 'Split', 'Icebox',
  'Breeze', 'Fracture', 'Pearl', 'Lotus', 'Sunset',
  'Abyss', 'Corrode'
];

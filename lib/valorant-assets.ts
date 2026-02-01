/**
 * Valorant asset management utilities
 * Provides URLs for agent icons, map images, and other game assets
 */

/**
 * Get Valorant agent icon URL from community resources
 * Using valorant-api.com for reliable asset URLs
 */
export function getAgentIcon(agentName: string): string {
  if (!agentName) return '';

  const agentMap: Record<string, string> = {
    'jett': 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png',
    'reyna': 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png',
    'raze': 'https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png',
    'phoenix': 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png',
    'yoru': 'https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png',
    'neon': 'https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png',
    'iso': 'https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png',
    'sova': 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png',
    'breach': 'https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png',
    'skye': 'https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png',
    'fade': 'https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png',
    'gekko': 'https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png',
    'omen': 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png',
    'brimstone': 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png',
    'viper': 'https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png',
    'astra': 'https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png',
    'harbor': 'https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png',
    'clove': 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png',
    'sage': 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png',
    'cypher': 'https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png',
    'killjoy': 'https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png',
    'chamber': 'https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png',
    'deadlock': 'https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png',
    'vyse': 'https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png',
    'kayo': 'https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png',
    'kay/o': 'https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png',
  };

  const lowerName = agentName.toLowerCase().trim().replace(/\s+/g, '');
  return agentMap[lowerName] || '';
}

/**
 * Get Valorant map splash image URL
 */
export function getMapImage(mapName: string): string {
  if (!mapName) return '';

  const mapImages: Record<string, string> = {
    'ascent': 'https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png',
    'bind': 'https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png',
    'haven': 'https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png',
    'split': 'https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png',
    'icebox': 'https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png',
    'breeze': 'https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png',
    'fracture': 'https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png',
    'pearl': 'https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png',
    'lotus': 'https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png',
    'sunset': 'https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png',
    'abyss': 'https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png',
  };

  const lowerName = mapName.toLowerCase().trim();
  return mapImages[lowerName] || '';
}

/**
 * Get agent role icon
 */
export function getAgentRole(agentName: string): string {
  const roles: Record<string, string> = {
    'jett': 'Duelist',
    'reyna': 'Duelist',
    'raze': 'Duelist',
    'phoenix': 'Duelist',
    'yoru': 'Duelist',
    'neon': 'Duelist',
    'iso': 'Duelist',
    'sova': 'Initiator',
    'breach': 'Initiator',
    'skye': 'Initiator',
    'fade': 'Initiator',
    'gekko': 'Initiator',
    'omen': 'Controller',
    'brimstone': 'Controller',
    'viper': 'Controller',
    'astra': 'Controller',
    'harbor': 'Controller',
    'clove': 'Controller',
    'sage': 'Sentinel',
    'cypher': 'Sentinel',
    'killjoy': 'Sentinel',
    'chamber': 'Sentinel',
    'deadlock': 'Sentinel',
    'vyse': 'Sentinel',
    'kayo': 'Initiator',
    'kay/o': 'Initiator',
  };

  const lowerName = agentName.toLowerCase().trim().replace(/\s+/g, '');
  return roles[lowerName] || 'Unknown';
}

/**
 * Get role color for styling
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    'Duelist': 'text-valorant-red border-valorant-red',
    'Initiator': 'text-valorant-gold border-valorant-gold',
    'Controller': 'text-blue-500 border-blue-500',
    'Sentinel': 'text-green-500 border-green-500',
  };

  return colors[role] || 'text-muted-foreground border-muted';
}

/**
 * Get role background color for badges
 */
export function getRoleBgColor(role: string): string {
  const colors: Record<string, string> = {
    'Duelist': 'bg-valorant-red/10 border-valorant-red/30',
    'Initiator': 'bg-valorant-gold/10 border-valorant-gold/30',
    'Controller': 'bg-blue-500/10 border-blue-500/30',
    'Sentinel': 'bg-green-500/10 border-green-500/30',
  };

  return colors[role] || 'bg-muted border-border';
}

/**
 * Check if agent icon is available
 */
export function hasAgentIcon(agentName: string): boolean {
  return getAgentIcon(agentName) !== '';
}

/**
 * Check if map image is available
 */
export function hasMapImage(mapName: string): boolean {
  return getMapImage(mapName) !== '';
}

/**
 * Get placeholder icon for agents without images
 */
export function getAgentPlaceholder(agentName: string): string {
  // Return first letter of agent name for placeholder
  return agentName ? agentName.charAt(0).toUpperCase() : '?';
}

/**
 * Get default map colors for backgrounds when no image is available
 */
export function getMapGradient(mapName: string): string {
  const gradients: Record<string, string> = {
    'ascent': 'from-green-900/20 to-green-700/20',
    'bind': 'from-orange-900/20 to-orange-700/20',
    'haven': 'from-blue-900/20 to-blue-700/20',
    'split': 'from-purple-900/20 to-purple-700/20',
    'icebox': 'from-cyan-900/20 to-cyan-700/20',
    'breeze': 'from-teal-900/20 to-teal-700/20',
    'fracture': 'from-red-900/20 to-red-700/20',
    'pearl': 'from-pink-900/20 to-pink-700/20',
    'lotus': 'from-emerald-900/20 to-emerald-700/20',
    'sunset': 'from-amber-900/20 to-amber-700/20',
    'abyss': 'from-violet-900/20 to-violet-700/20',
  };

  const lowerName = mapName.toLowerCase().trim();
  return gradients[lowerName] || 'from-gray-900/20 to-gray-700/20';
}

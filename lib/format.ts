/**
 * Formatting utilities for Valorant data display
 * Converts snake_case to proper display names and handles game-specific formatting
 */

/**
 * Convert snake_case or kebab-case to Title Case
 * Examples: "force_buy" -> "Force Buy", "half_buy" -> "Half Buy"
 */
export function toTitleCase(str: string): string {
  if (!str) return '';

  return str
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Capitalize first letter of each word
 * Examples: "ascent" -> "Ascent", "bind" -> "Bind"
 */
export function capitalize(str: string): string {
  if (!str) return '';

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format map names consistently
 * Handles special cases and ensures proper capitalization
 */
export function formatMapName(mapName: string): string {
  if (!mapName) return '';

  const specialCases: Record<string, string> = {
    'ascent': 'Ascent',
    'bind': 'Bind',
    'haven': 'Haven',
    'split': 'Split',
    'icebox': 'Icebox',
    'breeze': 'Breeze',
    'fracture': 'Fracture',
    'pearl': 'Pearl',
    'lotus': 'Lotus',
    'sunset': 'Sunset',
    'abyss': 'Abyss',
  };

  const lowerName = mapName.toLowerCase().trim();
  return specialCases[lowerName] || capitalize(mapName);
}

/**
 * Format agent names consistently
 * Handles special cases and ensures proper capitalization
 */
export function formatAgentName(agentName: string): string {
  if (!agentName) return '';

  const specialCases: Record<string, string> = {
    'killjoy': 'Killjoy',
    'kay/o': 'KAY/O',
    'kayo': 'KAY/O',
    'neon': 'Neon',
    'jett': 'Jett',
    'reyna': 'Reyna',
    'raze': 'Raze',
    'phoenix': 'Phoenix',
    'yoru': 'Yoru',
    'iso': 'Iso',
    'gekko': 'Gekko',
    'harbor': 'Harbor',
    'viper': 'Viper',
    'omen': 'Omen',
    'brimstone': 'Brimstone',
    'astra': 'Astra',
    'clove': 'Clove',
    'sova': 'Sova',
    'breach': 'Breach',
    'skye': 'Skye',
    'fade': 'Fade',
    'cypher': 'Cypher',
    'chamber': 'Chamber',
    'sage': 'Sage',
    'deadlock': 'Deadlock',
    'vyse': 'Vyse',
  };

  const lowerName = agentName.toLowerCase().trim();
  return specialCases[lowerName] || capitalize(agentName);
}

/**
 * Format economy types with proper display names
 */
export function formatEconomyType(economyType: string): string {
  if (!economyType) return '';

  const economyLabels: Record<string, string> = {
    'eco': 'Eco',
    'half_buy': 'Half Buy',
    'force_buy': 'Force Buy',
    'full_buy': 'Full Buy',
  };

  return economyLabels[economyType.toLowerCase()] || toTitleCase(economyType);
}

/**
 * Format pistol pattern types with proper display names
 */
export function formatPistolPattern(patternType: string): string {
  if (!patternType) return '';

  const pistolLabels: Record<string, string> = {
    'fast_execute': 'Fast Execute',
    'default': 'Default Setup',
    'no_plant': 'No Plant',
    'slow_default': 'Slow Default',
    'split_push': 'Split Push',
  };

  return pistolLabels[patternType.toLowerCase()] || toTitleCase(patternType);
}

/**
 * Format site names (A, B, C, Mid)
 */
export function formatSiteName(site: string): string {
  if (!site) return '';

  const upperSite = site.toUpperCase().trim();

  // Handle common site names
  if (['A', 'B', 'C'].includes(upperSite)) {
    return `${upperSite} Site`;
  }

  if (upperSite === 'MID' || upperSite === 'MIDDLE') {
    return 'Mid';
  }

  return capitalize(site);
}

/**
 * Format round types
 */
export function formatRoundType(roundType: string): string {
  if (!roundType) return '';

  const roundLabels: Record<string, string> = {
    'pistol': 'Pistol Round',
    'eco': 'Eco Round',
    'force': 'Force Buy',
    'bonus': 'Bonus Round',
    'full_buy': 'Full Buy',
  };

  return roundLabels[roundType.toLowerCase()] || toTitleCase(roundType);
}

/**
 * Get color class for win rate
 */
export function getWinRateColor(winRate: number): string {
  if (winRate >= 60) return 'text-valorant-red';
  if (winRate >= 50) return 'text-valorant-gold';
  if (winRate >= 40) return 'text-muted-foreground';
  return 'text-destructive';
}

/**
 * Get background color class for win rate
 */
export function getWinRateBgColor(winRate: number): string {
  if (winRate >= 60) return 'bg-valorant-red/10 border-valorant-red/30';
  if (winRate >= 50) return 'bg-valorant-gold/10 border-valorant-gold/30';
  if (winRate >= 40) return 'bg-muted border-border';
  return 'bg-destructive/10 border-destructive/30';
}

/**
 * Format percentage with proper decimal places
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with commas for thousands
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

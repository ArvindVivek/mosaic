// Transform functions for GRID Series State API responses
// Normalizes round event data for storage and analysis

/**
 * Raw types from Series State API (may vary from actual schema)
 */
interface RawSeriesState {
  id: string
  finished: boolean
  teams: RawSeriesTeam[]
  games: RawGame[]
}

interface RawSeriesTeam {
  id: string
  name: string
  score: number
  side?: string
  players: RawPlayer[]
}

interface RawPlayer {
  id: string
  nickname: string
  agent?: string
  stats?: RawPlayerStats
}

interface RawPlayerStats {
  kills: number
  deaths: number
  assists: number
  acs: number
  headshots: number
  firstBloods: number
  clutchesWon?: number
  clutchesPlayed?: number
  plants?: number
  defuses?: number
}

interface RawGame {
  id: string
  mapName: string
  mapNumber: number
  finished: boolean
  teams: Array<{ id: string; score: number }>
  rounds: RawRound[]
}

interface RawRound {
  roundNumber: number
  winningTeamId: string
  winCondition: string
  bombPlanted?: boolean
  bombDefused?: boolean
  economy?: {
    team1: RawEconomy
    team2: RawEconomy
  }
  kills: RawKill[]
  abilities?: RawAbility[]
}

interface RawEconomy {
  loadoutValue: number
  remainingCredits: number
  lossBonus?: number
}

interface RawKill {
  killer: { id: string; nickname: string }
  victim: { id: string; nickname: string }
  weapon: string
  headshot: boolean
  timestamp: number
  assistants?: Array<{ id: string; nickname: string }>
}

interface RawAbility {
  player: { id: string; nickname: string }
  ability: string
  timestamp: number
}

/**
 * Normalized event data structure for storage
 */
export interface NormalizedEventData {
  seriesId: string
  finished: boolean
  teams: NormalizedTeam[]
  games: NormalizedGame[]
  fetchedAt: string
}

export interface NormalizedTeam {
  id: string
  name: string
  score: number
  players: NormalizedPlayer[]
}

export interface NormalizedPlayer {
  id: string
  name: string
  agent?: string
  stats: {
    kills: number
    deaths: number
    assists: number
    acs: number
    hsPercent: number
    firstBloods: number
    clutchWinRate?: number
    kast?: number // Kill/Assist/Survive/Trade %
  }
}

export interface NormalizedGame {
  id: string
  mapName: string
  mapNumber: number
  finished: boolean
  score: { team1: number; team2: number }
  rounds: NormalizedRound[]
  summary: {
    totalRounds: number
    team1AttackWins: number
    team1DefenseWins: number
    team2AttackWins: number
    team2DefenseWins: number
  }
}

export interface NormalizedRound {
  number: number
  winner: string // team id
  winCondition: 'elimination' | 'spike_detonated' | 'spike_defused' | 'time'
  spikePlanted: boolean
  spikeDefused: boolean
  economy: {
    team1: NormalizedEconomy
    team2: NormalizedEconomy
  }
  kills: NormalizedKill[]
  firstBlood?: NormalizedKill
}

export interface NormalizedEconomy {
  loadoutValue: number
  remainingCredits: number
  roundType: 'pistol' | 'eco' | 'half_buy' | 'full_buy' | 'force_buy'
}

export interface NormalizedKill {
  killer: string // player id
  killerName: string
  victim: string
  victimName: string
  weapon: string
  headshot: boolean
  timestamp: number
  assists: string[] // player ids
}

/**
 * Determine economy round type based on loadout value
 */
function determineRoundType(loadoutValue: number, roundNumber: number): NormalizedEconomy['roundType'] {
  // Pistol rounds (1 and 13 in standard VALORANT)
  if (roundNumber === 1 || roundNumber === 13) {
    return 'pistol'
  }

  // Thresholds based on typical VALORANT economy
  if (loadoutValue < 5000) return 'eco'
  if (loadoutValue < 15000) return 'half_buy'
  if (loadoutValue < 20000) return 'force_buy'
  return 'full_buy'
}

/**
 * Map raw win condition to normalized enum
 */
function normalizeWinCondition(rawCondition: string): NormalizedRound['winCondition'] {
  const conditionMap: Record<string, NormalizedRound['winCondition']> = {
    'elimination': 'elimination',
    'Elimination': 'elimination',
    'spike_detonated': 'spike_detonated',
    'BombDetonated': 'spike_detonated',
    'spike_defused': 'spike_defused',
    'BombDefused': 'spike_defused',
    'time': 'time',
    'Time': 'time',
    'RoundTimerExpired': 'time',
  }
  return conditionMap[rawCondition] ?? 'elimination'
}

/**
 * Normalize a single round's data
 */
function normalizeRound(raw: RawRound, team1Id: string): NormalizedRound {
  const kills: NormalizedKill[] = (raw.kills ?? []).map((k) => ({
    killer: k.killer.id,
    killerName: k.killer.nickname,
    victim: k.victim.id,
    victimName: k.victim.nickname,
    weapon: k.weapon,
    headshot: k.headshot,
    timestamp: k.timestamp,
    assists: k.assistants?.map((a) => a.id) ?? [],
  }))

  // Find first blood (earliest kill in round)
  const firstBlood = kills.length > 0
    ? kills.reduce((earliest, k) => k.timestamp < earliest.timestamp ? k : earliest)
    : undefined

  return {
    number: raw.roundNumber,
    winner: raw.winningTeamId,
    winCondition: normalizeWinCondition(raw.winCondition),
    spikePlanted: raw.bombPlanted ?? false,
    spikeDefused: raw.bombDefused ?? false,
    economy: {
      team1: {
        loadoutValue: raw.economy?.team1?.loadoutValue ?? 0,
        remainingCredits: raw.economy?.team1?.remainingCredits ?? 0,
        roundType: determineRoundType(
          raw.economy?.team1?.loadoutValue ?? 0,
          raw.roundNumber
        ),
      },
      team2: {
        loadoutValue: raw.economy?.team2?.loadoutValue ?? 0,
        remainingCredits: raw.economy?.team2?.remainingCredits ?? 0,
        roundType: determineRoundType(
          raw.economy?.team2?.loadoutValue ?? 0,
          raw.roundNumber
        ),
      },
    },
    kills,
    firstBlood,
  }
}

/**
 * Normalize player stats with calculated metrics
 */
function normalizePlayer(raw: RawPlayer): NormalizedPlayer {
  const stats = raw.stats ?? {
    kills: 0,
    deaths: 0,
    assists: 0,
    acs: 0,
    headshots: 0,
    firstBloods: 0,
  }

  const totalShots = stats.kills > 0 ? stats.kills : 1 // Avoid division by zero
  const hsPercent = Math.round((stats.headshots / totalShots) * 100)

  const clutchWinRate = stats.clutchesPlayed && stats.clutchesPlayed > 0
    ? Math.round(((stats.clutchesWon ?? 0) / stats.clutchesPlayed) * 100)
    : undefined

  return {
    id: raw.id,
    name: raw.nickname,
    agent: raw.agent,
    stats: {
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      acs: stats.acs,
      hsPercent,
      firstBloods: stats.firstBloods,
      clutchWinRate,
    },
  }
}

/**
 * Normalize a game/map's data with round summary
 */
function normalizeGame(raw: RawGame, team1Id: string, team2Id: string): NormalizedGame {
  const rounds = (raw.rounds ?? []).map((r) => normalizeRound(r, team1Id))

  // Calculate round summary (assuming first 12 rounds one side, next 12 other side)
  let team1AttackWins = 0
  let team1DefenseWins = 0
  let team2AttackWins = 0
  let team2DefenseWins = 0

  rounds.forEach((r) => {
    // Team 1 attacks first half (rounds 1-12), defends second half (13-24)
    const isFirstHalf = r.number <= 12
    if (r.winner === team1Id) {
      if (isFirstHalf) team1AttackWins++
      else team1DefenseWins++
    } else if (r.winner === team2Id) {
      if (isFirstHalf) team2DefenseWins++
      else team2AttackWins++
    }
  })

  return {
    id: raw.id,
    mapName: raw.mapName,
    mapNumber: raw.mapNumber,
    finished: raw.finished,
    score: {
      team1: raw.teams?.[0]?.score ?? 0,
      team2: raw.teams?.[1]?.score ?? 0,
    },
    rounds,
    summary: {
      totalRounds: rounds.length,
      team1AttackWins,
      team1DefenseWins,
      team2AttackWins,
      team2DefenseWins,
    },
  }
}

/**
 * Normalize complete series state for storage
 */
export function normalizeSeriesState(raw: RawSeriesState): NormalizedEventData {
  const team1 = raw.teams?.[0]
  const team2 = raw.teams?.[1]

  return {
    seriesId: raw.id,
    finished: raw.finished,
    teams: raw.teams.map((t) => ({
      id: t.id,
      name: t.name,
      score: t.score,
      players: t.players.map(normalizePlayer),
    })),
    games: raw.games.map((g) => normalizeGame(g, team1?.id ?? '', team2?.id ?? '')),
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Extract key statistics from normalized event data
 * Useful for quick queries without parsing full JSONB
 */
export function extractKeyStats(eventData: NormalizedEventData) {
  const allRounds = eventData.games.flatMap((g) => g.rounds)
  const allKills = allRounds.flatMap((r) => r.kills)

  return {
    totalMaps: eventData.games.length,
    totalRounds: allRounds.length,
    totalKills: allKills.length,
    pistolRounds: allRounds.filter((r) => r.number === 1 || r.number === 13).length,
    clutchSituations: allRounds.filter((r) => {
      // Rough heuristic: if one team got most kills, might be clutch
      return r.kills.length >= 3
    }).length,
  }
}

// Re-export types for use in Edge Functions
// These mirror the types in app/lib/grid/types.ts but adapted for GRID GraphQL schema

export interface GridTeam {
  id: string
  name: string
  shortName?: string
  logoUrl?: string
  players?: { edges?: Array<{ node: GridPlayer }> } | GridPlayer[]
  score?: number
}

export interface GridPlayer {
  id: string
  nickname: string
  realName?: string
  role?: string
}

export interface GridMatch {
  id: string
  seriesId: string
  tournament?: {
    id: string
    name: string
  }
  teams?: GridTeam[]
  startTime: string
  state?: string
  maps?: GridMap[]
}

export interface GridMap {
  id: string
  name: string
  gameNumber: number
  teamOneScore: number
  teamTwoScore: number
}

// Internal models for database storage
export interface Team {
  id: string
  gridTeamId: string
  name: string
  shortName?: string | null
  logoUrl?: string | null
  region: string
  createdAt: string
  updatedAt: string
}

export interface Player {
  id: string
  gridPlayerId: string
  name: string
  realName?: string | null
  teamId?: string | null
  role?: string | null
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  gridMatchId: string
  gridSeriesId: string
  tournamentId: string
  tournamentName?: string | null
  teamHomeId?: string | null
  teamAwayId?: string | null
  teamHomeScore?: number | null
  teamAwayScore?: number | null
  mapName?: string | null
  matchDate: string
  eventData?: unknown
  fetchedAt: string
  createdAt: string
  updatedAt: string
}

// Transform functions from GRID API responses to internal schema
// Handles the DATA-05 requirement for normalization

import type {
  GridTeam,
  GridPlayer,
  GridMatch,
  Team,
  Player,
  Match,
} from './types.ts'

/**
 * Extract edges from GraphQL connection type
 */
function extractEdges<T>(connection: { edges?: Array<{ node: T }> } | undefined): T[] {
  return connection?.edges?.map((edge) => edge.node) ?? []
}

/**
 * Normalize GRID team response to internal Team model
 */
export function normalizeTeam(gridTeam: GridTeam): Omit<Team, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    gridTeamId: gridTeam.id,
    name: gridTeam.name,
    shortName: gridTeam.shortName ?? null,
    logoUrl: gridTeam.logoUrl ?? null,
    region: 'Americas', // Hardcoded for VCT Americas scope
  }
}

/**
 * Normalize GRID player response to internal Player model
 */
export function normalizePlayer(
  gridPlayer: GridPlayer,
  teamGridId?: string
): Omit<Player, 'id' | 'teamId' | 'createdAt' | 'updatedAt'> & { teamGridId?: string } {
  return {
    gridPlayerId: gridPlayer.id,
    name: gridPlayer.nickname,
    realName: gridPlayer.realName ?? null,
    role: gridPlayer.role ?? null,
    teamGridId, // Used for linking after team is inserted
  }
}

/**
 * Normalize GRID match response to internal Match model
 * Handles both Central Data API format and potential variations
 */
export function normalizeMatch(
  gridMatch: GridMatch
): Omit<Match, 'id' | 'teamHomeId' | 'teamAwayId' | 'createdAt' | 'updatedAt'> & {
  teamHomeGridId?: string
  teamAwayGridId?: string
} {
  const teams = gridMatch.teams || []
  const maps = gridMatch.maps || []

  // Get first map info if available (for single-map matches)
  const firstMap = maps[0]

  return {
    gridMatchId: gridMatch.id,
    gridSeriesId: gridMatch.seriesId,
    tournamentId: gridMatch.tournament?.id ?? 'unknown',
    tournamentName: gridMatch.tournament?.name ?? null,
    teamHomeGridId: teams[0]?.id,
    teamAwayGridId: teams[1]?.id,
    teamHomeScore: firstMap?.teamOneScore ?? teams[0]?.score ?? null,
    teamAwayScore: firstMap?.teamTwoScore ?? teams[1]?.score ?? null,
    mapName: firstMap?.name ?? null,
    matchDate: gridMatch.startTime,
    eventData: null, // Populated by Series State API in Plan 03
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Normalize teams response from GraphQL connection
 */
export function normalizeTeamsResponse(response: {
  teams?: { edges?: Array<{ node: GridTeam }> }
}): Array<ReturnType<typeof normalizeTeam>> {
  const teams = extractEdges(response.teams)
  return teams.map(normalizeTeam)
}

/**
 * Normalize players from team response
 */
export function normalizePlayersFromTeam(
  gridTeam: GridTeam
): Array<ReturnType<typeof normalizePlayer>> {
  const players = gridTeam.players?.edges?.map((e) => e.node) ??
                  (gridTeam.players as unknown as GridPlayer[]) ?? []
  return players.map((p) => normalizePlayer(p, gridTeam.id))
}

/**
 * Normalize matches response from GraphQL connection
 */
export function normalizeMatchesResponse(response: {
  matches?: {
    edges?: Array<{ node: GridMatch }>
    pageInfo?: { hasNextPage: boolean; endCursor: string }
  }
}): {
  matches: Array<ReturnType<typeof normalizeMatch>>
  hasNextPage: boolean
  endCursor?: string
} {
  const matches = extractEdges(response.matches)
  return {
    matches: matches.map(normalizeMatch),
    hasNextPage: response.matches?.pageInfo?.hasNextPage ?? false,
    endCursor: response.matches?.pageInfo?.endCursor,
  }
}

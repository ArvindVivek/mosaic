/**
 * TypeScript types for GRID API responses and internal data models
 *
 * These types provide type safety for GRID API GraphQL responses
 * and our internal database models.
 */

// ============================================================================
// GRID API Response Types
// ============================================================================

/**
 * Team data from GRID API
 */
export interface GridTeam {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  region?: string;
}

/**
 * Player data from GRID API
 */
export interface GridPlayer {
  id: string;
  name: string;
  realName?: string;
  teamId?: string;
  role?: string;
}

/**
 * Match data from GRID API
 *
 * Contains metadata about a VALORANT match, including teams,
 * scores, and tournament context.
 */
export interface GridMatch {
  id: string;
  seriesId: string;
  tournamentId: string;
  tournamentName?: string;
  homeTeam: {
    id: string;
    name: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    score?: number;
  };
  mapName?: string;
  matchDate: string;
  eventData?: Record<string, unknown>; // Raw event data from GRID
}

/**
 * Series (Bo3, Bo5) data from GRID API
 */
export interface GridSeries {
  id: string;
  tournamentId: string;
  tournamentName?: string;
  homeTeam: GridTeam;
  awayTeam: GridTeam;
  matches: GridMatch[];
  startDate: string;
  endDate?: string;
  format?: string; // "Bo3", "Bo5", etc.
}

/**
 * Tournament data from GRID API
 */
export interface GridTournament {
  id: string;
  name: string;
  region: string;
  startDate: string;
  endDate?: string;
  tier?: string; // "S", "A", "B" tier
}

// ============================================================================
// Internal Database Models
// ============================================================================

/**
 * Team model matching our database schema
 */
export interface Team {
  id: string; // UUID
  gridTeamId: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Player model matching our database schema
 */
export interface Player {
  id: string; // UUID
  gridPlayerId: string;
  name: string;
  realName?: string;
  teamId?: string; // UUID reference
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Match model matching our database schema
 */
export interface Match {
  id: string; // UUID
  gridMatchId: string;
  gridSeriesId: string;
  tournamentId: string;
  tournamentName?: string;
  teamHomeId?: string; // UUID reference
  teamAwayId?: string; // UUID reference
  teamHomeScore?: number;
  teamAwayScore?: number;
  mapName?: string;
  matchDate: Date;
  eventData?: Record<string, unknown>; // JSONB field
  fetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount?: number;
}

/**
 * Error response from GRID API
 */
export interface GridApiError {
  message: string;
  extensions?: {
    code?: string;
    statusCode?: number;
  };
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Parameters for fetching matches
 */
export interface MatchQueryParams {
  tournamentId?: string;
  teamId?: string;
  startDate?: string; // ISO 8601 date string
  endDate?: string;
  limit?: number;
  cursor?: string;
}

/**
 * Parameters for fetching series
 */
export interface SeriesQueryParams {
  tournamentId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

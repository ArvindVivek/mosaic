// GraphQL query definitions for GRID Central Data API
// Queries are designed to minimize overfetching per research guidance

/**
 * Fetch VCT Americas teams with roster information
 * Note: Actual field names may need adjustment based on GRID API schema
 */
export const GET_TEAMS_QUERY = `
  query GetTeams($region: String, $tournamentId: ID) {
    teams(filter: { region: $region, tournamentId: $tournamentId }) {
      edges {
        node {
          id
          name
          shortName
          logoUrl
          players {
            edges {
              node {
                id
                nickname
                realName
                role
              }
            }
          }
        }
      }
    }
  }
`

/**
 * Fetch match metadata with configurable filters
 * Supports filtering by team, tournament, map, and date range
 */
export const GET_MATCHES_QUERY = `
  query GetMatches(
    $teamId: ID
    $tournamentId: ID
    $mapName: String
    $dateFrom: DateTime
    $dateTo: DateTime
    $limit: Int
    $after: String
  ) {
    matches(
      filter: {
        teamId: $teamId
        tournamentId: $tournamentId
        mapName: $mapName
        startTimeFrom: $dateFrom
        startTimeTo: $dateTo
      }
      first: $limit
      after: $after
    ) {
      edges {
        node {
          id
          seriesId
          startTime
          state
          tournament {
            id
            name
          }
          teams {
            id
            name
            shortName
            score
          }
          maps {
            id
            name
            gameNumber
            teamOneScore
            teamTwoScore
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

/**
 * Fetch single team details with full roster
 */
export const GET_TEAM_DETAILS_QUERY = `
  query GetTeamDetails($teamId: ID!) {
    team(id: $teamId) {
      id
      name
      shortName
      logoUrl
      players {
        edges {
          node {
            id
            nickname
            realName
            role
          }
        }
      }
    }
  }
`

/**
 * Fetch tournaments for VCT Americas
 * Used to populate tournament filter options
 */
export const GET_TOURNAMENTS_QUERY = `
  query GetTournaments($region: String) {
    tournaments(filter: { region: $region }) {
      edges {
        node {
          id
          name
          startDate
          endDate
        }
      }
    }
  }
`

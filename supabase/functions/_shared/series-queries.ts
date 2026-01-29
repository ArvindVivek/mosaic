// GraphQL query definitions for GRID Series State API
// Fetches round-by-round event data for completed matches

/**
 * Fetch complete series state with all rounds and events
 * Note: Actual GRID schema may differ - fields based on research patterns
 */
export const GET_SERIES_STATE_QUERY = `
  query GetSeriesState($seriesId: ID!) {
    seriesState(id: $seriesId) {
      id
      finished
      teams {
        id
        name
        score
        side
        players {
          id
          nickname
          agent
          stats {
            kills
            deaths
            assists
            acs
            headshots
            firstBloods
            clutchesWon
            clutchesPlayed
          }
        }
      }
      games {
        id
        mapName
        mapNumber
        finished
        teams {
          id
          score
        }
        rounds {
          roundNumber
          winningTeamId
          winCondition
          bombPlanted
          bombDefused
          economy {
            team1 {
              loadoutValue
              remainingCredits
              lossBonus
            }
            team2 {
              loadoutValue
              remainingCredits
              lossBonus
            }
          }
          kills {
            killer {
              id
              nickname
            }
            victim {
              id
              nickname
            }
            weapon
            headshot
            timestamp
            assistants {
              id
              nickname
            }
          }
          abilities {
            player {
              id
              nickname
            }
            ability
            timestamp
          }
        }
      }
    }
  }
`

/**
 * Fetch series state summary (lighter query for checking status)
 */
export const GET_SERIES_STATUS_QUERY = `
  query GetSeriesStatus($seriesId: ID!) {
    seriesState(id: $seriesId) {
      id
      finished
      teams {
        id
        name
        score
      }
      games {
        id
        mapName
        finished
      }
    }
  }
`

/**
 * Fetch player stats aggregates for a series
 */
export const GET_SERIES_PLAYER_STATS_QUERY = `
  query GetSeriesPlayerStats($seriesId: ID!) {
    seriesState(id: $seriesId) {
      id
      teams {
        id
        name
        players {
          id
          nickname
          agent
          stats {
            kills
            deaths
            assists
            acs
            headshots
            firstBloods
            clutchesWon
            clutchesPlayed
            plants
            defuses
          }
        }
      }
    }
  }
`

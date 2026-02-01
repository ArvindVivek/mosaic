import {
  getTeamStrategiesSummary,
  getTeamPlayersSummary,
  getPlayerCoreStats,
  getPlayerAgentPool,
  getTeamCompositions,
  getCompositionWinRatesByMap,
  getMapWinRates,
  getMapPoolAnalysis,
  getMapSitePatterns,
  getRoleDistribution,
} from '@/app/lib/analytics'
import { generateCounterStrategies } from '@/app/lib/analytics/counter-strategies'
import { getSeriesForTeam, getGamesForSeries, getTournaments } from '@/app/lib/data/matches'
import { getTeams } from '@/app/lib/data/teams'
import { createServiceClient } from '@/app/lib/supabase/server'

/**
 * Helper to safely execute a function and return null on error
 */
async function safeExecute<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error('Tool execution error:', error)
    return fallback
  }
}

/**
 * Execute a tool call and return the result
 */
export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const teamId = args.teamId as string
  const seriesIds = (args.seriesIds as string[]) || []
  const playerId = args.playerId as string
  const mapName = args.mapName as string
  const limit = (args.limit as number) || 10

  switch (name) {
    case 'get_team_strategies':
      return getTeamStrategiesSummary({ teamId, seriesIds })

    case 'get_team_players':
      return getTeamPlayersSummary({ teamId, seriesIds })

    case 'get_player_details': {
      // Execute with graceful error handling for each stat type
      const [core, agents] = await Promise.all([
        safeExecute(() => getPlayerCoreStats({ playerId, seriesIds }), null),
        safeExecute(() => getPlayerAgentPool({ playerId, seriesIds }), []),
      ])
      return { core, agents }
    }

    case 'get_compositions':
      return getTeamCompositions({ teamId, seriesIds })

    case 'get_compositions_by_map':
      return getCompositionWinRatesByMap({ teamId, seriesIds })

    case 'get_map_performance':
      return getMapWinRates({ teamId, seriesIds })

    case 'get_map_pool_analysis':
      return getMapPoolAnalysis({ teamId, seriesIds })

    case 'get_map_site_patterns':
      return getMapSitePatterns({ teamId, seriesIds, mapName })

    case 'get_counter_strategies': {
      const [strategies, maps] = await Promise.all([
        getTeamStrategiesSummary({ teamId, seriesIds }),
        getMapWinRates({ teamId, seriesIds }),
      ])
      return generateCounterStrategies(strategies, maps)
    }

    case 'get_role_distribution':
      return getRoleDistribution({ teamId, seriesIds })

    // NEW: Get recent matches for a team
    case 'get_recent_matches': {
      const series = await getSeriesForTeam(teamId, limit)
      const teams = await getTeams()
      const teamsMap = new Map(teams.map(t => [t.id, t.name]))

      // Enrich with opponent info and game details
      const enrichedSeries = await Promise.all(
        series.map(async (s) => {
          const games = await getGamesForSeries(s.id)
          const opponentId = s.teamAId === teamId ? s.teamBId : s.teamAId
          const opponentName = opponentId ? teamsMap.get(opponentId) : 'Unknown'
          const won = s.winnerId === teamId

          return {
            seriesId: s.id,
            date: s.startTime,
            opponent: opponentName,
            won,
            format: s.format,
            maps: games.map(g => ({
              name: g.mapName,
              teamScore: s.teamAId === teamId ? g.teamAScore : g.teamBScore,
              opponentScore: s.teamAId === teamId ? g.teamBScore : g.teamAScore,
              won: g.winnerId === teamId,
            })),
          }
        })
      )

      return enrichedSeries
    }

    // NEW: Get series IDs filtered by map name
    case 'get_series_by_map': {
      const supabase = createServiceClient()
      const { data: games } = await supabase
        .from('games')
        .select('series_id')
        .eq('map_name', mapName)

      if (!games) return []

      const seriesIdsForMap = [...new Set(games.map(g => g.series_id).filter(Boolean))]

      // Filter to only series involving this team
      const teamSeries = await getSeriesForTeam(teamId, 100)
      const teamSeriesIds = new Set(teamSeries.map(s => s.id))

      return seriesIdsForMap.filter(id => teamSeriesIds.has(id as string))
    }

    // NEW: Get first blood stats from player_round_stats
    case 'get_first_blood_stats': {
      const supabase = createServiceClient()

      // Get all players for the team
      const players = await getTeamPlayersSummary({ teamId, seriesIds })

      // For each player, get first blood data from player_round_stats
      const fbStats = await Promise.all(
        players.map(async (player) => {
          const { data, error } = await supabase
            .from('player_round_stats')
            .select('first_kill, first_death, round_id')
            .eq('player_id', player.player_id)

          if (error || !data) {
            return {
              playerName: player.player_name,
              playerId: player.player_id,
              firstKills: 0,
              firstDeaths: 0,
              totalRounds: 0,
              fkRate: 0,
              fdRate: 0,
              fkFdDiff: 0,
            }
          }

          const firstKills = data.filter(r => r.first_kill).length
          const firstDeaths = data.filter(r => r.first_death).length
          const totalRounds = data.length

          return {
            playerName: player.player_name,
            playerId: player.player_id,
            firstKills,
            firstDeaths,
            totalRounds,
            fkRate: totalRounds > 0 ? (firstKills / totalRounds * 100) : 0,
            fdRate: totalRounds > 0 ? (firstDeaths / totalRounds * 100) : 0,
            fkFdDiff: totalRounds > 0 ? ((firstKills - firstDeaths) / totalRounds * 100) : 0,
          }
        })
      )

      // Sort by first kill rate
      return fbStats.sort((a, b) => b.fkRate - a.fkRate)
    }

    // NEW: Get clutch stats from player_round_stats
    case 'get_clutch_stats': {
      const supabase = createServiceClient()

      const players = await getTeamPlayersSummary({ teamId, seriesIds })

      const clutchStats = await Promise.all(
        players.map(async (player) => {
          const { data, error } = await supabase
            .from('player_round_stats')
            .select('clutch_situation, clutch_won')
            .eq('player_id', player.player_id)

          if (error || !data) {
            return {
              playerName: player.player_name,
              playerId: player.player_id,
              clutchSituations: 0,
              clutchWins: 0,
              clutchRate: 0,
            }
          }

          const clutchSituations = data.filter(r => r.clutch_situation).length
          const clutchWins = data.filter(r => r.clutch_won).length

          return {
            playerName: player.player_name,
            playerId: player.player_id,
            clutchSituations,
            clutchWins,
            clutchRate: clutchSituations > 0 ? (clutchWins / clutchSituations * 100) : 0,
          }
        })
      )

      return clutchStats.sort((a, b) => b.clutchRate - a.clutchRate)
    }

    // NEW: Get tournament list
    case 'get_tournaments':
      return getTournaments()

    // NEW: Get head-to-head record
    case 'get_head_to_head': {
      const opponentId = args.opponentId as string
      const supabase = createServiceClient()

      const { data: series } = await supabase
        .from('series')
        .select('*')
        .or(`and(team_a_id.eq.${teamId},team_b_id.eq.${opponentId}),and(team_a_id.eq.${opponentId},team_b_id.eq.${teamId})`)
        .order('start_time', { ascending: false })

      if (!series) return { wins: 0, losses: 0, mapRecord: [] }

      const wins = series.filter(s => s.winner_id === teamId).length
      const losses = series.filter(s => s.winner_id === opponentId).length

      // Get map-level breakdown
      const mapRecord: Record<string, { wins: number; losses: number }> = {}
      for (const s of series) {
        const games = await getGamesForSeries(s.id)
        for (const g of games) {
          if (!g.mapName) continue
          if (!mapRecord[g.mapName]) mapRecord[g.mapName] = { wins: 0, losses: 0 }
          if (g.winnerId === teamId) mapRecord[g.mapName].wins++
          else if (g.winnerId === opponentId) mapRecord[g.mapName].losses++
        }
      }

      return {
        seriesWins: wins,
        seriesLosses: losses,
        totalSeries: series.length,
        mapRecord: Object.entries(mapRecord).map(([map, record]) => ({
          map,
          wins: record.wins,
          losses: record.losses,
          winRate: (record.wins + record.losses) > 0
            ? (record.wins / (record.wins + record.losses) * 100)
            : 0,
        })),
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

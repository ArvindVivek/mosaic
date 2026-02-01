import {
  getTeamStrategiesSummary,
  getTeamPlayersSummary,
  getPlayerCoreStats,
  getPlayerAgentPool,
  getPlayerFirstBloodStats,
  getPlayerClutchStats,
  getPlayerPerformanceTrend,
  getTeamCompositions,
  getCompositionWinRatesByMap,
  getMapWinRates,
  getMapPoolAnalysis,
  getMapSitePatterns,
  getRoleDistribution,
} from '@/app/lib/analytics'
import { generateCounterStrategies } from '@/app/lib/analytics/counter-strategies'

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

  switch (name) {
    case 'get_team_strategies':
      return getTeamStrategiesSummary({ teamId, seriesIds })

    case 'get_team_players':
      return getTeamPlayersSummary({ teamId, seriesIds })

    case 'get_player_details': {
      const [core, agents, firstBlood, clutch, trend] = await Promise.all([
        getPlayerCoreStats({ playerId, seriesIds }),
        getPlayerAgentPool({ playerId, seriesIds }),
        getPlayerFirstBloodStats({ playerId, seriesIds }),
        getPlayerClutchStats({ playerId, seriesIds }),
        getPlayerPerformanceTrend({ playerId, seriesIds }),
      ])
      return { core, agents, firstBlood, clutch, trend }
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

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

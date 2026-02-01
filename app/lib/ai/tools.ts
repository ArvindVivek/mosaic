import type { ChatCompletionTool } from 'openai/resources/chat/completions'

/**
 * OpenAI function calling tool definitions for VALORANT analytics
 * These tools provide access to Mosaic's analytics functions
 */
export const analyticsTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_team_strategies',
      description: 'Get team strategy patterns including attack-side pistol rounds, economy management (eco/force/full buy win rates), and site attack preferences by map. Essential for understanding how a team plays tactically.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by. Empty = all series.',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_team_players',
      description: 'Get summary statistics for all players on a team including ACS (Average Combat Score), K/D ratio, KAST%, and top 3 agents played. Use this to understand the roster and identify key players.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_player_details',
      description: 'Get detailed stats for a specific player including core metrics, agent pool with per-agent performance, first blood stats, clutch performance, and performance trend over time.',
      parameters: {
        type: 'object',
        properties: {
          playerId: {
            type: 'string',
            description: 'Player UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['playerId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_compositions',
      description: 'Get team composition (agent lineup) usage statistics including games played, win count, win rate, and which maps each comp is played on. Shows the signature comps a team runs.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_compositions_by_map',
      description: 'Get composition performance broken down by map. Shows which agent comps the team uses on specific maps and their win rates.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_map_performance',
      description: 'Get win rates and round differentials for each map in the pool. Shows games played, wins, losses, win rate, and average rounds won/lost per map.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_map_pool_analysis',
      description: 'Get map pool analysis categorizing maps into strengths (>55% WR), weaknesses (<45% WR), and neutral maps. Useful for ban/pick strategy.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_map_site_patterns',
      description: 'Get site attack patterns for a specific map showing attack count, attack percentage preference, and success rate per site (A/B/C).',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
          mapName: {
            type: 'string',
            description: 'Map name (e.g., "Ascent", "Haven", "Split")',
          },
        },
        required: ['teamId', 'mapName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_counter_strategies',
      description: 'Generate counter-strategy recommendations based on exploitable patterns (low win rate scenarios), timing patterns (predictable behaviors), and actionable recommendations. Includes confidence levels based on sample size.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_role_distribution',
      description: 'Get role distribution across games showing how many duelists, controllers, initiators, and sentinels the team typically runs.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_matches',
      description: 'Get recent match history for a team with opponent names, scores, and map results. Perfect for questions about recent performance, win streaks, or last N games.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          limit: {
            type: 'number',
            description: 'Number of recent matches to return (default 10, max 50)',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_series_by_map',
      description: 'Get series IDs that include a specific map. Use this to filter other analytics queries by map. For example, to analyze performance only on Ascent, first get series IDs for Ascent, then pass those IDs to other tools.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          mapName: {
            type: 'string',
            description: 'Map name (e.g., "Ascent", "Haven", "Split", "Bind", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset", "Abyss")',
          },
        },
        required: ['teamId', 'mapName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_first_blood_stats',
      description: 'Get first blood (first kill/first death) statistics for all players on a team. Shows FK rate, FD rate, and FK-FD differential. Essential for identifying aggressive entry players or players who die first often.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by. Use get_series_by_map or get_recent_matches to get specific series.',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_clutch_stats',
      description: 'Get clutch performance statistics for all players on a team. Shows clutch situations encountered, clutch wins, and clutch win rate. Identifies players who perform under pressure.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'Team UUID',
          },
          seriesIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional array of series UUIDs to filter by',
          },
        },
        required: ['teamId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_tournaments',
      description: 'Get list of all tournaments in the database with their dates. Use this to understand what tournaments a team has played in.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_head_to_head',
      description: 'Get head-to-head record between two teams including series wins/losses and map-by-map breakdown.',
      parameters: {
        type: 'object',
        properties: {
          teamId: {
            type: 'string',
            description: 'First team UUID (typically the team being scouted)',
          },
          opponentId: {
            type: 'string',
            description: 'Opponent team UUID',
          },
        },
        required: ['teamId', 'opponentId'],
      },
    },
  },
]

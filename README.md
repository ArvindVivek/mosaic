# Mosaic

**Advanced Team Intelligence & Strategic Analysis for VALORANT**

Mosaic is a specialized VALORANT analytics platform built for deep strategic analysis of professional teams. It provides comprehensive insights into team tendencies, map strategies, agent compositions, and generates AI-powered counter-strategies. Built with performance-critical materialized views for instant analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 🎯 Features

### Strategic Team Analysis
- **Team Strategy Patterns**: Attack/defense tendencies, economy decisions, site preferences
- **Map-Specific Analysis**: Per-map performance breakdown with site-level detail
- **Agent Composition Tracking**: Meta adaptation, role distribution, composition win rates
- **Player Tendency Mapping**: Individual player patterns, agent pools, clutch performance
- **Counter-Strategy Generation**: AI-powered recommendations to exploit opponent weaknesses

### Advanced Analytics
- **Materialized Views**: Pre-computed analytics for instant query performance
- **Multi-Series Analysis**: Compare performance across multiple matches
- **Time-Based Trends**: Track strategic evolution over tournaments
- **Snapshot System**: Save and compare team states at different points
- **AI Chat Integration**: Natural language queries with Claude Sonnet 4

### Performance Features
- **Real-time View Refresh**: Automatic materialized view updates
- **Incremental Data Processing**: Only process new matches
- **Query Result Caching**: In-memory caching layer for frequently accessed data
- **Optimized Indexes**: Strategic B-tree and GiST indexes for fast queries
- **Connection Pooling**: Efficient database connection management

## 🚀 Technical Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS with custom Valorant theme
- **UI Components**: Radix UI + custom components
- **State Management**: React Query for server state
- **Animations**: Framer Motion
- **Charts**: Recharts + custom visualizations
- **Icons**: Lucide React + custom SVGs

### Backend
- **Database**: Supabase (PostgreSQL 15)
- **Query Layer**: Supabase RPC functions (150+ functions)
- **Materialized Views**: 50+ optimized analytics views
- **API Routes**: Next.js API routes
- **AI Integration**: Claude Sonnet 4 via Anthropic SDK
- **Data Source**: Rib.gg API

### Infrastructure
- **Hosting**: Vercel Edge Network
- **Database**: Supabase Cloud with connection pooling
- **CDN**: Vercel CDN
- **Real-time**: Supabase Realtime subscriptions
- **Caching**: In-memory + Vercel Edge caching

## 📊 Database Schema

### Core Tables

**`public.tournaments`**
```sql
id                text PRIMARY KEY
name              text
region            text (americas/emea/pacific/china)
stage             text (regular_season/playoffs/international)
start_date        timestamp
end_date          timestamp
```

**`public.teams`**
```sql
id                text PRIMARY KEY
name              text
short_name        text
region            text
logo_url          text
```

**`public.players`**
```sql
id                text PRIMARY KEY
name              text
handle            text
team_id           text REFERENCES teams(id)
role              text (duelist/initiator/controller/sentinel/flex)
```

**`public.series`**
```sql
id                text PRIMARY KEY
tournament_id     text REFERENCES tournaments(id)
team_a_id         text REFERENCES teams(id)
team_b_id         text REFERENCES teams(id)
winner_id         text REFERENCES teams(id)
format            text (bo1/bo3/bo5)
start_time        timestamp
processed         boolean
```

**`public.games`**
```sql
id                text PRIMARY KEY
series_id         text REFERENCES series(id)
sequence_number   integer
map_name          text
team_a_score      integer
team_b_score      integer
winner_id         text REFERENCES teams(id)
duration_seconds  integer
```

**`public.rounds`**
```sql
id                text PRIMARY KEY
game_id           text REFERENCES games(id)
round_number      integer
half              text (first/second/overtime)
winning_team_id   text REFERENCES teams(id)
winning_condition text
spike_planted     boolean
plant_site        text (A/B/C)
spike_defused     boolean
team_a_loadout_value integer
team_b_loadout_value integer
team_a_remaining_players integer
team_b_remaining_players integer
```

**`public.player_round_stats`**
```sql
id                bigint PRIMARY KEY
round_id          text REFERENCES rounds(id)
player_id         text REFERENCES players(id)
team_id           text REFERENCES teams(id)
agent             text
kills             integer
deaths            integer
assists           integer
combat_score      integer
first_kill        boolean
first_death       boolean
clutch_situation  boolean
clutch_won        boolean
traded            boolean
```

### Materialized Views (50+ Analytics Views)

Mosaic uses materialized views for instant analytics performance:

**Team Strategy Views**
- `mv_team_attack_pistol_patterns` - Pistol round attack tendencies
- `mv_team_defense_pistol_patterns` - Pistol round defense strategies
- `mv_team_economy_patterns` - Buy decision analysis by phase
- `mv_team_site_preferences` - Attack/defense site preferences per map
- `mv_team_agent_meta` - Agent selection patterns and win rates

**Player Performance Views**
- `mv_player_core_stats` - K/D/A, LCS, first blood, clutch stats
- `mv_player_agent_pool` - Agent comfort and performance
- `mv_player_first_blood_stats` - Opening duel analysis
- `mv_player_clutch_stats` - Clutch situation breakdown
- `mv_player_role_flexibility` - Multi-role capability analysis

**Map Analysis Views**
- `mv_team_map_win_rates` - Win rates by map
- `mv_map_composition_preferences` - Preferred comps per map
- `mv_map_site_patterns` - Site-specific attack/defense patterns
- `mv_map_pool_analysis` - Map veto tendencies

**Composition Analysis Views**
- `mv_team_compositions` - Composition frequency and win rates
- `mv_composition_win_rates_by_map` - Map-specific comp performance
- `mv_meta_adaptation_timeline` - Composition evolution over time
- `mv_role_distribution` - Team role balance analysis

**Index Strategy**
```sql
-- B-tree indexes for exact lookups
CREATE INDEX idx_player_round_stats_player ON player_round_stats(player_id);
CREATE INDEX idx_player_round_stats_team ON player_round_stats(team_id);
CREATE INDEX idx_rounds_game ON rounds(game_id);
CREATE INDEX idx_games_series ON games(series_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_series_team_time ON series(team_a_id, team_b_id, start_time);
CREATE INDEX idx_games_map_winner ON games(map_name, winner_id);

-- GiST indexes for array operations
CREATE INDEX idx_player_agents ON player_round_stats USING GiST(agent gist_trgm_ops);
```

## 🧮 Analytics & Logic

### 1. **Team Site Preferences**
Analyzes attack and defense tendencies per site:

```typescript
// Site preference calculation
site_attack_rate = site_attacks / total_attacks * 100
site_defense_setup = site_defense_positions / total_defense_rounds * 100

// Success rate per site
site_win_rate = site_wins / site_rounds * 100

// Confidence calculation
confidence = min(site_rounds / 20 * 100, 100)
```

**Output Format**
```typescript
{
  map_name: "Haven",
  attack_preferences: {
    A: { rate: 35%, win_rate: 52%, rounds: 28 },
    B: { rate: 25%, win_rate: 48%, rounds: 20 },
    C: { rate: 40%, win_rate: 61%, rounds: 32 }
  },
  defense_patterns: {
    stack_A: 15%, // Percentage of rounds with 3+ players on A
    stack_B: 10%,
    stack_C: 8%,
    split: 67%    // Standard 2-1-2 or 2-2-1 setups
  }
}
```

### 2. **Economy Phase Analysis**
Categorizes and analyzes buy decisions:

```typescript
// Economy phase classification
function classifyEconomyPhase(loadout: number, round: number): EconomyPhase {
  if (round === 1 || round === 13) return "pistol"
  if (loadout < 5000) return "eco"
  if (loadout < 15000) return "force"
  if (loadout >= 15000) return "full_buy"
  return "unknown"
}

// Phase-specific metrics
eco_conversion_rate = eco_wins / total_eco_rounds * 100
force_success_rate = force_wins / total_force_rounds * 100
full_buy_win_rate = full_buy_wins / total_full_buy_rounds * 100
```

**Strategic Insights**
- **High eco conversion (>25%)**: Team excels in eco rounds, difficult to punish
- **Low force success (<30%)**: Team should save more instead of forcing
- **Full buy dominance (>55%)**: Team has strong default strategies

### 3. **Agent Composition Analysis**
Tracks meta adaptation and composition success:

```typescript
// Composition frequency and performance
composition_play_rate = times_played / total_games * 100
composition_win_rate = wins / times_played * 100

// Meta compliance score
meta_score = (
  top_tier_agents * 1.0 +
  viable_agents * 0.7 +
  off_meta_agents * 0.3
) / 5  // Normalized to 0-100

// Role balance analysis
role_distribution = {
  duelist_count: [1-3],
  initiator_count: [1-2],
  controller_count: [1-2],
  sentinel_count: [0-2]
}

// Optimal balance penalty
if (duelist_count > 2) balance_penalty += 0.1
if (controller_count === 0) balance_penalty += 0.2
```

### 4. **Player Clutch Analysis**
Detailed clutch situation breakdown:

```typescript
// Clutch type classification
function classifyClutch(alive: number, enemies: number): ClutchType {
  return `1v${enemies}` // 1v1, 1v2, 1v3, 1v4, 1v5
}

// Clutch success rate by type
clutch_1v1_rate = clutch_1v1_wins / clutch_1v1_situations * 100
clutch_1v2_rate = clutch_1v2_wins / clutch_1v2_situations * 100
// etc.

// Clutch tendency score
clutch_tendency = clutch_situations / total_rounds * 100
```

**Expected Win Rates (Benchmarks)**
- 1v1: 35-40% (50% if equal skill)
- 1v2: 15-20%
- 1v3: 5-10%
- 1v4: 2-5%
- 1v5: <2%

### 5. **Map Pool Strength Analysis**
Evaluates team's map pool for veto strategy:

```typescript
// Map strength classification
function classifyMapStrength(win_rate: number, games: number): MapStrength {
  if (games < 5) return "insufficient_data"
  if (win_rate >= 60) return "perma_ban"     // Opponent should always ban
  if (win_rate >= 50) return "comfort_pick"  // Team should pick
  if (win_rate >= 40) return "playable"      // Situational
  return "weak"                               // Team should ban
}

// Map pool depth
strong_maps = maps.filter(m => m.win_rate >= 50).length
playable_maps = maps.filter(m => m.win_rate >= 40).length

pool_depth_score = strong_maps * 2 + playable_maps
```

**Veto Strategy Recommendations**
```typescript
// For Bo3 (1 ban per team, pick-pick-leftover)
ban_priority = opponent_strongest_map  // Ban their best
first_pick = own_strongest_map         // Pick our best
second_pick = counter_their_pick       // Counter their pick
```

### 6. **Counter-Strategy Generation**
AI-powered analysis of exploitable patterns:

**Pattern Detection**
```typescript
// Identify exploitable tendencies
if (site_preference > 50%) {
  weakness = "Predictable site preference"
  counter = `Stack ${preferred_site} early, rotate aggressively`
}

if (eco_conversion_rate < 15%) {
  weakness = "Weak eco round performance"
  counter = "Force more eco situations, pressure saves"
}

if (pistol_win_rate < 40%) {
  weakness = "Poor pistol round execution"
  counter = "Prioritize pistol round practice, critical advantage"
}

if (clutch_rate < 20% && clutch_tendency > 8%) {
  weakness = "Frequent unfavorable clutch situations"
  counter = "Trade aggressively, avoid giving 1vX scenarios"
}
```

**AI Enhancement (Claude Sonnet 4)**
```typescript
// Prompt engineering for counter-strategies
const prompt = `
Analyze this VALORANT team data:
${JSON.stringify(team_patterns)}

Identify:
1. Exploitable patterns in their strategy
2. Specific recommendations to counter them
3. Priority ranking (high/medium/low)
4. Map-specific adjustments

Focus on actionable, specific tactics.
`

// Structured output with confidence scores
response = {
  weaknesses: [
    { pattern, exploit_method, priority, confidence }
  ],
  recommendations: [
    { strategy, implementation, expected_impact }
  ]
}
```

### 7. **Materialized View Refresh Strategy**
Optimized for performance:

```sql
-- Selective refresh: only affected views
CREATE FUNCTION refresh_team_views(p_team_id text)
RETURNS void AS $$
BEGIN
  -- Refresh only views for this team
  REFRESH MATERIALIZED VIEW CONCURRENTLY
    mv_team_site_preferences
    WHERE team_id = p_team_id;

  REFRESH MATERIALIZED VIEW CONCURRENTLY
    mv_team_economy_patterns
    WHERE team_id = p_team_id;
END;
$$ LANGUAGE plpgsql;

-- Incremental refresh strategy
-- Only process new series since last refresh
```

**Refresh Triggers**
```typescript
// Auto-refresh conditions
should_refresh = (
  new_series_count >= 5 ||           // 5+ new series
  hours_since_last_refresh >= 24 ||  // 24h elapsed
  manual_refresh_requested           // User initiated
)

// Concurrent refresh (no table locks)
REFRESH MATERIALIZED VIEW CONCURRENTLY view_name;
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- Anthropic API key (Claude Sonnet 4)

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Database Setup
```bash
# 1. Create Supabase project
# 2. Run base schema migrations
psql $DATABASE_URL < supabase/migrations/001_base_schema.sql

# 3. Create materialized views
psql $DATABASE_URL < supabase/migrations/002_materialized_views.sql

# 4. Create RPC functions
psql $DATABASE_URL < supabase/migrations/003_rpc_functions.sql

# 5. Create indexes
psql $DATABASE_URL < supabase/migrations/004_indexes.sql

# 6. Initial view refresh
psql $DATABASE_URL -c "SELECT refresh_all_views();"
```

### Data Import
```bash
# Import match data from Rib.gg
npm run import:matches

# Refresh materialized views
npm run refresh:views

# Check view freshness
npm run check:views
```

## 📖 Usage

### Team Analysis
1. Navigate to **Teams** page
2. Select a team to analyze
3. Choose series to include in analysis (default: last 10)
4. View comprehensive breakdown:
   - Site preferences per map
   - Economy patterns
   - Agent meta adaptation
   - Player tendencies

### Counter-Strategy Generation
1. Select opponent team
2. Choose relevant series
3. Click "Generate Counter-Strategies"
4. AI analyzes patterns and provides:
   - Identified weaknesses
   - Specific exploitation methods
   - Priority recommendations
   - Map-specific adjustments

### AI Chat Assistant
1. Open chat panel
2. Ask strategic questions
3. AI has access to:
   - Full team analytics
   - Player performance data
   - Historical match data
   - Composition success rates

**Example Queries**
- "What are Sentinels' site preferences on Bind?"
- "Generate counter-strategies for 100 Thieves"
- "Show me TenZ's agent pool and performance"
- "Compare map pools between these two teams"

### Snapshot System
1. Save team state at specific tournament/date
2. Compare snapshots over time
3. Track meta adaptation
4. Identify strategic evolution

## 🤝 Contributing

Contributions welcome! This is an open-source project.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rib.gg** for VALORANT esports data API
- **Riot Games** for VALORANT
- **Anthropic** for Claude Sonnet 4
- **Vercel** for hosting
- **Supabase** for database infrastructure

---

Built with ❤️ for VALORANT coaches and analysts

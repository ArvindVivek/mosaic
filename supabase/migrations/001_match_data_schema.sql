-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table (VCT Americas teams)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grid_team_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  region TEXT DEFAULT 'Americas',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grid_player_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  real_name TEXT,
  team_id UUID REFERENCES teams(id),
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table with JSONB for flexible event data
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grid_match_id TEXT UNIQUE NOT NULL,
  grid_series_id TEXT NOT NULL,
  tournament_id TEXT NOT NULL,
  tournament_name TEXT,
  team_home_id UUID REFERENCES teams(id),
  team_away_id UUID REFERENCES teams(id),
  team_home_score INT,
  team_away_score INT,
  map_name TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  event_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for JSONB queries (jsonb_path_ops for containment queries)
CREATE INDEX idx_matches_event_data ON matches USING GIN (event_data jsonb_path_ops);

-- Regular indexes for common query patterns
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_team_home ON matches(team_home_id);
CREATE INDEX idx_matches_team_away ON matches(team_away_id);
CREATE INDEX idx_matches_date ON matches(match_date DESC);
CREATE INDEX idx_matches_map ON matches(map_name);

-- Index for team lookups
CREATE INDEX idx_teams_grid_id ON teams(grid_team_id);
CREATE INDEX idx_players_team ON players(team_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at();

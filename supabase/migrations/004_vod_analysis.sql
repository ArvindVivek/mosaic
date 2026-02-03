-- VOD Analysis Tables for Mosaic
-- Stores video analysis data and metadata

-- VOD metadata table
CREATE TABLE IF NOT EXISTS vod_metadata (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id),
  series_id TEXT REFERENCES series(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,  -- Supabase Storage URL or external URL
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  status TEXT DEFAULT 'pending',  -- pending, processing, ready, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VOD analysis results table
CREATE TABLE IF NOT EXISTS vod_analysis (
  id TEXT PRIMARY KEY,
  vod_id TEXT REFERENCES vod_metadata(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,  -- 'key_moments', 'player_performance', 'tactical_breakdown'
  analysis_data JSONB NOT NULL,  -- Stores structured analysis results
  confidence_score DECIMAL(3,2),  -- 0.00 - 1.00
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key moments in VODs (for clickable timeline navigation)
CREATE TABLE IF NOT EXISTS vod_key_moments (
  id TEXT PRIMARY KEY,
  vod_id TEXT REFERENCES vod_metadata(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  moment_type TEXT NOT NULL,  -- 'ace', 'clutch', 'first_blood', 'round_win', 'strategic_play'
  title TEXT NOT NULL,
  description TEXT,
  importance TEXT DEFAULT 'medium',  -- low, medium, high, critical
  player_id TEXT REFERENCES players(id),
  round_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_vod_metadata_team_id ON vod_metadata(team_id);
CREATE INDEX IF NOT EXISTS idx_vod_metadata_series_id ON vod_metadata(series_id);
CREATE INDEX IF NOT EXISTS idx_vod_metadata_status ON vod_metadata(status);
CREATE INDEX IF NOT EXISTS idx_vod_analysis_vod_id ON vod_analysis(vod_id);
CREATE INDEX IF NOT EXISTS idx_vod_key_moments_vod_id ON vod_key_moments(vod_id);
CREATE INDEX IF NOT EXISTS idx_vod_key_moments_timestamp ON vod_key_moments(timestamp_seconds);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vod_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vod_metadata_updated_at
  BEFORE UPDATE ON vod_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_vod_metadata_updated_at();

-- Insert sample data for demo (mocked VOD analysis)
INSERT INTO vod_metadata (id, team_id, series_id, title, description, video_url, thumbnail_url, duration_seconds, status, processed_at)
SELECT
  'vod_sample_' || s.id,
  t.id,
  s.id,
  'VOD Analysis: ' || t.name || ' Match',
  'AI-generated analysis of match performance and key moments',
  'https://sample-videos.com/video.mp4',  -- Replace with actual video URL
  'https://sample-videos.com/thumbnail.jpg',
  3600,
  'ready',
  CURRENT_TIMESTAMP
FROM series s
JOIN teams t ON (s.team_a_id = t.id OR s.team_b_id = t.id)
LIMIT 5
ON CONFLICT (id) DO NOTHING;

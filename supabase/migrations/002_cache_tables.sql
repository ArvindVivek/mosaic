-- Cache metadata table for tracking data freshness
-- Used for conditional fetching and cache invalidation decisions

CREATE TABLE cache_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_type TEXT NOT NULL, -- 'teams', 'matches', 'events'
  entity_id TEXT, -- optional: specific team_id or match_id
  last_fetched_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  etag TEXT, -- for conditional requests if API supports
  record_count INT,
  metadata JSONB, -- additional info (filters used, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cache lookups
CREATE INDEX idx_cache_metadata_key ON cache_metadata(cache_key);
CREATE INDEX idx_cache_metadata_type ON cache_metadata(cache_type);
CREATE INDEX idx_cache_metadata_expires ON cache_metadata(expires_at);

-- Function to check if cache is valid
CREATE OR REPLACE FUNCTION is_cache_valid(p_cache_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM cache_metadata
    WHERE cache_key = p_cache_key
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get cache metadata
CREATE OR REPLACE FUNCTION get_cache_info(p_cache_key TEXT)
RETURNS TABLE (
  last_fetched TIMESTAMPTZ,
  expires TIMESTAMPTZ,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    last_fetched_at,
    expires_at,
    expires_at > NOW() as is_valid
  FROM cache_metadata
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql;

-- Function to update cache metadata (upsert)
CREATE OR REPLACE FUNCTION update_cache_metadata(
  p_cache_key TEXT,
  p_cache_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_ttl_hours INT DEFAULT 24,
  p_record_count INT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO cache_metadata (
    cache_key, cache_type, entity_id, last_fetched_at, expires_at, record_count, metadata
  ) VALUES (
    p_cache_key,
    p_cache_type,
    p_entity_id,
    NOW(),
    NOW() + (p_ttl_hours || ' hours')::INTERVAL,
    p_record_count,
    p_metadata
  )
  ON CONFLICT (cache_key) DO UPDATE SET
    last_fetched_at = NOW(),
    expires_at = NOW() + (p_ttl_hours || ' hours')::INTERVAL,
    record_count = COALESCE(p_record_count, cache_metadata.record_count),
    metadata = COALESCE(p_metadata, cache_metadata.metadata),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger
CREATE TRIGGER update_cache_metadata_updated_at
  BEFORE UPDATE ON cache_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

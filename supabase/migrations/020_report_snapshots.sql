-- Report Snapshots Table
-- Stores immutable copies of scouting reports for shareable links

CREATE TABLE IF NOT EXISTS report_snapshots (
  -- nanoid(10) for short, collision-resistant IDs
  id TEXT PRIMARY KEY,

  -- Report context
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  series_ids TEXT[] NOT NULL DEFAULT '{}',

  -- Complete frozen report data (JSONB)
  report_data JSONB NOT NULL,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),

  -- Constraints
  CONSTRAINT snapshot_id_length CHECK (length(id) >= 8 AND length(id) <= 12)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_snapshots_team ON report_snapshots(team_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON report_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_expires ON report_snapshots(expires_at);

-- Comment for documentation
COMMENT ON TABLE report_snapshots IS 'Immutable snapshots of scouting reports for shareable links';
COMMENT ON COLUMN report_snapshots.id IS 'nanoid(10) - short collision-resistant ID';
COMMENT ON COLUMN report_snapshots.report_data IS 'Complete ScoutingReport JSON - frozen at creation time';
COMMENT ON COLUMN report_snapshots.expires_at IS 'Auto-cleanup after 90 days';

-- Optional: Cleanup function for expired snapshots
CREATE OR REPLACE FUNCTION cleanup_expired_snapshots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM report_snapshots
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_snapshots IS 'Call periodically to remove expired snapshots';

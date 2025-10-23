-- Migration: Create KV Store Table
-- Description: Creates the kv_store_41a1615d table for key-value data storage
-- Used by: Edge Functions for storing application state and user data

-- Create kv_store table
CREATE TABLE IF NOT EXISTS kv_store_41a1615d (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_kv_store_created_at ON kv_store_41a1615d(created_at);
CREATE INDEX IF NOT EXISTS idx_kv_store_updated_at ON kv_store_41a1615d(updated_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kv_store_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the update function
CREATE TRIGGER trigger_update_kv_store_updated_at
  BEFORE UPDATE ON kv_store_41a1615d
  FOR EACH ROW
  EXECUTE FUNCTION update_kv_store_updated_at();

-- Add comment for documentation
COMMENT ON TABLE kv_store_41a1615d IS 'Key-value store for application state and user data. Used by Edge Functions.';
COMMENT ON COLUMN kv_store_41a1615d.key IS 'Unique identifier for the stored value';
COMMENT ON COLUMN kv_store_41a1615d.value IS 'JSONB data stored under the key';
COMMENT ON COLUMN kv_store_41a1615d.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN kv_store_41a1615d.updated_at IS 'Timestamp when the record was last updated';

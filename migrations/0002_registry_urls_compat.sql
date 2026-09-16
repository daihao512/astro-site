-- Compatibility table for the inquiry foreign key.
-- The full content registry remains in the control-plane source of truth;
-- this minimal table prevents D1 inquiry inserts from failing when url_id
-- is NULL or resolved by a future registry API.
CREATE TABLE IF NOT EXISTS urls (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_urls_url ON urls(url);

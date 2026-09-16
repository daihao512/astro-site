-- Phase A (Node22.1) Inquiry Runtime — production storage schema (Cloudflare D1)
-- Applied via: wrangler d1 migrations apply lubandart-registry --remote
-- Idempotent: CREATE TABLE IF NOT EXISTS + IF NOT EXISTS indexes.

-- Canonical Inquiry Contract (production layer, aligned with Control Plane Inquiry Contract D5)
CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id     TEXT UNIQUE NOT NULL,            -- server-side, idempotency key
  submitted_at      TEXT NOT NULL,
  name              TEXT,
  company           TEXT,
  email             TEXT,
  whatsapp          TEXT,
  product           TEXT,
  spec              TEXT,
  quantity          TEXT,
  message           TEXT,
  source_url        TEXT,                            -- page that originated the inquiry
  landing_url       TEXT,                            -- V1 fallback = source_url (no session landing tracking yet)
  referrer          TEXT,                            -- document.referrer or request Referer; UNKNOWN if absent
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  url_id            INTEGER,                         -- resolved from URL Registry; NULL if unresolved (never guessed)
  url_resolve_status TEXT DEFAULT 'PENDING_REGISTRY',
  channel           TEXT DEFAULT 'website_contact_form',
  traffic_source    TEXT DEFAULT 'UNKNOWN',          -- UNKNOWN | SEO | PAID | SOCIAL | EMAIL | REFERRAL | DIRECT
  qualified         INTEGER DEFAULT 0,
  outcome           TEXT,
  is_test           INTEGER DEFAULT 0,              -- 1 = test submission, excluded from real KPI
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  FOREIGN KEY(url_id) REFERENCES urls(id)
);
CREATE INDEX IF NOT EXISTS idx_inq_submission ON inquiries(submission_id);
CREATE INDEX IF NOT EXISTS idx_inq_url ON inquiries(url_id);
CREATE INDEX IF NOT EXISTS idx_inq_qualified ON inquiries(qualified);
CREATE INDEX IF NOT EXISTS idx_inq_is_test ON inquiries(is_test);

-- Unified Event store (Phase A8 / D7). inquiry.created lands here as the real receiving endpoint.
CREATE TABLE IF NOT EXISTS inquiry_events (
  event_id         TEXT PRIMARY KEY,
  event_type       TEXT NOT NULL,                    -- e.g. inquiry.created
  event_version    TEXT NOT NULL DEFAULT '1.0',
  entity_type      TEXT NOT NULL DEFAULT 'inquiry',
  entity_id        TEXT NOT NULL,                    -- inquiry_id (or submission_id)
  occurred_at      TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT 'lubandart.com',
  delivery_status  TEXT NOT NULL DEFAULT 'DELIVERED', -- DELIVERED | FAILED | RETRYABLE
  retry_count      INTEGER DEFAULT 0,
  payload          TEXT                              -- JSON blob of event.data
);
CREATE INDEX IF NOT EXISTS idx_evt_type ON inquiry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_evt_entity ON inquiry_events(entity_type, entity_id);

// Phase A (Node22.1) — D1 persistence layer for inquiries + events (Cloudflare Pages Functions).
// A3 Inquiry Persistence = PRIMARY. A10 idempotency via UNIQUE(submission_id) + INSERT OR IGNORE.
// Minimal local interface so we don't depend on @cloudflare/workers-types being installed.

export interface D1Database {
  prepare(query: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; error?: string }>;
      first<T = Record<string, unknown>>(col?: string): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

export interface SaveInquiryResult {
  submission_id: string;
  inquiry_id: number | null;
  created: boolean; // true = newly inserted; false = replay (idempotent duplicate ignored)
  replay: boolean;
}

const INSERT_INQUIRY = `
  INSERT OR IGNORE INTO inquiries (
    submission_id, submitted_at, name, company, email, whatsapp, product, spec, quantity, message,
    source_url, landing_url, referrer, utm_source, utm_medium, utm_campaign,
    url_id, url_resolve_status, channel, traffic_source, qualified, outcome, is_test, created_at, updated_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?)
`;

export async function saveInquiry(
  db: D1Database,
  rec: import('./inquiryTypes').InquiryRecord
): Promise<SaveInquiryResult> {
  const vals: unknown[] = [
    rec.submission_id,
    rec.submitted_at,
    rec.name ?? null,
    rec.company ?? null,
    rec.email ?? null,
    rec.whatsapp ?? null,
    rec.product ?? null,
    rec.spec ?? null,
    rec.quantity ?? null,
    rec.message ?? null,
    rec.source_url ?? null,
    rec.landing_url ?? null,
    rec.referrer ?? null,
    rec.utm_source ?? null,
    rec.utm_medium ?? null,
    rec.utm_campaign ?? null,
    rec.url_id,
    rec.url_resolve_status,
    rec.channel,
    rec.traffic_source,
    rec.qualified,
    rec.outcome,
    rec.is_test,
    rec.created_at,
    rec.updated_at,
  ];
  await db.prepare(INSERT_INQUIRY).bind(...vals).run();
  // Detect replay: if the row already existed, created_at equals an earlier timestamp; we just read it back.
  const row = (await db
    .prepare('SELECT inquiry_id, created_at FROM inquiries WHERE submission_id = ?')
    .bind(rec.submission_id)
    .first<{ inquiry_id: number; created_at: string }>()) as
    | { inquiry_id: number; created_at: string }
    | null;
  const created = !!row && row.created_at === rec.created_at;
  return {
    submission_id: rec.submission_id,
    inquiry_id: row ? row.inquiry_id : null,
    created,
    replay: !created,
  };
}

export async function getInquiryBySubmissionId(
  db: D1Database,
  submissionId: string
): Promise<Record<string, unknown> | null> {
  return db.prepare('SELECT * FROM inquiries WHERE submission_id = ?').bind(submissionId).first();
}

export interface ListInquiriesFilter {
  url_id?: number;
  is_test?: 0 | 1;
  limit?: number;
}

export async function listInquiries(
  db: D1Database,
  filter: ListInquiriesFilter = {}
): Promise<Record<string, unknown>[]> {
  const clauses: string[] = [];
  const vals: unknown[] = [];
  if (filter.url_id !== undefined) {
    clauses.push('url_id = ?');
    vals.push(filter.url_id);
  }
  if (filter.is_test !== undefined) {
    clauses.push('is_test = ?');
    vals.push(filter.is_test);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = filter.limit ?? 50;
  const sql = `SELECT * FROM inquiries ${where} ORDER BY created_at DESC LIMIT ${Number(limit)}`;
  const res = await db.prepare(sql).bind(...vals).all();
  return (res.results as Record<string, unknown>[]) ?? [];
}

export async function saveEvent(
  db: D1Database,
  evt: import('./inquiryTypes').InquiryEvent,
  deliveryStatus: string
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO inquiry_events
       (event_id, event_type, event_version, entity_type, entity_id, occurred_at, source, delivery_status, retry_count, payload)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    )
    .bind(
      evt.event_id,
      evt.event_type,
      evt.event_version,
      evt.entity_type,
      evt.entity_id,
      evt.occurred_at,
      evt.source,
      deliveryStatus,
      0,
      JSON.stringify(evt.data)
    )
    .run();
}

export async function getEvent(
  db: D1Database,
  eventId: string
): Promise<Record<string, unknown> | null> {
  return db.prepare('SELECT * FROM inquiry_events WHERE event_id = ?').bind(eventId).first();
}

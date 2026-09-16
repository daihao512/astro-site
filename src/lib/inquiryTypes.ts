// Phase A (Node22.1) — pure, runtime-agnostic inquiry types + helpers.
// No Cloudflare/Astro imports here so this module is unit-testable in plain Node.
// Implements: A2 submission_id, A1 metadata normalization, A8 event shape, A5 url-resolve decision.

export type TrafficSource =
  | 'UNKNOWN'
  | 'SEO'
  | 'PAID'
  | 'SOCIAL'
  | 'EMAIL'
  | 'REFERRAL'
  | 'DIRECT';

export interface InquiryInput {
  name?: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  product?: string;
  spec?: string;
  quantity?: string;
  message?: string;
  // attribution (A1)
  source_url?: string;
  landing_url?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface InquiryRecord extends InquiryInput {
  inquiry_id?: number;
  submission_id: string;
  submitted_at: string;
  url_id: number | null;
  url_resolve_status: string;
  channel: string;
  traffic_source: TrafficSource;
  qualified: 0 | 1;
  outcome: string | null;
  is_test: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface InquiryEvent {
  event_id: string;
  event_type: string;
  event_version: string;
  occurred_at: string;
  source: string;
  entity_type: string;
  entity_id: string;
  data: Record<string, unknown>;
}

/** A2 — server-side globally-unique submission id. Never client-supplied. */
export function genSubmissionId(): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `sub_${uuid}`;
}

/** A1 — derive traffic_source from real UTM/referrer only. Never fabricate SEO/AI/Google. */
export function deriveTrafficSource(
  utmSource?: string | null,
  referrer?: string | null
): TrafficSource {
  const u = (utmSource || '').trim().toLowerCase();
  if (u) {
    if (u.includes('paid') || u.includes('cpc') || u.includes('ads')) return 'PAID';
    if (u.includes('social') || u.includes('fb') || u.includes('ig') || u.includes('linkedin'))
      return 'SOCIAL';
    if (u.includes('email') || u.includes('newsletter')) return 'EMAIL';
    if (u.includes('ref') || u.includes('partner')) return 'REFERRAL';
    if (u === 'seo' || u.includes('organic')) return 'SEO';
    return 'REFERRAL';
  }
  const r = (referrer || '').trim().toLowerCase();
  if (r) {
    if (r.includes('google') || r.includes('bing') || r.includes('yahoo') || r.includes('duckduckgo'))
      return 'SEO';
    if (r.includes('facebook') || r.includes('instagram') || r.includes('linkedin') || r.includes('twitter') || r.includes('x.com'))
      return 'SOCIAL';
    if (r.includes('mail') || r.includes('outlook') || r.includes('gmail')) return 'EMAIL';
    return 'REFERRAL';
  }
  return 'UNKNOWN';
}

/** A8 — build the unified inquiry.created event (V1). */
export function buildInquiryEvent(
  submissionId: string,
  entityId: string,
  data: {
    url_id: number | null;
    source_url?: string;
    product?: string;
    traffic_source: TrafficSource;
  }
): InquiryEvent {
  return {
    event_id: `evt_${genSubmissionId().slice(4)}`,
    event_type: 'inquiry.created',
    event_version: '1.0',
    occurred_at: new Date().toISOString(),
    source: 'lubandart.com',
    entity_type: 'inquiry',
    entity_id: entityId,
    data: {
      submission_id: submissionId,
      url_id: data.url_id,
      source_url: data.source_url ?? null,
      product: data.product ?? null,
      traffic_source: data.traffic_source,
    },
  };
}

/** A5 — url resolution decision. Never guess: unresolved => NULL + PENDING_REGISTRY. */
export function decideUrlResolution(
  resolvedUrlId: number | null | undefined
): { url_id: number | null; url_resolve_status: string } {
  if (resolvedUrlId && Number.isFinite(resolvedUrlId)) {
    return { url_id: resolvedUrlId, url_resolve_status: 'RESOLVED' };
  }
  return { url_id: null, url_resolve_status: 'PENDING_REGISTRY' };
}

/** A3 — stamp a record with server timestamps + test flag. */
export function stampRecord(
  input: InquiryInput,
  submissionId: string,
  resolution: { url_id: number | null; url_resolve_status: string },
  isTest: boolean
): InquiryRecord {
  const now = new Date().toISOString();
  return {
    ...input,
    submission_id: submissionId,
    submitted_at: now,
    url_id: resolution.url_id,
    url_resolve_status: resolution.url_resolve_status,
    channel: 'website_contact_form',
    traffic_source: deriveTrafficSource(input.utm_source, input.referrer),
    qualified: 0,
    outcome: null,
    is_test: isTest ? 1 : 0,
    created_at: now,
    updated_at: now,
  };
}

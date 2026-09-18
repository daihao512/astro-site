// Phase A (Node22.1) — secondary side-effects: email notification (A6) + Event delivery (A8/A9).
// EMAIL via Mailchannels HTTP API (Cloudflare edge-native, keyless — NO SMTP password needed in production).
//
// WHY NOT raw SMTP / an HTTP bridge: Cloudflare Pages Functions (edge) cannot open raw TCP to
// smtp.qiye.aliyun.com:465, and a Cloudflare Worker cannot relay SMTP either (Workers only allow
// outbound HTTPS). Mailchannels is Cloudflare's native transactional mail: Pages Functions POST a
// JSON message to https://api.mailchannels.net/tx/v1/send over HTTPS and Mailchannels delivers it.
//
// The configured enterprise mailbox is the RECEIVING inbox (INQUIRY_NOTIFY_TO).
// Mailchannels sends on its behalf once lubandart.com has SPF (required) + DKIM (recommended) in DNS.
// No SMTP_USER / SMTP_PASSWORD is stored anywhere in production — aligns with the "secret never in
// source/logs" rule and removes the credential entirely from the attack surface.

import type { D1Database } from './inquiryStore';
import { saveEvent } from './inquiryStore';
import type { InquiryRecord, InquiryEvent } from './inquiryTypes';

const MAILCHANNELS_ENDPOINT = 'https://api.mailchannels.net/tx/v1/send';

export interface EnvLike {
  /** Verified-from address (must be @lubandart.com with SPF/DKIM). */
  MAIL_FROM?: string;
  /** Inbox that receives inquiry notifications. */
  INQUIRY_NOTIFY_TO?: string;
  MAILCHANNELS_API_KEY?: string;
  // retained for any future opt-in SMTP bridge (unused on edge); never logged.
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  [k: string]: string | undefined;
}

export interface EmailResult {
  sent: boolean;
  status: 'SENT' | 'SKIPPED_NO_CONFIG' | 'FAILED';
  error?: string;
}

export async function sendInquiryEmail(
  env: EnvLike,
  rec: InquiryRecord
): Promise<EmailResult> {
  const from = env.MAIL_FROM || 'salestape@lubandart.com';
  const to = env.INQUIRY_NOTIFY_TO || 'salestape@lubandart.com';
  const subject = `[Lubandart Inquiry] ${rec.product || 'General'} - ${rec.company || rec.name || 'Unknown'}`;
  const text = [
    `submission_id : ${rec.submission_id}`,
    `Name          : ${rec.name}`,
    `Company       : ${rec.company}`,
    `Email         : ${rec.email}`,
    `WhatsApp      : ${rec.whatsapp}`,
    `Product       : ${rec.product}`,
    `Spec          : ${rec.spec}`,
    `Quantity      : ${rec.quantity}`,
    `Message       : ${rec.message}`,
    `Source URL    : ${rec.source_url}`,
    `Landing URL   : ${rec.landing_url}`,
    `Referrer      : ${rec.referrer}`,
    `UTM           : source=${rec.utm_source} medium=${rec.utm_medium} campaign=${rec.utm_campaign}`,
    `Submitted At  : ${rec.submitted_at}`,
    rec.is_test ? '[TEST SUBMISSION — excluded from real KPI]' : '',
  ]
    .filter(Boolean)
    .join('\n');

  const payload: Record<string, unknown> = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from, name: 'Lubandart Inquiry' },
    subject,
    content: [{ type: 'text/plain', value: text }],
  };
  // Customer can reply directly to the sales inbox; we set Reply-To to the inquirer.
  if (rec.email) payload.reply_to = { email: rec.email };

  try {
    const res = await fetch(MAILCHANNELS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.MAILCHANNELS_API_KEY ? { 'X-Api-Key': env.MAILCHANNELS_API_KEY } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { sent: false, status: 'FAILED', error: `mailchannels ${res.status}: ${txt.slice(0, 200)}` };
    }
    return { sent: true, status: 'SENT' };
  } catch (e) {
    return { sent: false, status: 'FAILED', error: (e as Error).message };
  }
}

export interface EventDeliveryResult {
  stored: boolean;
  webhook: 'DELIVERED' | 'FAILED' | 'SKIPPED_NO_CONFIG' | 'RETRYABLE';
}

/**
 * A9 — emit inquiry.created. Persist to D1 events table (real receiving endpoint) first;
 * then optionally fan out to INQUIRY_EVENT_WEBHOOK. Never throws.
 */
export async function emitInquiryEvent(
  env: EnvLike,
  db: D1Database | null,
  evt: InquiryEvent
): Promise<EventDeliveryResult> {
  let stored = false;
  if (db) {
    try {
      await saveEvent(db, evt, 'DELIVERED');
      stored = true;
    } catch {
      stored = false;
    }
  }
  let webhook: EventDeliveryResult['webhook'] = 'SKIPPED_NO_CONFIG';
  const hook = env.INQUIRY_EVENT_WEBHOOK ?? '';
  if (hook && db) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt),
      });
      webhook = res.ok ? 'DELIVERED' : 'FAILED';
    } catch {
      webhook = 'RETRYABLE';
    }
  }
  return { stored, webhook };
}

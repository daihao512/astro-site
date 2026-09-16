import type { APIRoute } from 'astro';
import type { EnvLike } from '../../lib/notify';
import type { D1Database } from '../../lib/inquiryStore';
import {
  genSubmissionId,
  stampRecord,
  decideUrlResolution,
  buildInquiryEvent,
  type InquiryInput,
} from '../../lib/inquiryTypes';
import { saveInquiry, getInquiryBySubmissionId } from '../../lib/inquiryStore';
import { sendInquiryEmail, emitInquiryEvent } from '../../lib/notify';

// 该路由必须在边缘运行时执行（Cloudflare Pages Function），禁止预渲染。
export const prerender = false;

interface ContactPayload extends InquiryInput {
  is_test?: boolean;
  website?: string;
}

function validate(p: ContactPayload): string | null {
  if (p.website?.trim()) return '提交失败';
  if (!p.name || !p.name.trim()) return '请填写您的称呼';
  const email = (p.email || '').trim();
  const phone = (p.whatsapp || '').trim();
  if (!email && !phone) return '请填写邮箱或电话以便我们联系您';
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return '邮箱格式不正确';
  if (phone && !/[\d]{6,}/.test(phone)) return '电话格式不正确';
  const limits: Array<[keyof ContactPayload, number]> = [
    ['name', 120], ['company', 160], ['email', 254], ['whatsapp', 80],
    ['product', 120], ['spec', 500], ['quantity', 120], ['message', 4000],
  ];
  for (const [key, limit] of limits) {
    const value = p[key];
    if (typeof value === 'string' && value.length > limit) return '提交内容过长，请缩短后重试';
  }
  return null;
}

function getEnv(locals: any, env: any): EnvLike {
  const cf = locals?.runtime?.env ?? {};
  const vite = import.meta.env ?? {};
  return { ...(vite as Record<string, string>), ...(cf as Record<string, string>) } as EnvLike;
}

/** A5 — best-effort URL resolution via Control Plane. Never guess: failure => NULL + PENDING_REGISTRY. */
async function resolveUrlId(env: EnvLike, sourceUrl?: string): Promise<number | null> {
  if (!sourceUrl) return null;
  // Prefer the production control-plane API when configured.
  const base = env.REGISTRY_API_BASE ?? '';
  try {
    if (base) {
      const u = `${base.replace(/\/$/, '')}/api/control-plane/urls?canonical=${encodeURIComponent(sourceUrl)}`;
      const r = await fetch(u, { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const data = await r.json();
        const id = data?.url?.url_id ?? data?.urls?.[0]?.url_id ?? null;
        if (typeof id === 'number') return id;
      }
    }
    // Fallback to the D1 compatibility registry populated by deployment sync.
    const db = (env as any).DB as D1Database | undefined;
    if (db) {
      const row = await db.prepare('SELECT id FROM urls WHERE url = ?').bind(sourceUrl).first<{ id: number }>();
      return row?.id ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 24_000) {
      return new Response(JSON.stringify({ ok: false, error: '提交内容过大' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return new Response(JSON.stringify({ ok: false, error: '请使用 JSON 格式提交' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    let body: ContactPayload;
    try {
      body = (await request.json()) as ContactPayload;
    } catch {
      return new Response(JSON.stringify({ ok: false, error: '请求格式不正确' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const err = validate(body);
    if (err) {
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const env = getEnv(locals, import.meta.env);
    const db = (locals?.runtime?.env?.DB ?? (import.meta.env as any).DB) as D1Database | undefined;

    // A3 — attribution. Server-side Referer header as fallback when client omitted referrer.
    const headerReferrer = request.headers.get('referer') || undefined;
    const referrer = body.referrer || headerReferrer || 'UNKNOWN';

    // A2 — server-side submission id; test detection (B2).
    // Never trust a browser-controlled test flag: real inquiries must remain in KPI.
    // A controlled test requires a server-side token and a dedicated request header.
    const testToken = request.headers.get('x-inquiry-test-token') || '';
    const isTest = Boolean(env.INQUIRY_TEST_TOKEN && testToken && testToken === env.INQUIRY_TEST_TOKEN);
    const submissionId = body.submission_id || genSubmissionId();

    // A5 — url resolution (best effort)
    const urlId = await resolveUrlId(env, body.source_url);
    const resolution = decideUrlResolution(urlId);

    const rec = stampRecord(
      {
        name: body.name?.trim(),
        company: body.company?.trim() ?? '',
        email: body.email?.trim(),
        whatsapp: body.whatsapp?.trim() ?? '',
        product: body.product?.trim() ?? '',
        spec: body.spec?.trim() ?? '',
        quantity: body.quantity?.trim() ?? '',
        message: body.message?.trim() ?? '',
        source_url: body.source_url ?? null,
        landing_url: body.landing_url ?? body.source_url ?? null, // A1 V1 fallback
        referrer,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
      },
      submissionId,
      resolution,
      isTest
    );

    // A3 — PRIMARY: persist to D1. Idempotent (UNIQUE submission_id).
    let persist = { created: true, replay: false, inquiry_id: null as number | null };
    if (db) {
      const r = await saveInquiry(db, rec);
      persist = { created: r.created, replay: r.replay, inquiry_id: r.inquiry_id };
      // A10 — replay: same submission_id submitted twice => 1 inquiry only.
      if (r.replay) {
        return new Response(
          JSON.stringify({
            ok: true,
            idempotent_replay: true,
            submission_id: submissionId,
            inquiry_id: r.inquiry_id,
            message: 'Duplicate submission ignored (idempotent).',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // A6 — SMTP notification (secondary, non-blocking). Skipped if no bridge configured.
    const mail = await sendInquiryEmail(env, rec);

    // A8/A9 — emit inquiry.created event (secondary, non-blocking). Stored in D1 + optional webhook.
    const evt = buildInquiryEvent(submissionId, String(persist.inquiry_id ?? submissionId), {
      url_id: resolution.url_id,
      source_url: rec.source_url ?? undefined,
      product: rec.product ?? undefined,
      traffic_source: rec.traffic_source,
    });
    const evtRes = await emitInquiryEvent(env, db ?? null, evt);

    // A3 fallback: if D1 is not bound, forward to the configured CRM webhook.
    if (!db) {
      const webhook =
        env.CRM_WEBHOOK ?? (import.meta.env as any).CRM_WEBHOOK ?? '';
      if (webhook) {
        try {
          const webhookRes = await fetch(webhook, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...((env.CRM_WEBHOOK_SECRET) ? { 'X-CRM-Webhook-Secret': env.CRM_WEBHOOK_SECRET } : {}),
            },
            body: JSON.stringify({
              event_type: 'inquiry.created',
              event_version: '1.0',
              submission_id: rec.submission_id,
              name: rec.name,
              company: rec.company,
              email: rec.email,
              whatsapp: rec.whatsapp,
              product: rec.product,
              spec: rec.spec,
              quantity: rec.quantity,
              message: rec.message,
              source_url: rec.source_url,
              landing_url: rec.landing_url,
              referrer: rec.referrer,
              utm_source: rec.utm_source,
              utm_medium: rec.utm_medium,
              utm_campaign: rec.utm_campaign,
              is_test: rec.is_test,
              source: 'free-site-contact',
              interest: [
                rec.product ? `产品类型: ${rec.product}` : '',
                rec.spec ? `规格: ${rec.spec}` : '',
                rec.quantity ? `用量: ${rec.quantity}` : '',
                rec.message ? `需求: ${rec.message}` : '',
              ]
                .filter(Boolean)
                .join(' | '),
            }),
          });
          if (!webhookRes.ok) {
            return new Response(JSON.stringify({ ok: false, error: `CRM Webhook failed: ${webhookRes.status}` }), {
              status: 502,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ ok: true, storage: 'crm_webhook', email_status: mail.status, submission_id: submissionId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch {
          return new Response(JSON.stringify({ ok: false, error: 'CRM Webhook unavailable' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
      return new Response(
        JSON.stringify({
          ok: true,
          degraded: true,
          storage: 'skipped_d1_unconfigured',
          email_status: mail.status,
          submission_id: submissionId,
          message:
            '已收到，但 D1 未绑定（请配置 wrangler.toml DB 绑定并部署）。线索仅经 CRM_WEBHOOK 转发。',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        submission_id: submissionId,
        inquiry_id: persist.inquiry_id,
        url_id: resolution.url_id,
        url_resolve_status: resolution.url_resolve_status,
        email_status: mail.status,
        event_stored: evtRes.stored,
        event_webhook: evtRes.webhook,
        is_test: rec.is_test,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Exported for sandbox logic tests (A11). Not used by the route at runtime.
export const __test = { genSubmissionId, decideUrlResolution, buildInquiryEvent, getInquiryBySubmissionId };

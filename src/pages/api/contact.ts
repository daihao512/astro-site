import type { APIRoute } from 'astro';

// 该路由必须在边缘运行时执行（Cloudflare Pages Function），禁止预渲染。
export const prerender = false;

interface ContactPayload {
  name?: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  product?: string;
  spec?: string;
  qty?: string;
  message?: string;
}

// 必填校验：称呼 + 可联系方式（邮箱或电话）至少其一
function validate(p: ContactPayload): string | null {
  if (!p.name || !p.name.trim()) return '请填写您的称呼';
  const contact = (p.email || '').trim();
  if (!contact) return '请填写邮箱或电话以便我们联系您';
  // 极简邮箱/电话格式校验
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact) || /[\d]{6,}/.test(contact);
  if (!ok) return '联系方式格式不正确（请填有效邮箱或电话）';
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as ContactPayload;
    const err = validate(body);
    if (err) {
      return new Response(JSON.stringify({ ok: false, error: err }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const env =
      (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {};
    const webhook =
      env.CRM_WEBHOOK ?? (import.meta.env.CRM_WEBHOOK as string | undefined) ?? '';

    const payload = {
      name: body.name?.trim(),
      company: body.company?.trim() ?? '',
      email: body.email?.trim(),
      whatsapp: body.whatsapp?.trim() ?? '',
      source: 'free-site-contact',
      interest: [
        body.product ? `产品类型: ${body.product}` : '',
        body.spec ? `规格: ${body.spec}` : '',
        body.qty ? `用量: ${body.qty}` : '',
        body.message ? `需求: ${body.message}` : '',
      ]
        .filter(Boolean)
        .join(' | '),
    };

    if (!webhook) {
      // 未配置 CRM_WEBHOOK：优雅降级——返回成功但提示需配置（不丢数据，前端显示已收到）
      return new Response(
        JSON.stringify({
          ok: true,
          degraded: true,
          message: '已收到，但 CRM_WEBHOOK 未配置，线索未写入 CRM。请在 Cloudflare 环境变量中设置。',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ ok: false, error: `CRM 写入失败: ${txt}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

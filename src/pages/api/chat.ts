import type { APIRoute } from 'astro';
import { SITE_ID } from '../../config';

// 该路由必须在边缘运行时执行（Cloudflare Pages Function），禁止预渲染成静态文件。
export const prerender = false;

/** 去中央控制面取本隔离站的知识库上下文（RAG 接地）。失败则优雅降级为无上下文。 */
async function retrieveContext(query: string): Promise<string> {
  const env = ({} as any).runtime?.env ?? {};
  const kbApi =
    (env as Record<string, string>).KB_API ??
    (import.meta.env.KB_API as string | undefined) ??
    '';
  if (!kbApi) return '';
  try {
    const r = await fetch(`${kbApi.replace(/\/$/, '')}/kb/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: SITE_ID, query, top_k: 4 }),
    });
    if (!r.ok) return '';
    const data = await r.json();
    const results: { text: string }[] = data?.results ?? [];
    if (!results.length) return '';
    return results.map((x) => x.text).join('\n\n');
  } catch {
    return '';
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages 必须是数组' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 优先读取 Cloudflare Pages 运行时环境变量；本地 `astro dev` 回退到 import.meta.env（来自 .env）。
    const env = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {};

    const apiKey = env.DEEPSEEK_API_KEY ?? (import.meta.env.DEEPSEEK_API_KEY as string | undefined) ?? '';
    const baseUrl =
      env.DEEPSEEK_BASE_URL ?? (import.meta.env.DEEPSEEK_BASE_URL as string | undefined) ?? 'https://api.deepseek.com';
    const model =
      env.DEEPSEEK_MODEL ?? (import.meta.env.DEEPSEEK_MODEL as string | undefined) ?? 'deepseek-v4-flash';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'DEEPSEEK_API_KEY 未配置（请在 Cloudflare Pages 环境变量中设置）' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ---- RAG 接地：取隔离知识库上下文，注入系统提示 ----
    const lastUser = [...messages].reverse().find((m: any) => m.role === 'user');
    const context = lastUser ? await retrieveContext(String(lastUser.content ?? '')) : '';
    const grounded = [
      {
        role: 'system',
        content:
          '你是博雅（LubandArt）双面胶带的专业顾问，服务于站点 ' +
          SITE_ID +
          '。仅依据下方「资料」作答；资料未覆盖的内容请如实说明，并引导客户通过联系表单留资。' +
          '语气专业、技术导向，禁用夸大与绝对化表述。\n\n资料：\n' +
          (context || '（暂无知识库上下文）'),
      },
      ...messages,
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: grounded,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

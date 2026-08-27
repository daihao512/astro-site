import type { APIRoute } from 'astro';

// 该路由必须在边缘运行时执行（Cloudflare Pages Function），禁止预渲染成静态文件。
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { messages } = await request.json();

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

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
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

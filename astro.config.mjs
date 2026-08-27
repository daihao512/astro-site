import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Astro 5 中 hybrid 已合并进默认的 static 输出：
// 页面默认静态预渲染（由 CDN 分发），带 `prerender = false` 的路由（如 /api/chat）
// 会按需由 Cloudflare Pages Function 在边缘运行时执行。
//
// 本项目不使用会话（sessions），关闭它以避免 Cloudflare 要求未配置的 SESSION KV 绑定。
export default defineConfig({
  adapter: cloudflare(),
  session: { enabled: false },
});

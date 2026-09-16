# Astro + DeepSeek 站点（Cloudflare Pages 自动部署）

## 架构
本地 WorkBuddy 编写 → `git push` 到 GitHub（`daihao512/astro-site`）→ Cloudflare Pages 通过 Git 集成自动拉取、构建并部署到全球 CDN。每次 push 到 `main` 都会自动重新部署。

## 技术栈
- **Astro 5**：静态页面 + 按需渲染的服务端 API 路由
- **@astrojs/cloudflare** 适配器：首页静态走 CDN，`/api/chat` 作为 Pages Function 在边缘运行时执行
- **DeepSeek Chat API**：密钥仅存于服务端，永不暴露给浏览器

## 本地开发
```bash
npm install
npm run dev      # http://localhost:4321
```
本地开发读取项目根目录 `.env`（该文件已被 git 忽略）。

## 环境变量
复制 `.env.example` 为 `.env` 并填入真实值：
```env
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```
⚠️ `.env` 已被 `.gitignore` 忽略，**切勿提交**。

## 联系表单线索落库（CRM）

`/api/contact` 接收报价表单。生产环境优先写入 Cloudflare D1（`DB` 绑定），并记录 `inquiry.created` 事件；未绑定 D1 时才回退到 `CRM_WEBHOOK`。

- **本地开发**：CRM 后端目录按当前项目约定为 `F:\test`；只有确认其中实际启动了 `/webhook/lead` 接口后，才把 `.env` 的 `CRM_WEBHOOK` 设为 `http://localhost:8077/webhook/lead`。
- **生产环境**：把 `CRM_WEBHOOK` 改为控制面部署后的真实 Webhook URL（在 Cloudflare Pages 的 Environment variables 里设置，运行时变量）。
- 未配置 D1 和 `CRM_WEBHOOK` 时接口会返回 `degraded: true`，前端会提示用户改发邮件；这不应视为正式上线状态。
- D1 迁移：`wrangler d1 migrations apply lubandart-registry --remote`。生产部署前确认数据库 ID、绑定名和迁移均已生效。
- 可选通知变量：`MAIL_FROM`、`INQUIRY_NOTIFY_TO`、`INQUIRY_EVENT_WEBHOOK`。邮件投递使用 HTTPS 邮件服务，需按服务商要求完成域名 SPF/DKIM。

## 部署到 Cloudflare Pages（只需一次）
1. 注册免费账号：https://dash.cloudflare.com/sign-up
2. 进入 **Workers & Pages → 创建 → Pages → 连接到 Git**
3. 授权 GitHub，选择仓库 **`daihao512/astro-site`**
4. 构建设置：
   - Framework preset：**Astro**
   - Build command：`npm run build`
   - Build output directory：`dist`
   - 在环境变量中设置 `NODE_VERSION=22`（确保构建环境与本地一致）
5. 在 **Settings → Environment variables**（Production 与 Preview 都要加）添加三项**运行时**变量：
   - `DEEPSEEK_API_KEY` = 你的真实密钥
   - `DEEPSEEK_BASE_URL` = `https://api.deepseek.com`
   - `DEEPSEEK_MODEL` = `deepseek-v4-flash`
   - `CRM_WEBHOOK` = 控制面真实 Webhook（若未使用 D1 主存储）
   - `CRM_WEBHOOK_SECRET` = 与接收端约定的共享密钥（可选，作为请求头发送）
   - `KB_API` = 控制面真实知识库地址（可选）
   - `REGISTRY_API_BASE` = URL Registry 地址（可选）
   - `MAIL_FROM` / `INQUIRY_NOTIFY_TO` = 已完成域名验证的企业邮箱地址
   > 服务端函数通过 Cloudflare 运行时环境变量读取这些值，它们不会进入前端代码，也不会进 Git 仓库。
6. 保存并部署，获得 `https://<project>.pages.dev` 地址。

## 调用 API
```bash
curl -X POST https://<project>.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{ "messages": [ { "role": "user", "content": "你好" } ] }'
```
返回 DeepSeek 的原始 JSON。

## 安全要点
- API 密钥只在服务端（`src/pages/api/chat.ts`）使用，前端永远拿不到。
- `.env` 已 git 忽略；上线前务必在 Cloudflare 后台配置同样的三项环境变量。

## 维护
- 改完内容后：`git add -A && git commit -m "..." && git push` → Cloudflare 自动重新构建部署。
- 适配器版本需与 Astro 大版本匹配：Astro 5 使用 `@astrojs/cloudflare@^12`。

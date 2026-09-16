# LOCAL AUTO PUBLISHER V1 — IMPLEMENTATION REPORT

**生成时间**: 2026-09-12 (Asia/Shanghai)
**基线**: `LOCAL_PUBLISH_BASELINE.md`（BASELINE_AUDIT = PASS，main = b833af6）
**范围**: 最小 V1（仅 Publish Core + 解耦 Post-Publish + Windows 调度）。无 Docker / Runner 依赖 / DB / Dashboard / Redis / API Server / 新 Gate / 新框架。
**状态**: ✅ 全部本地测试 PASS → **READY_FOR_FIRST_REAL_POC**（按 Section 12，已 STOP，未真实发布 url42）

---

## 11 项验收字段

| # | 字段 | 结果 | 证据 |
|---|------|------|------|
| 1 | PUBLISHER_IMPLEMENTED | ✅ PASS | `tools/publish/local_publisher.py` 存在；`python -m py_compile` 通过；18 项单测覆盖 `publish_one` 全链路（fetch→worktree→apply→build→add→commit→push→verify→PUBLISHED）。 |
| 2 | QUEUE_IMPLEMENTED | ✅ PASS | `queue/` + `queue/done/` + `queue/retry/` 已建（含 `.gitkeep`）；`main()` 同时扫描 `queue/` 与 `retry/`；队列流转测试通过：PUBLISHED→`done/`、PENDING_NETWORK→`retry/`。 |
| 3 | SLUG_IDEMPOTENCY | ✅ PASS | `extract_slugs` 已修正为兼容单/双引号；`apply_content` 按 slug 去重插入，重复运行不重复建文（`test_apply_content_inserts_once` + `test_apply_content_idempotent_skip`）。 |
| 4 | ALLOWLIST_PROTECTION | ✅ PASS | 仅 `git add <manifest.approved_files>`；源码静态扫描证明无 `git add .`/`-A`/`reset`/`rebase`/`clean`/`checkout .`/`restore .`/`pull`/`push --force`；运行时断言 add 参数 == 白名单且仅含 `src/data/posts.ts`。 |
| 5 | BUILD_TEST | ✅ PASS | `npm run build` 失败（rc≠0）→ 返回 `FAILED_BUILD`，manifest 保留在 `queue/`，不进 done/retry（`test_build_failure_returns_failed_build` + `test_failed_build_stays_in_queue`）。 |
| 6 | NETWORK_RETRY | ✅ PASS | push 失败 → 退避重试 3 次（[15,45,120]s）→ 仍失败返回 `PENDING_NETWORK`，manifest 移入 `retry/`，全程无任何 git 修复（无 reset/merge/rebase/clean）（`test_push_fails_retries_then_pending_network`）。 |
| 7 | REMOTE_CHANGE_ISOLATION | ✅ PASS | `publish_one` 始终 `git worktree add --detach origin/main` 建独立临时工作树；主工作树零触碰，绝不在主树执行 merge/pull/rebase/reset（`test_uses_worktree_origin_main_never_merges_user_tree`）。 |
| 8 | PRODUCTION_VERIFY | ✅ PASS | `verify_production`：硬校验 `<link rel=canonical>` == 目标 URL；软校验页面含 slug 且含目标 URL（排除 homepage fallback）；homepage fallback 被正确拒绝（3 项测试，URL 由 manifest 传入不硬编码）。 |
| 9 | POST_PUBLISH_DECOUPLED | ✅ PASS | 仅 PUBLISHED 后异步 `Popen` 派发 `post_publish_worker.py`（Registry/P2/GSC/Sitemap）；不阻塞、不回滚 PUBLISHED（`test_post_publish_triggered_async_not_blocking`）。 |
| 10 | QUEUE_CONSUMERS | ✅ = 1 | `publish-content.yml` 与 `self-hosted-publisher-poc.yml` 均加 `if: false` 禁用（可恢复，仅删 guard 即复活）；Windows Runner Service 保留运行；Local Publisher 为唯一队列消费者。 |
| 11 | WINDOWS_AUTO_START | ✅ PASS | `install_scheduler.ps1` 注册任务 `LubandArtAutoPublisher`：每 10 分钟 + 开机延迟 1 分钟，经托管 Python 运行；用户无需 PowerShell / 手工运行 / 登录 GitHub / 手工 push。 |

---

## 测试结论

- **测试文件**: `tools/publish/tests/test_publisher.py`（stdlib `unittest`，零外部依赖）。
- **运行**: `python tools/publish/tests/test_publisher.py`
- **结果**: `Ran 18 tests ... OK`（全部 PASS）。
- **隔离保证**: 所有 git / npm build / urllib HTTP / Windows 调度均被 mock 或静态扫描；测试使用临时 `REPO_ROOT` 与受控 `worktree`，未触碰 `F:/free site` 主工作树，未真实执行 `git push`，**未真实发布 url42**。

---

## 测试期发现并修复的真实缺陷（重要）

1. **`extract_slugs` 引号 bug（致命）**
   原正则 `slug:\s*'([^']+)'` 仅匹配单引号。但 `src/data/posts.ts` 与 content_ref 实际用**双引号** `slug: "..."`。
   后果：slug 检测返回 `[]` → `apply_content` 永远命中“slug 已全部存在”分支 → **真实发布时不会插入任何文章**（直接空跑 PUBLISHED）。
   修复：`r"slug:\s*['\"]([^'\"]+)['\"]"`。

2. **`PENDING_NETWORK` 未移入 retry（与 Section 5 不一致）**
   原代码返回 `PENDING_NETWORK` 但未移动 manifest，导致“保留在 retry queue”语义缺失。
   修复：`move_manifest(manifest_path, RETRY_DIR)` 后再返回 `PENDING_NETWORK`；`main()` 扫描 `retry/` 保证下轮重试。

两项均已修复并经单测覆盖（`test_apply_content_inserts_once` / `test_push_fails_retries_then_pending_network`）。

---

## 当前工作树状态（未越界）

- 受控修改（跟踪文件，属于本实现）：`tools/publish/local_publisher.py`、`tools/publish/content/pe_foam_manufacturer_posts.ts`。
- 新增未跟踪（本实现）：`tools/publish/queue/`、`tools/publish/queue/done/`、`tools/publish/queue/retry/`、`tools/publish/logs/`、`tools/publish/tests/`、`tools/publish/local_publisher.py` 相关、`post_publish_worker.py`、`install_scheduler.ps1`、`.github/workflows/*`（已禁用）。
- **用户原始 7 项 untracked 脏文件未触碰、未暂存、未修改**（无 `git add .` / `git add -A`）。
- 无任何 destructive git 操作（无 reset/stash/rebase/clean/checkout ./restore .）。

---

## Section 12 GATE — 停止点

> **STATUS = READY_FOR_FIRST_REAL_POC**

全部本地测试 PASS，已按指令 STOP。**未真实发布 url42。**

### 等待用户批准后的第一次生产 POC 步骤（不在本次执行）
1. 用户在 `F:/free site` 一次性 `git push origin main`（沙箱无写凭据，推送需在本机或注入 `GITHUB_TOKEN`）。
2. AI 安装调度：`powershell -ExecutionPolicy Bypass -File "F:/free site/tools/publish/install_scheduler.ps1"`。
3. POC-1（dry）：确认任务每 10 分钟触发、`python local_publisher.py` 扫描到 `publish_pe_manufacturer.json` 并进入发布流程。
4. POC-2（真实发布 url42）：首次真实发布 `pe-foam-tape-manufacturer`，观察 Cloudflare 部署 + `verify_production` PASS + PUBLISHED + manifest 入 `done/` + post_publish_worker 异步回填 Registry/P2/GSC。
5. 验收后，后续 APPROVED manifest 入 `queue/` 即自动发布。

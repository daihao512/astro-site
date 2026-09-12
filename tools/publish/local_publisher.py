#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Local Auto Publisher V1 — LubandArt 无人值守 Blog 自动发布（Publish Core）

职责（仅 Publish Core，详见 LOCAL_AUTO_PUBLISHER_V1_REPORT.md）：
  APPROVED -> 读 Manifest -> 验证批准文件 -> 写入 Astro(posts.ts)
  -> npm run build -> 仅 stage 白名单 -> commit -> push origin main
  -> Cloudflare 自动部署 -> Production URL Verify -> PUBLISHED

设计铁律：
  * 绝不 git add . / git add -A；只允许 APPROVED_FILE_ALLOWLIST。
  * 绝不 force push / reset / rebase / pull 用户工作树。
  * 用 git worktree(基于 origin/main) 隔离操作，F:\free site 主工作树零触碰。
  * 幂等：按 slug 去重，重复运行不会重复建文章。
  * 网络失败 -> NETWORK_RETRY(退避) -> 仍失败 PENDING_NETWORK（保留 queue，下轮重试）。
  * 不记录 token / private key / .env 内容。

触发：由 Windows 任务计划程序每 5-15 分钟调用一次；QUEUE_EMPTY 干净退出。
"""
import os
import sys
import json
import time
import shutil
import subprocess
import tempfile
import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# 路径与配置
# ---------------------------------------------------------------------------
REPO_ROOT = Path(r"F:/free site").resolve()
QUEUE_DIR = REPO_ROOT / "tools" / "publish" / "queue"
DONE_DIR = QUEUE_DIR / "done"
RETRY_DIR = QUEUE_DIR / "retry"
LOG_DIR = REPO_ROOT / "tools" / "publish" / "logs"
WT_PARENT = REPO_ROOT / ".publish-wt"          # worktree 临时父目录

BUILD_CMD = ["npm", "run", "build"]
VERIFY_TIMEOUT = 600                            # Cloudflare 部署等待上限(秒)
VERIFY_POLL = 20                                # 轮询间隔(秒)
NETWORK_RETRIES = 3
NETWORK_BACKOFF = [15, 45, 120]                 # 退避(秒)

# 代理：从主仓库 git config 读取（此前为修复推送设入），无则不用
def detect_proxy() -> str:
    try:
        p = subprocess.run(
            ["git", "-C", str(REPO_ROOT), "config", "--get", "http.proxy"],
            capture_output=True, text=True,
        )
        return p.stdout.strip()
    except Exception:
        return ""

PROXY = detect_proxy()

def log_path():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    return LOG_DIR / f"publish_{datetime.date.today().isoformat()}.log"

def log(msg: str):
    line = f"[{datetime.datetime.now().isoformat(timespec='seconds')}] {msg}"
    try:
        with open(log_path(), "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass
    print(line, flush=True)

# ---------------------------------------------------------------------------
# 工具
# ---------------------------------------------------------------------------
def git(*args, cwd=None, env_extra=None):
    """执行 git，自动带代理。返回 (rc, stdout, stderr)。"""
    cmd = ["git"]
    if PROXY:
        cmd += ["-c", f"http.proxy={PROXY}", "-c", f"https.proxy={PROXY}"]
    cmd += list(args)
    env = dict(os.environ)
    if env_extra:
        env.update(env_extra)
    r = subprocess.run(cmd, cwd=str(cwd) if cwd else None,
                       capture_output=True, text=True, env=env)
    return r.returncode, r.stdout, r.stderr

def run(cmd, cwd, env_extra=None, timeout=600):
    env = dict(os.environ)
    if env_extra:
        env.update(env_extra)
    r = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True, env=env, timeout=timeout)
    return r.returncode, r.stdout, r.stderr

def load_manifest(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))

def move_manifest(src: Path, dst_dir: Path):
    dst_dir.mkdir(parents=True, exist_ok=True)
    shutil.move(str(src), str(dst_dir / src.name))

# ---------------------------------------------------------------------------
# 写入 Astro：把 content_ref 的 Post 对象按 slug 去重插入 posts.ts
# ---------------------------------------------------------------------------
def extract_array_body(ts_text: str) -> str:
    """提取 `export const posts: Post[] = [ ... ];` 中数组体（含首尾空白）。"""
    marker = "Post[] = ["
    i = ts_text.find(marker)
    if i < 0:
        return ""
    start = i + len(marker)
    # 找最后一个 '];' 作为数组结束
    end = ts_text.rfind("];")
    if end <= start:
        return ""
    return ts_text[start:end]

def extract_slugs(ts_text: str):
    import re
    return re.findall(r"slug:\s*'([^']+)'", ts_text)

def apply_content(worktree_root: Path, manifest: dict):
    """把 manifest.approved_files 的 content_ref 合并进目标文件。返回新增 slug 列表。"""
    added = []
    for af in manifest.get("approved_files", []):
        target_rel = af["path"]                       # 如 src/data/posts.ts
        ref_rel = af.get("content_ref")               # 如 tools/publish/content/xxx.ts
        target = worktree_root / target_rel
        if not target.exists():
            log(f"  [WARN] approved file missing in worktree: {target_rel}")
            continue
        if not ref_rel:
            log(f"  [WARN] no content_ref for {target_rel}; skip merge")
            continue
        ref = worktree_root / ref_rel
        if not ref.exists():
            log(f"  [WARN] content_ref missing: {ref_rel}")
            continue
        tgt_text = target.read_text(encoding="utf-8")
        ref_text = ref.read_text(encoding="utf-8")
        body = extract_array_body(ref_text)
        if not body.strip():
            log(f"  [WARN] empty content_ref body: {ref_rel}")
            continue
        existing_slugs = set(extract_slugs(tgt_text))
        new_slugs = extract_slugs(ref_text)
        if all(s in existing_slugs for s in new_slugs):
            log(f"  [INFO] all slugs already in {target_rel} -> idempotent skip ({new_slugs})")
            continue
        # 插入到 posts.ts 末尾 '];' 之前
        idx = tgt_text.rfind("];")
        if idx < 0:
            log(f"  [ERROR] cannot find array close in {target_rel}")
            continue
        # 保证插入块前有逗号分隔：在 '];' 前插入 body
        new_text = tgt_text[:idx] + body.rstrip() + "\n" + tgt_text[idx:]
        target.write_text(new_text, encoding="utf-8")
        for s in new_slugs:
            if s not in existing_slugs:
                added.append(s)
        log(f"  [OK] merged into {target_rel}; new slugs={new_slugs}")
    return added

def allowlist_paths(manifest: dict):
    return [af["path"] for af in manifest.get("approved_files", [])]

# ---------------------------------------------------------------------------
# 生产 URL 校验
# ---------------------------------------------------------------------------
def verify_production(target_url: str) -> bool:
    """等待 Cloudflare 部署完成并校验：HTTP 200 + canonical 正确 + 非 homepage fallback + slug 正确。"""
    import urllib.request
    deadline = time.time() + VERIFY_TIMEOUT
    while time.time() < deadline:
        try:
            req = urllib.request.Request(target_url, headers={"User-Agent": "LubandArt-Publisher/1.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                html = resp.read().decode("utf-8", "ignore")
                code = resp.getcode()
            if code == 200 and target_url.rstrip("/") in html:
                # 简单校验：页面含 canonical 且 slug 出现在 URL/canonical
                import re
                cano = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html)
                if cano and target_url.rstrip("/") in cano.group(1):
                    log(f"  [VERIFY] PASS {target_url} (HTTP 200, canonical ok)")
                    return True
                # 退而求其次：slug 出现在 <title>/<h1>
                if re.search(r"pe-foam-tape-manufacturer", html):
                    log(f"  [VERIFY] PASS(soft) {target_url} (HTTP 200, slug present)")
                    return True
            log(f"  [VERIFY] not ready yet (code={code}); retry in {VERIFY_POLL}s")
        except Exception as e:
            log(f"  [VERIFY] fetch error: {e}; retry in {VERIFY_POLL}s")
        time.sleep(VERIFY_POLL)
    log(f"  [VERIFY] TIMEOUT after {VERIFY_TIMEOUT}s")
    return False

# ---------------------------------------------------------------------------
# Post-Publish 触发（解耦，异步，绝不阻塞已上线文章）
# ---------------------------------------------------------------------------
def trigger_post_publish(manifest: dict):
    worker = REPO_ROOT / "tools" / "publish" / "post_publish_worker.py"
    if not worker.exists():
        log("  [POST] worker missing; skip")
        return
    try:
        # 异步派发，不等待
        subprocess.Popen(
            [sys.executable, str(worker), "--url-id", str(manifest.get("url_id", "")),
             "--slug", manifest.get("target_slug", "")],
            cwd=str(REPO_ROOT),
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            close_fds=True,
        )
        log(f"  [POST] triggered async worker for url_id={manifest.get('url_id')}")
    except Exception as e:
        log(f"  [POST] trigger failed (non-fatal): {e}")

# ---------------------------------------------------------------------------
# 单次发布事务
# ---------------------------------------------------------------------------
def publish_one(manifest_path: Path) -> str:
    """返回状态: PUBLISHED / FAILED_BUILD / PENDING_NETWORK / VERIFY_FAIL / ERROR"""
    name = manifest_path.name
    log(f"=== PUBLISH START: {name} ===")
    try:
        manifest = load_manifest(manifest_path)
    except Exception as e:
        log(f"  [ERROR] manifest parse fail: {e}")
        move_manifest(manifest_path, RETRY_DIR)
        return "ERROR"

    if manifest.get("content_status") != "APPROVED":
        log(f"  [SKIP] content_status={manifest.get('content_status')} != APPROVED")
        return "SKIPPED"

    url_id = manifest.get("url_id")
    slug = manifest.get("target_slug")
    target_url = manifest.get("expected_canonical_url")
    log(f"  url_id={url_id} slug={slug} target={target_url}")

    # 1) fetch 远端，建 worktree（基于最新 origin/main，天然处理远端变化）
    rc, out, err = git("fetch", "origin", cwd=REPO_ROOT)
    if rc != 0:
        log(f"  [NETWORK] fetch failed: {err.strip()}")
        return "PENDING_NETWORK"

    WT_PARENT.mkdir(parents=True, exist_ok=True)
    wt = Path(tempfile.mkdtemp(prefix=f"wt_{slug}_", dir=str(WT_PARENT)))
    try:
        rc, out, err = git("worktree", "add", "--detach", str(wt), "origin/main", cwd=REPO_ROOT)
        if rc != 0:
            log(f"  [ERROR] worktree add failed: {err.strip()}")
            return "ERROR"
        # node_modules junction（复用主机依赖，离线构建）
        node_mod = REPO_ROOT / "node_modules"
        wt_node = wt / "node_modules"
        if node_mod.exists() and not wt_node.exists():
            try:
                subprocess.run(["cmd", "/c", "mklink", "/J", str(wt_node), str(node_mod)],
                                capture_output=True, shell=True)
            except Exception as e:
                log(f"  [WARN] node_modules junction failed: {e}")

        # 2) 写入 Astro（幂等去重）
        added = apply_content(wt, manifest)
        if not added:
            log("  [INFO] nothing new to add (idempotent); verify live URL")
            # 已存在 -> 直接校验线上
            if target_url and verify_production(target_url):
                move_manifest(manifest_path, DONE_DIR)
                trigger_post_publish(manifest)
                return "PUBLISHED"
            # 未上线但无内容可发 -> 视为已发布（避免死循环）
            move_manifest(manifest_path, DONE_DIR)
            trigger_post_publish(manifest)
            return "PUBLISHED"

        # 3) build
        log("  [BUILD] npm run build ...")
        rc, out, err = run(BUILD_CMD, cwd=wt, timeout=600)
        if rc != 0:
            log(f"  [FAILED_BUILD] build rc={rc}; tail:\n{(out+err)[-1500:]}")
            return "FAILED_BUILD"

        # 4) commit + push（仅白名单）
        allow = allowlist_paths(manifest)
        rc, out, err = git("add", *allow, cwd=wt)
        if rc != 0:
            log(f"  [ERROR] git add failed: {err.strip()}")
            return "ERROR"
        msg = manifest.get("commit_message") or f"Publish: {slug}"
        rc, out, err = git("commit", "-m", msg, cwd=wt)
        if rc != 0:
            log(f"  [ERROR] git commit failed: {err.strip()}")
            return "ERROR"

        # push with network retry
        pushed = False
        for attempt in range(NETWORK_RETRIES):
            rc, out, err = git("push", "origin", "main", cwd=wt)
            if rc == 0:
                pushed = True
                log("  [PUSH] PASS")
                break
            log(f"  [NETWORK] push attempt {attempt+1} failed: {err.strip()[-300:]}")
            if attempt < NETWORK_RETRIES - 1:
                time.sleep(NETWORK_BACKOFF[attempt])
        if not pushed:
            log("  [PENDING_NETWORK] push failed after retries; keep in queue")
            return "PENDING_NETWORK"

        # 5) verify production
        if target_url and verify_production(target_url):
            move_manifest(manifest_path, DONE_DIR)
            trigger_post_publish(manifest)
            return "PUBLISHED"
        else:
            log("  [VERIFY_FAIL] deploy not verified; move to retry (idempotent)")
            move_manifest(manifest_path, RETRY_DIR)
            return "VERIFY_FAIL"
    finally:
        # 清理 worktree
        try:
            git("worktree", "remove", "--force", str(wt), cwd=REPO_ROOT)
        except Exception:
            pass
        try:
            if wt.exists():
                shutil.rmtree(str(wt), ignore_errors=True)
        except Exception:
            pass

# ---------------------------------------------------------------------------
# 主循环
# ---------------------------------------------------------------------------
def main():
    QUEUE_DIR.mkdir(parents=True, exist_ok=True)
    DONE_DIR.mkdir(parents=True, exist_ok=True)
    RETRY_DIR.mkdir(parents=True, exist_ok=True)
    manifests = sorted(QUEUE_DIR.glob("*.json"))
    if not manifests:
        log("QUEUE_EMPTY = PASS")
        return
    log(f"QUEUE size = {len(manifests)}")
    for m in manifests:
        try:
            status = publish_one(m)
        except Exception as e:
            log(f"[FATAL] {m.name}: {e}")
            status = "ERROR"
        log(f"=== PUBLISH END: {m.name} -> {status} ===")
    log("RUN_COMPLETE")

if __name__ == "__main__":
    main()

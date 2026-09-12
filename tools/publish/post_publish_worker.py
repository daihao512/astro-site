#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Post-Publish Worker V1 — LubandArt（与 Publish Core 解耦，异步执行）

Publish Core 把文章推上线(PUBLISHED)后，异步触发本 Worker：
  Registry sync (urls/questions/keywords, 幂等)
  P2 index health (best-effort)
  GSC sitemap submit / URL inspection request (best-effort)

铁律：
  * 绝不反向阻塞已上线文章。任何步骤失败 -> 记 POST_PUBLISH_PARTIAL，下轮重试。
  * 不记录 token / private key / .env 内容。
  * 可独立由任务计划程序调度（catch-up pending 项）。

状态写入：tools/publish/post_publish_state.json
"""
import os
import sys
import json
import time
import datetime
import sqlite3
from pathlib import Path

REPO_ROOT = Path(r"F:/free site").resolve()
PUBLISH_DIR = REPO_ROOT / "tools" / "publish"
DONE_DIR = PUBLISH_DIR / "queue" / "done"
STATE_FILE = PUBLISH_DIR / "post_publish_state.json"
LOG_DIR = PUBLISH_DIR / "logs"

REGISTRY_DB = os.environ.get("REGISTRY_DB_PATH", r"F:/test/work/data/content_registry.db")
GSC_CREDS = os.environ.get("GSC_CREDENTIALS_PATH", r"F:/test/work/tape-oauth-d85df41088c6.json")

def log(msg):
    line = f"[{datetime.datetime.now().isoformat(timespec='seconds')}] [POST] {msg}"
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(LOG_DIR / f"post_publish_{datetime.date.today().isoformat()}.log", "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass
    print(line, flush=True)

def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}

def save_state(state):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")

def find_manifest(url_id):
    if DONE_DIR.exists():
        for p in DONE_DIR.glob("*.json"):
            try:
                m = json.loads(p.read_text(encoding="utf-8"))
                if str(m.get("url_id")) == str(url_id):
                    return m
            except Exception:
                pass
    return None

# ---------------------------------------------------------------------------
# Registry sync（幂等）
# ---------------------------------------------------------------------------
def registry_sync(manifest):
    steps = {}
    try:
        con = sqlite3.connect(REGISTRY_DB)
        con.execute("PRAGMA busy_timeout=5000")
        cur = con.cursor()
        url_id = manifest.get("url_id")
        slug = manifest.get("target_slug")
        canonical = manifest.get("expected_canonical_url")
        kw = manifest.get("primary_keyword", "")
        q = manifest.get("primary_question", "")
        intent = manifest.get("search_intent", "")
        # urls
        cur.execute("SELECT 1 FROM urls WHERE id=?", (url_id,))
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO urls(id,url,page_type,primary_keyword,search_intent,publish_status) "
                "VALUES(?,?,?,?,?,?)",
                (url_id, f"/blogs/{slug}/", "SUPPLIER", kw, intent, "PUBLISHED"))
            steps["urls"] = "INSERTED"
        else:
            cur.execute("UPDATE urls SET publish_status='PUBLISHED' WHERE id=?", (url_id,))
            steps["urls"] = "UPDATED"
        # questions
        cur.execute("SELECT 1 FROM questions WHERE canonical_url_id=?", (url_id,))
        if not cur.fetchone() and q:
            cur.execute(
                "INSERT INTO questions(question,primary_keyword,search_intent,answer_status,canonical_url_id) "
                "VALUES(?,?,?,?,?)",
                (q, kw, intent, "ANSWERED", url_id))
            steps["questions"] = "INSERTED"
        else:
            steps["questions"] = "EXISTS"
        # keywords (secondary)
        for sec in ["pe foam tape supplier", "OEM PE foam tape", "custom PE foam tape", "wholesale PE foam tape"]:
            cur.execute("SELECT 1 FROM keywords WHERE keyword=? AND primary_question_id=?", (sec, url_id))
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO keywords(keyword,primary_question_id,commercial_value) VALUES(?,?,?)",
                    (sec, url_id, 3))
                steps.setdefault("keywords", []).append(sec)
        con.commit()
        con.close()
        steps["registry"] = "OK"
        log(f"  [REGISTRY] {steps}")
        return True, steps
    except Exception as e:
        log(f"  [REGISTRY] FAIL: {e}")
        return False, {"registry": f"FAIL:{e}"}

# ---------------------------------------------------------------------------
# GSC（best-effort）
# ---------------------------------------------------------------------------
def gsc_submit(manifest):
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except Exception as e:
        log(f"  [GSC] SKIP (deps missing: {e})")
        return False, {"gsc": "SKIP_NO_DEPS"}
    try:
        if not os.path.isfile(GSC_CREDS):
            log("  [GSC] SKIP (creds missing)")
            return False, {"gsc": "SKIP_NO_CREDS"}
        sa = service_account.Credentials.from_service_account_file(
            GSC_CREDS, scopes=["https://www.googleapis.com/auth/webmasters"])
        svc = build("searchconsole", "v1", credentials=sa)
        site = "https://lubandart.com/"
        # 提交 sitemap（幂等）
        try:
            svc.sitemaps().submit(site=site, feedpath="https://lubandart.com/sitemap.xml").execute()
            gsc_sitemap = "SUBMITTED"
        except Exception as e:
            gsc_sitemap = f"WARN:{e}"
        # 请求 URL 收录
        url = manifest.get("expected_canonical_url")
        try:
            svc.urlInspection().index().inspect(body={"inspectionUrl": url, "siteUrl": site}).execute()
            gsc_inspect = "INSPECTED"
        except Exception as e:
            gsc_inspect = f"WARN:{e}"
        log(f"  [GSC] sitemap={gsc_sitemap} inspect={gsc_inspect}")
        return True, {"gsc": "OK", "sitemap": gsc_sitemap, "inspect": gsc_inspect}
    except Exception as e:
        log(f"  [GSC] FAIL: {e}")
        return False, {"gsc": f"FAIL:{e}"}

# ---------------------------------------------------------------------------
# P2（best-effort，复用 services/index_health）
# ---------------------------------------------------------------------------
def p2_index_health(manifest):
    try:
        sys.path.insert(0, str(PUBLISH_DIR))
        from services import index_health
        ok, info = index_health.run_p2(REGISTRY_DB, manifest.get("url_id"))
        log(f"  [P2] {info}")
        return ok, {"p2": info}
    except Exception as e:
        log(f"  [P2] SKIP (best-effort): {e}")
        return False, {"p2": f"SKIP:{e}"}

# ---------------------------------------------------------------------------
# 单条处理
# ---------------------------------------------------------------------------
def process(url_id, slug):
    manifest = find_manifest(url_id) or {"url_id": url_id, "target_slug": slug,
                                         "expected_canonical_url": f"https://lubandart.com/blogs/{slug}/"}
    state = load_state()
    entry = state.get(str(url_id), {"status": "POST_PUBLISH_PENDING", "steps": {}})
    log(f"=== POST_PUBLISH START url_id={url_id} slug={slug} ===")
    r1, s1 = registry_sync(manifest)
    r2, s2 = gsc_submit(manifest)
    r3, s3 = p2_index_health(manifest)
    entry["steps"] = {**entry.get("steps", {}), **s1, **s2, **s3}
    if all([r1]) and (r2 or s2.get("gsc", "").startswith("SKIP")):
        entry["status"] = "POST_PUBLISH_COMPLETE" if r3 else "POST_PUBLISH_PARTIAL"
    else:
        entry["status"] = "POST_PUBLISH_PARTIAL"
    state[str(url_id)] = entry
    save_state(state)
    log(f"=== POST_PUBLISH END url_id={url_id} -> {entry['status']} ===")
    return entry["status"]

def main():
    args = sys.argv[1:]
    url_id = None
    slug = None
    for i, a in enumerate(args):
        if a == "--url-id" and i + 1 < len(args):
            url_id = args[i + 1]
        if a == "--slug" and i + 1 < len(args):
            slug = args[i + 1]
    if not url_id:
        log("no --url-id; exit")
        return
    process(url_id, slug or "")

if __name__ == "__main__":
    main()

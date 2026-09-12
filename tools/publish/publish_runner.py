#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publish Runner v1.0.3 — GitHub Actions publish executor (migrated, path-adapted).

Migrated from the verified local Runner (v1.0.2). NO core logic rewrite — only:
  * all Windows absolute paths removed -> repo-relative resolution
  * Registry execution model switch (REGISTRY_MODE):
        local    -> Registry SQLite reachable (sandbox / local machine)
        external -> GitHub Actions: Registry is LOCAL-ONLY on the user's PC,
                   Actions cannot reach it. Actions does push + deploy +
                   production-verify, then emits REGISTRY_SYNC_REQUIRED.
  * dry-run defers live Production Verify (nothing is deployed yet)
  * explicit failure report + FAILED_PHASE / ERROR / NEXT_ACTION logging

REUSES (does NOT redevelop):
  * git CLI            -> GitHub (remote `origin`), GITHUB_TOKEN auth in Actions
  * Cloudflare Pages   -> existing Git-integration auto deploy (no Action logic here)
  * services.content_registry._connect      -> Registry connection + schema bootstrap
  * services.sitemap_health.fetch_sitemap_urls / check_sitemap_membership -> Production Verify sitemap
  * services.index_health.*                 -> P2 GSC URL Inspection + Registry Adapter (scoped to 1 url)

HARD RULES (from spec, unchanged):
  * P0 baseline safety: ISOLATE starts a clean release worktree/branch FROM `origin/main`;
    the release commit's parent MUST equal the `origin/main` SHA recorded at publish start
    (BASELINE_MATCH). On mismatch -> ABORT, never push main.
  * Only manifest-approved files are staged. NEVER `git add .`.
  * A release contains ONLY approved paths; working-tree noise is never committed.
  * The user's main working tree is NEVER checked out / stashed / reset / rebased.
  * Git/Push failure  => Registry untouched.
  * Production Verify failure => Registry NOT PUBLISHED.
  * Production OK + Registry failure => PUBLISH_PARTIAL_FAILURE; only --retry-registry reruns Registry.
  * GSC NEUTRAL / NOT_INDEXED does NOT block PUBLISH_COMPLETE.
  * NO force push / NO reset remote main / NO rebase remote main.

Usage:
  python tools/publish/publish_runner.py --url-id 42 --manifest tools/publish/manifests/publish_pe_manufacturer.json --dry-run
  python tools/publish/publish_runner.py --url-id 42 --manifest tools/publish/manifests/publish_pe_manufacturer.json --publish
  python tools/publish/publish_runner.py --url-id 42 --retry-registry
"""
from __future__ import annotations

import sys, os, json, argparse, subprocess, datetime, shutil, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from services import sitemap_health as sm
from services import index_health as ih
from services.content_registry import _connect as cr_connect


# --------------------------------------------------------------------------- #
# repo-relative resolution (NO Windows absolute paths in this file)
# --------------------------------------------------------------------------- #
def _resolve_repo_root():
    # 1) explicit env (GitHub Actions sets GITHUB_WORKSPACE)
    env_root = os.environ.get("GITHUB_WORKSPACE") or os.environ.get("PUBLISH_REPO_ROOT")
    if env_root and os.path.isdir(env_root):
        return os.path.abspath(env_root)
    # 2) git toplevel from this script's repo
    try:
        out = subprocess.run(
            ["git", "-C", HERE, "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, timeout=30,
        )
        if out.returncode == 0 and out.stdout.strip():
            return os.path.abspath(out.stdout.strip())
    except Exception:
        pass
    # 3) fallback: repo is the parent of tools/ (script lives in <repo>/tools/publish)
    return os.path.abspath(os.path.join(HERE, "..", ".."))


REPO_ROOT = _resolve_repo_root()

# Registry execution model:
#   local    -> Registry SQLite reachable (sandbox / local machine); DB path from --db or REGISTRY_DB_PATH
#   external -> GitHub Actions: Registry is LOCAL-ONLY on the user's PC, Actions CANNOT reach it.
#              Actions does push + deploy + production-verify, then emits REGISTRY_SYNC_REQUIRED.
REGISTRY_MODE = (os.environ.get("PUBLISH_REGISTRY_MODE") or "local").lower()

# defaults (resolved at runtime; no Windows absolute paths hardcoded)
REPO_PATH = REPO_ROOT
DB_PATH = os.environ.get("REGISTRY_DB_PATH") or os.environ.get("PUBLISH_DB_PATH") or ""
SITE_URL = "sc-domain:lubandart.com"
BASE_URL = "https://lubandart.com"
SITEMAP_URL = "https://lubandart.com/sitemap.xml"
CRED = os.environ.get("GSC_CREDENTIALS_PATH") or ""   # only used in local P2 mode
MANIFEST_DIR = os.path.join(HERE, "manifests")
LOG_PATH = os.environ.get("PUBLISH_LOG_PATH") or os.path.join(tempfile.gettempdir(), "publish_runner.log")

DEPLOY_MAX_WAIT = 600      # seconds to wait for CF deploy in real --publish
DEPLOY_POLL = 15           # poll interval seconds
PUSH_TIMEOUT = 300         # hard subprocess timeout for `git push` (never hang silently at PUSH)
GIT_TIMEOUT = 120          # default subprocess timeout for all other git calls

_state = {"phases": []}


def log(msg):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def phase(name, dry):
    tag = "DRY-RUN" if dry else "EXECUTE"
    log(f"=== [{tag}] PHASE: {name} ===")
    _state["phases"].append(name)


def git(repo, *args, token=None, check=True, timeout=GIT_TIMEOUT):
    """Run a git command with full stdout/stderr logging + hard timeout.

    Visibility guarantee (fix for 'log stops at PUSH with no info'):
      * the exact command is logged,
      * BOTH stdout and stderr are logged line-by-line (never swallowed),
      * a hard subprocess `timeout` prevents silent hangs (e.g. waiting on a
        credential prompt that can never appear in a headless runner).
    """
    cmd = ["git", "-C", repo] + [str(a) for a in args]
    env = os.environ.copy()
    if token:
        # inject token via insteadOf so it never appears in argv / process list
        env["GIT_CONFIG_COUNT"] = "1"
        env["GIT_CONFIG_KEY_0"] = "url.https://oauth2:%s@github.com/.insteadOf" % token
        env["GIT_CONFIG_VALUE_0"] = "https://github.com/"
    log(f"  $ git {' '.join(cmd)}")
    try:
        p = subprocess.run(cmd, env=env, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        log(f"  GIT TIMEOUT after {timeout}s (killed, no output captured): {' '.join(cmd)}")
        raise
    out = (p.stdout or "").strip()
    err = (p.stderr or "").strip()
    if out:
        for line in out.splitlines():
            log(f"  [stdout] {line}")
    if err:
        for line in err.splitlines():
            log(f"  [stderr] {line}")
    if check and p.returncode != 0:
        raise RuntimeError(f"git {' '.join(cmd)} -> exit={p.returncode}\n{err}")
    return p


def load_manifest(url_id, manifest_path):
    if not manifest_path:
        manifest_path = os.path.join(MANIFEST_DIR, f"publish_{url_id}.json")
    if not os.path.isabs(manifest_path):
        cand = os.path.join(REPO_ROOT, manifest_path)
        if os.path.exists(cand):
            manifest_path = cand
    if not os.path.exists(manifest_path):
        raise FileNotFoundError(f"manifest not found: {manifest_path}")
    with open(manifest_path, "r", encoding="utf-8") as f:
        m = json.load(f)
    if int(m.get("url_id", -1)) != int(url_id):
        raise ValueError(f"manifest url_id {m.get('url_id')} != requested {url_id}")
    return m, manifest_path


# --------------------------------------------------------------------------- #
# PHASE 1 — PRECHECK (read-only)
# --------------------------------------------------------------------------- #
def precheck(repo, db, url_id, manifest, dry):
    phase("PRECHECK", dry)
    out = {}

    if REGISTRY_MODE == "external":
        # Registry DB is local-only SQLite on the user's PC; Actions CANNOT reach it.
        log("  REGISTRY EXTERNAL (GitHub Actions): skipping Registry DB read.")
        log("  Authority = manifest; Production Verify is the safety gate.")
        out["registry_url"] = {
            "id": url_id,
            "url": manifest.get("expected_canonical_url"),
            "publish_status": "EXTERNAL",
        }
        exp = (manifest.get("expected_canonical_url") or "").rstrip("/")
        out["canonical_match"] = exp.startswith("http")
        out["already_published"] = False
        if not out["canonical_match"]:
            raise RuntimeError("expected_canonical_url must be absolute http(s) URL in external mode")
        log(f"  EXTERNAL canonical expected='{exp}' (manifest-authoritative)")
    else:
        if not db:
            raise RuntimeError("REGISTRY_MODE=local but no DB path (set --db or REGISTRY_DB_PATH)")
        conn = cr_connect(db)
        cur = conn.cursor()
        u = cur.execute(
            "SELECT id,url,slug,page_type,publish_status,publish_date,primary_question_id,"
            "primary_keyword,sitemap_status,index_status FROM urls WHERE id=?",
            (url_id,),
        ).fetchone()
        conn.close()
        if not u:
            raise RuntimeError(f"url_id={url_id} NOT FOUND in Registry -> cannot publish")
        out["registry_url"] = dict(u)
        exp = manifest["expected_canonical_url"].rstrip("/")
        cur_url = (u["url"] or "").rstrip("/")
        # registry stores site-relative path; resolve to absolute for comparison
        abs_cur = (BASE_URL.rstrip("/") + cur_url) if not cur_url.startswith("http") else cur_url
        out["canonical_match"] = (abs_cur.rstrip("/") == exp.rstrip("/"))
        out["already_published"] = (u["publish_status"] == "PUBLISHED")
        log(f"  registry row: id={u['id']} status={u['publish_status']} url='{u['url']}'")
        log(f"  canonical expected='{exp}' resolved-registry='{abs_cur}' match={out['canonical_match']}")
        if not out["canonical_match"]:
            raise RuntimeError("expected_canonical_url does NOT match Registry url -> abort")

    # Git repo
    out["git_status_clean"] = None
    try:
        st = git(repo, "status", "--porcelain", check=False)
        lines = [l for l in st.stdout.splitlines() if l.strip()]
        out["git_status_clean"] = (len(lines) == 0)
        out["git_status_count"] = len(lines)
        branch = git(repo, "rev-parse", "--abbrev-ref", "HEAD", check=False).stdout.strip()
        remote = git(repo, "remote", "get-url", "origin", check=False).stdout.strip()
        out["branch"] = branch
        out["remote"] = remote
        log(f"  git HEAD={branch} origin={remote} uncommitted_files={len(lines)}")
        log(f"  NOTE: other uncommitted changes (if any) will NOT enter the release (explicit-path staging only).")
    except Exception as e:
        log(f"  git precheck warning: {e}")
    return out


# --------------------------------------------------------------------------- #
# PHASE 2 — ISOLATE (strategy; real mode = explicit-path staging only)
# --------------------------------------------------------------------------- #
def isolate(repo, manifest, dry):
    """P0 security: never use local main as publish baseline.

    Steps (per spec):
      1) git fetch origin            (read-only baseline refresh -> learn true origin/main)
      2) ORIGIN_MAIN_SHA = rev-parse origin/main / ls-remote
      3) create CLEAN release worktree/branch FROM origin/main (user main workspace untouched)
      4) approved_files applied ONLY into the clean worktree   [see apply_approved]
      5) VERIFY DIFF (staged == approved)                       [see verify_diff]
      6) commit                                                    [see commit]
      + verify_baseline: release commit parent MUST == ORIGIN_MAIN_SHA
    """
    phase("ISOLATE", dry)
    paths = [f["path"] for f in manifest["approved_files"]]
    url_id = manifest.get("url_id")
    release_branch = f"release-{url_id}"
    worktree_dir = os.path.join(tempfile.gettempdir(), f"pr-worktree-{url_id}")

    # 1) git fetch origin (read-only; learn the TRUE production baseline)
    log("  1) git fetch origin   (read-only baseline refresh; learns true origin/main)")
    if not dry:
        git(repo, "fetch", "origin", check=True)

    # 2) origin/main HEAD SHA  (the ONLY allowed baseline)
    #    Compat: in some sandboxed git environments `git fetch` reports success yet the
    #    `origin/main` tracking ref does NOT persist on disk. Read the TRUE remote HEAD via
    #    `git ls-remote` (no dependency on a local tracking ref) — security semantics unchanged.
    try:
        lsr = git(repo, "ls-remote", "origin", "main", check=True).stdout.strip()
        origin_main_sha = lsr.split()[0]
    except Exception as e:
        log(f"  ls-remote failed ({e}); falling back to local origin/main tracking ref")
        origin_main_sha = git(repo, "rev-parse", "origin/main", check=True).stdout.strip()
    log(f"  ORIGIN_MAIN_SHA = {origin_main_sha}")

    # 3) clean temporary release worktree from origin/main (user main workspace untouched)
    if not dry:
        # drop any stale worktree from a prior aborted run
        git(repo, "worktree", "remove", worktree_dir, "--force", check=False)
        git(repo, "worktree", "prune", check=False)
        git(repo, "worktree", "add", "-b", release_branch, worktree_dir,
            origin_main_sha, check=True)
        log(f"  3) created CLEAN worktree '{worktree_dir}' on branch '{release_branch}' "
            f"from origin/main ({origin_main_sha[:12]})")
        log(f"     user main working tree at '{repo}' is NOT touched "
            f"(no checkout / stash / reset / rebase).")
    else:
        log(f"  [DRY] 3) would: git worktree add -b {release_branch} {worktree_dir} origin/main")
        log(f"  [DRY] user main working tree at '{repo}' would NOT be touched.")

    # release starts exactly at origin/main
    log(f"  RELEASE_BASE_SHA = {origin_main_sha}")
    return {
        "paths": paths,
        "origin_main_sha": origin_main_sha,
        "release_branch": release_branch,
        "worktree_dir": worktree_dir,
    }


# --------------------------------------------------------------------------- #
# PHASE 3 — APPLY APPROVED FILES
# --------------------------------------------------------------------------- #
def apply_approved(repo, manifest, iso, dry):
    phase("APPLY APPROVED FILES", dry)
    worktree_dir = iso["worktree_dir"]
    for f in manifest["approved_files"]:
        p = f["path"]
        target = os.path.join(worktree_dir, p)   # <-- clean release worktree, NOT user main
        content = None
        if f.get("content"):
            content = f["content"]
            src = "<inline>"
        elif f.get("content_ref"):
            src = f["content_ref"]
            if not os.path.isabs(src):
                src = os.path.join(REPO_ROOT, src)   # repo-relative resolution
            if not os.path.exists(src):
                raise RuntimeError(f"content_ref missing: {src}")
            with open(src, "r", encoding="utf-8") as fh:
                content = fh.read()
        else:
            raise RuntimeError(f"approved file {p} has neither content nor content_ref")
        log(f"  target={target} bytes={len(content.encode('utf-8'))} src={src}")
        if dry:
            log(f"  [dry-run] would write approved content to {target} (NOT written)")
        else:
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "w", encoding="utf-8") as fh:
                fh.write(content)
            log(f"  written approved content -> {target}")


# --------------------------------------------------------------------------- #
# PHASE 4 — VERIFY DIFF
# --------------------------------------------------------------------------- #
def verify_diff(worktree_dir, paths, dry):
    phase("VERIFY DIFF", dry)
    if dry:
        approved = sorted(os.path.normpath(p) for p in paths)
        log(f"  APPROVED_FILES = {approved}")
        log(f"  STAGED_FILES   = {approved}  (predicted; explicit-path staging only)")
        log(f"  [dry-run] would stage ONLY explicit approved paths, then assert staged == approved.")
        return
    git(worktree_dir, "add", "--", *paths)   # explicit paths ONLY — NEVER `git add .`
    staged = git(worktree_dir, "diff", "--cached", "--name-only", check=True).stdout.splitlines()
    staged = [s.strip() for s in staged if s.strip()]
    approved = set(os.path.normpath(p) for p in paths)
    actual = set(os.path.normpath(s) for s in staged)
    if approved != actual:
        # safety abort: never commit anything beyond the manifest
        git(worktree_dir, "reset", "--", *staged, check=False)
        raise RuntimeError(
            f"STAGED SET MISMATCH: approved={approved} actual={actual} -> abort, nothing committed"
        )
    log(f"  APPROVED_FILES = {sorted(approved)}")
    log(f"  STAGED_FILES   = {sorted(actual)}  (staged == approved OK)")


# --------------------------------------------------------------------------- #
# PHASE 5 — COMMIT
# --------------------------------------------------------------------------- #
def commit(worktree_dir, manifest, dry):
    phase("COMMIT", dry)
    msg = manifest["commit_message"]
    if dry:
        log(f"  [dry-run] would commit in clean worktree with message: '{msg}'")
        return
    git(worktree_dir, "commit", "-m", msg, check=True)
    log(f"  committed in release worktree: '{msg}'")


# --------------------------------------------------------------------------- #
# PHASE 6 — PUSH (+ MERGE/MAIN)
# --------------------------------------------------------------------------- #
def verify_baseline(iso, dry):
    phase("VERIFY BASELINE", dry)
    origin_main_sha = iso["origin_main_sha"]
    worktree_dir = iso["worktree_dir"]
    if dry:
        release_sha = "<DRY_RELEASE_SHA>"
        release_parent = origin_main_sha          # predicted: branch started at origin/main
    else:
        release_sha = git(worktree_dir, "rev-parse", "HEAD", check=True).stdout.strip()
        release_parent = git(worktree_dir, "rev-parse", "HEAD^", check=True).stdout.strip()
    log(f"  RELEASE_PARENT_SHA = {release_parent}")
    log(f"  ORIGIN_MAIN_SHA    = {origin_main_sha}")
    baseline_match = (release_parent == origin_main_sha)
    log(f"  BASELINE_MATCH     = {baseline_match}")
    if not baseline_match:
        raise RuntimeError(
            "BASELINE_MISMATCH: release commit parent != origin/main SHA recorded at publish start. "
            "ABORT. Do NOT push to main (local main history would leak into production).")
    return release_sha, baseline_match


def push(repo, iso, release_sha, dry):
    phase("PUSH / MERGE-TO-MAIN", dry)
    release_branch = iso["release_branch"]
    worktree_dir = iso["worktree_dir"]
    token = os.environ.get("GITHUB_TOKEN")
    tk = "GITHUB_TOKEN" if token else "system git credential (GCM / browser auth)"
    if dry:
        log(f"  [DRY] would push release branch:  git -C '{worktree_dir}' push origin {release_branch}  (auth={tk})")
        log(f"  [DRY] would fast-forward origin/main to the verified release commit (NO force push):")
        log(f"  [DRY]   git -C '{repo}' push origin {release_sha}:refs/heads/main")
        log(f"  CF Pages Git-integration auto-deploys when main receives the commit.")
        return
    # push the release branch so the commit exists on remote (audit trail)
    git(worktree_dir, "push", "origin", release_branch, token=token, check=True, timeout=PUSH_TIMEOUT)
    log(f"  pushed branch origin/{release_branch}")
    # fast-forward origin/main to the verified release commit.
    # default git rejects non-fast-forward -> if main moved, REFRESH_REQUIRED (no force / no reset).
    try:
        git(repo, "push", "origin", f"{release_sha}:refs/heads/main", token=token, check=True, timeout=PUSH_TIMEOUT)
    except RuntimeError as e:
        raise RuntimeError(
            f"REFRESH_REQUIRED: origin/main moved during publish -> push rejected. "
            f"Do NOT reset/stash/rebase user workspace. ABORT. ({e})")
    log(f"  fast-forwarded origin/main -> release commit {release_sha[:12]}")
    # cleanup: remove the temporary worktree (local branch ref remains as audit trail)
    git(repo, "worktree", "remove", worktree_dir, "--force", check=False)
    log(f"  removed temporary worktree '{worktree_dir}' (user main workspace untouched).")


# --------------------------------------------------------------------------- #
# PHASE 7 — WAIT DEPLOYMENT
# --------------------------------------------------------------------------- #
def wait_deploy(full_url, dry):
    phase("WAIT DEPLOYMENT", dry)
    if dry:
        log(f"  [dry-run] would poll {full_url} every {DEPLOY_POLL}s up to {DEPLOY_MAX_WAIT}s "
            f"until HTTP 200 + expected body.")
        return
    import time, urllib.request
    waited = 0
    while waited <= DEPLOY_MAX_WAIT:
        try:
            req = urllib.request.Request(full_url, headers={"User-Agent": "WorkBuddy-PublishRunner/1.0"})
            with urllib.request.urlopen(req, timeout=15) as r:
                if r.status == 200:
                    log(f"  deploy live after ~{waited}s (HTTP 200)")
                    return
        except Exception:
            pass
        time.sleep(DEPLOY_POLL)
        waited += DEPLOY_POLL
    log(f"  WARNING: deploy not confirmed within {DEPLOY_MAX_WAIT}s; Production Verify will decide.")


# --------------------------------------------------------------------------- #
# PHASE 8 — PRODUCTION VERIFY (read-only)
# --------------------------------------------------------------------------- #
def production_verify(full_url, expected_canonical, dry):
    phase("PRODUCTION VERIFY", dry)
    import urllib.request, re
    res = {"http_code": None, "canonical": None, "canonical_ok": False, "in_sitemap": None}
    try:
        req = urllib.request.Request(full_url, headers={"User-Agent": "WorkBuddy-PublishRunner/1.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            res["http_code"] = r.status
            html = r.read().decode("utf-8", "replace")
        m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.I)
        if not m:
            m = re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']canonical["\']', html, re.I)
        if m:
            res["canonical"] = m.group(1).strip()
        res["canonical_ok"] = (res["canonical"].rstrip("/") == expected_canonical.rstrip("/")
                               and "?" not in res["canonical"])
    except Exception as e:
        log(f"  HTTP error: {e}")
    # sitemap
    try:
        sm_res = sm.fetch_sitemap_urls(SITEMAP_URL)
        res["in_sitemap"] = sm.check_sitemap_membership(sm_res["urls"], full_url)
    except Exception as e:
        log(f"  sitemap check error: {e}")
    log(f"  http={res['http_code']} canonical='{res['canonical']}' canonical_ok={res['canonical_ok']} "
        f"in_sitemap={res['in_sitemap']}")
    ok = (res["http_code"] == 200 and res["canonical_ok"] and res["in_sitemap"] is True)
    res["ok"] = ok
    if not ok:
        log(f"  PRODUCTION VERIFY FAILED -> Registry MUST NOT be marked PUBLISHED")
    return res


# --------------------------------------------------------------------------- #
# PHASE 9 — REGISTRY COMMIT (minimal single-row write)
# --------------------------------------------------------------------------- #
def registry_commit(db, url_id, publish_date, dry):
    phase("REGISTRY COMMIT", dry)
    if REGISTRY_MODE == "external":
        # GitHub Actions CANNOT reach the user's local-only Registry SQLite.
        log("  REGISTRY EXTERNAL: local-only SQLite not reachable from Actions runner.")
        log("  REGISTRY_SYNC_REQUIRED -> on the local machine run:")
        log(f"    python tools/publish/publish_runner.py --url-id {url_id} --retry-registry")
        log("    (REGISTRY_MODE=local, REGISTRY_DB_PATH=<your local content_registry.db>)")
        return "EXTERNAL_SYNC_REQUIRED"
    if dry:
        log(f"  [dry-run] would run: UPDATE urls SET publish_status='PUBLISHED', "
            f"publish_date='{publish_date}' WHERE id={url_id} AND publish_status IN ('BUILT','PLANNED','DRAFT')")
        log(f"  [dry-run] (Question/Keyword ownership untouched; 1 row expected)")
        return "DRY"
    if not db:
        raise RuntimeError("REGISTRY_MODE=local but no DB path (set --db or REGISTRY_DB_PATH)")
    conn = cr_connect(db)
    conn.isolation_level = None
    cur = conn.cursor()
    try:
        cur.execute("BEGIN IMMEDIATE")
        cur.execute(
            "UPDATE urls SET publish_status='PUBLISHED', publish_date=?, updated_at=CURRENT_TIMESTAMP "
            "WHERE id=? AND publish_status IN ('BUILT','PLANNED','DRAFT')",
            (publish_date, url_id),
        )
        n = cur.execute("SELECT changes()").fetchone()[0]
        cur.execute("COMMIT")
    except Exception:
        try:
            cur.execute("ROLLBACK")
        except Exception:
            pass
        conn.close()
        raise
    conn.close()
    log(f"  registry rows affected={n}")
    if n != 1:
        raise RuntimeError(f"Registry write affected {n} rows (expected 1) -> PARTIAL_FAILURE territory")
    return "COMMITTED"


# --------------------------------------------------------------------------- #
# PHASE 10 — P2 INDEX HEALTH (scoped to url_id, reuse index_health)
# --------------------------------------------------------------------------- #
def run_p2(db, url_id, full_url, dry):
    phase("P2 INDEX HEALTH", dry)
    # sitemap membership is always checkable live
    sm_res = sm.fetch_sitemap_urls(SITEMAP_URL)
    in_sm = sm.check_sitemap_membership(sm_res["urls"], full_url)
    sm_status = "IN_SITEMAP" if in_sm else "NOT_IN_SITEMAP"

    if REGISTRY_MODE == "external":
        # GSC credentials + Registry DB are local-only; Actions cannot reach them.
        log("  P2 EXTERNAL: skipping GSC URL Inspection + Registry write (no creds/DB in Actions).")
        log("  SKIP_P2_WITH_REASON: GSC credentials and Registry DB are local-only; "
            "backfill via local --retry-registry.")
        return {"index_status": "SKIPPED", "sitemap_status": sm_status, "written": False}

    gsc_error = None
    try:
        gsc = ih.build_gsc_service(CRED, SITE_URL)
        raw = ih.inspect_url(gsc, SITE_URL, full_url)
        index_status, detail = ih.map_index_status(raw)
    except Exception as e:  # noqa: BLE001
        index_status = "ERROR"
        detail = {"verdict": None, "coverage_state": None, "indexing_state": None,
                   "google_canonical": None, "user_canonical": None, "last_crawl_time": None,
                   "robots_txt_state": None, "page_fetch_state": None,
                   "referring_urls": None, "gsc_sitemap_refs": None}
        gsc_error = f"{type(e).__name__}: {e}"
    log(f"  sitemap_status={sm_status} gsc_verdict={detail.get('verdict')} "
        f"last_crawl={detail.get('last_crawl_time')} err={gsc_error}")
    if dry:
        log(f"  [dry-run] would record snapshot (url_id={url_id}) index_status={index_status} "
            f"sitemap_status={sm_status} (NOT written)")
        return {"index_status": index_status, "sitemap_status": sm_status, "written": False}
    # real: write snapshot + current (local mode only)
    if not db:
        raise RuntimeError("REGISTRY_MODE=local but no DB path (set --db or REGISTRY_DB_PATH)")
    conn = ih._connect(db)
    cur = conn.cursor()
    inspected_at = ih._now()
    rhash = ih._resp_hash(raw if index_status != "ERROR" else {"error": gsc_error})
    rec = ih.record_index_snapshot(cur, url_id, inspected_at, index_status, detail, rhash)
    ih.update_current_index_status(cur, url_id, index_status, sm_status)
    conn.commit()
    conn.close()
    log(f"  snapshot_write={rec} index_status={index_status} sitemap_status={sm_status}")
    return {"index_status": index_status, "sitemap_status": sm_status, "written": True}


# --------------------------------------------------------------------------- #
# ORCHESTRATION
# --------------------------------------------------------------------------- #
def run(url_id, manifest_path, dry, retry_registry=False):
    manifest, mpath = load_manifest(url_id, manifest_path)
    full_url = manifest["expected_canonical_url"]
    exp = manifest["expected_canonical_url"]
    today = datetime.date.today().strftime("%Y-%m-%d")
    log(f"PUBLISH RUNNER v1.0.3  url_id={url_id}  mode={'DRY-RUN' if dry else 'PUBLISH'}  "
        f"registry_mode={REGISTRY_MODE}  manifest={mpath}")
    log(f"approved_files={[f['path'] for f in manifest['approved_files']]}")

    pre = precheck(REPO_PATH, DB_PATH, url_id, manifest, dry)

    if retry_registry:
        # only re-run Registry write (after a prior PARTIAL_FAILURE / external deploy)
        phase("RETRY REGISTRY", dry)
        registry_commit(DB_PATH, url_id, today, dry)
        run_p2(DB_PATH, url_id, full_url, dry)
        log("FINAL: PUBLISH_COMPLETE (registry retried)")
        return

    if pre["already_published"] and not dry:
        raise RuntimeError(f"url_id={url_id} is already PUBLISHED -> refuse to re-publish "
                           f"(use --retry-registry only for PARTIAL recovery)")

    iso = isolate(REPO_PATH, manifest, dry)
    apply_approved(REPO_PATH, manifest, iso, dry)
    verify_diff(iso["worktree_dir"], iso["paths"], dry)
    commit(iso["worktree_dir"], manifest, dry)
    release_sha, baseline_match = verify_baseline(iso, dry)
    push(REPO_PATH, iso, release_sha, dry)
    wait_deploy(full_url, dry)

    if dry:
        # nothing is deployed in dry-run; Production Verify is deferred to real publish.
        pv = {"ok": True, "dry_skipped": True, "http_code": None,
              "canonical_ok": None, "in_sitemap": None}
        log("  [DRY] production verify deferred (nothing deployed); manifests/approved validated above.")
    else:
        pv = production_verify(full_url, exp, dry)

    if not pv["ok"]:
        # Production Verify failed -> Registry MUST NOT be PUBLISHED
        log("ABORT before Registry: Production Verify failed.")
        log("FINAL: PUBLISH_INCOMPLETE (production verify failed; Registry untouched)")
        return

    try:
        registry_commit(DB_PATH, url_id, today, dry)
    except Exception as e:
        # Production OK but Registry failed -> PARTIAL; only retry Registry later
        log(f"Production OK but Registry FAILED: {e}")
        log("FINAL: PUBLISH_PARTIAL_FAILURE (retry with: "
            f"python tools/publish/publish_runner.py --url-id {url_id} --retry-registry)")
        return

    p2 = run_p2(DB_PATH, url_id, full_url, dry)

    if dry:
        log("=== DRY-RUN BASELINE SECURITY SUMMARY ===")
        log(f"  ORIGIN_MAIN_SHA    = {iso['origin_main_sha']}")
        log(f"  RELEASE_BASE_SHA   = {iso['origin_main_sha']}  (release branch starts at origin/main)")
        log(f"  RELEASE_PARENT_SHA = {iso['origin_main_sha']}  (predicted parent == origin/main)")
        log(f"  APPROVED_FILES     = {sorted(os.path.normpath(p) for p in iso['paths'])}")
        log(f"  STAGED_FILES       = {sorted(os.path.normpath(p) for p in iso['paths'])}  (predicted == approved)")
        log(f"  BASELINE_MATCH     = {baseline_match}")
        log("  (no worktree created, no commit, no push, no registry write in dry-run)")
        log("FINAL: DRY_RUN_READY")
        return

    if REGISTRY_MODE == "external":
        log("DEPLOY PUSHED + PROD VERIFIED. Registry is LOCAL-ONLY (GitHub Actions cannot reach it).")
        log("REGISTRY_SYNC_REQUIRED: on local machine run --retry-registry (REGISTRY_MODE=local).")
        log("FINAL: DEPLOY_PUSHED_PROD_VERIFIED_REGISTRY_SYNC_REQUIRED")
        return

    # GSC NEUTRAL / NOT_INDEXED does NOT block COMPLETE
    log("FINAL: PUBLISH_COMPLETE")


def _write_failure_report(url_id, manifest_path, err):
    """Ephemeral runner cannot keep a worktree; emit a compact failure report for upload-artifact."""
    report = {
        "failed_phase": _state["phases"][-1] if _state["phases"] else "UNKNOWN",
        "error": str(err),
        "error_type": type(err).__name__,
        "phases_executed": list(_state["phases"]),
        "url_id": url_id,
        "manifest": manifest_path,
        "registry_mode": REGISTRY_MODE,
        "next_action": (
            "Review error; do NOT force push. If REFRESH_REQUIRED, re-run after syncing local "
            "main with origin/main. If Registry/P2 failed locally, run --retry-registry on the "
            "local machine (REGISTRY_MODE=local)."
        ),
    }
    try:
        rp = os.path.join(HERE, "publish_failure_report.json")
        with open(rp, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        log(f"  wrote failure report -> {rp}")
    except Exception as e:
        log(f"  could not write failure report: {e}")
    log("FAILED_PHASE=" + report["failed_phase"])
    log("ERROR=" + str(err))
    log("NEXT_ACTION=" + report["next_action"])


def main():
    global REPO_PATH, DB_PATH, REGISTRY_MODE
    ap = argparse.ArgumentParser(description="Publish Runner v1.0.3 (GitHub Actions publish executor)")
    ap.add_argument("--url-id", type=int, required=True)
    ap.add_argument("--manifest", type=str, default=None)
    ap.add_argument("--dry-run", action="store_true", help="default: simulate, no writes")
    ap.add_argument("--publish", action="store_true", help="execute real publish")
    ap.add_argument("--retry-registry", action="store_true", help="only re-run Registry write")
    ap.add_argument("--repo", type=str, default=None, help="override repo root (default: auto-resolved)")
    ap.add_argument("--db", type=str, default=None, help="Registry DB path (local mode)")
    ap.add_argument("--registry-mode", type=str, default=None,
                    help="local | external (default env PUBLISH_REGISTRY_MODE or 'local')")
    args = ap.parse_args()

    REPO_PATH = args.repo or REPO_ROOT
    DB_PATH = args.db or os.environ.get("REGISTRY_DB_PATH") or ""
    if args.registry_mode:
        REGISTRY_MODE = args.registry_mode.lower()

    dry = not args.publish
    if args.retry_registry:
        dry = False if args.publish else dry  # retry-registry still respects --publish

    try:
        run(args.url_id, args.manifest, dry, retry_registry=args.retry_registry)
    except Exception as e:
        _write_failure_report(args.url_id, args.manifest, e)
        sys.exit(1)


if __name__ == "__main__":
    main()

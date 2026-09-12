"""P2 — Index Health Adapter (GSC URL Inspection + snapshot history).

Design constraints (P2-INDEX-HEALTH-PLAN.md):
  * Content Registry v1 is NOT modified. urls keeps only current sitemap_status/index_status.
  * History lives in a NEW table index_health_snapshots (FK urls.id).
  * NOTE: v1 urls has NO last_inspected_at column (forbidden to add). "Last inspected"
    is sourced from index_health_snapshots.inspected_at instead.
  * GSC capability is official only: google-api-python-client, lazy-imported. We NEVER
    crawl SERP, never `site:` query, never mimic a browser.
  * Sitemap actual (this module calls sitemap_health) is separate from gsc_sitemap_refs.
"""
from __future__ import annotations

import json
import time
import random
import hashlib
import sqlite3
from datetime import datetime

from services.content_registry import _connect as _cr_connect, DEFAULT_DB_PATH
from services.sitemap_health import (
    fetch_sitemap_urls, check_sitemap_membership,
)

# --- P2 extension schema (new table only; v1 tables untouched) -----------------
P2_SCHEMA = """
CREATE TABLE IF NOT EXISTS index_health_snapshots (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  url_id            INTEGER NOT NULL,
  inspected_at      TEXT NOT NULL,
  verdict           TEXT,
  index_status      TEXT,
  coverage_state    TEXT,
  indexing_state    TEXT,
  google_canonical  TEXT,
  user_canonical    TEXT,
  last_crawl_time   TEXT,
  robots_txt_state  TEXT,
  page_fetch_state  TEXT,
  referring_urls    TEXT,
  gsc_sitemap_refs  TEXT,
  response_hash     TEXT,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(url_id) REFERENCES urls(id)
);
CREATE INDEX IF NOT EXISTS idx_snap_url ON index_health_snapshots(url_id, inspected_at);
"""

# --- scheduling constants (days); no Queue/Celery/Redis -------------------------
FIRST_INSPECT_DELAY_DAYS = 3
NOT_INDEXED_RECHECK_DAYS = 7
INDEXED_RECHECK_DAYS = 30

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
RETRYABLE = (429, 500, 502, 503, 504)

_VERDICT_MAP = {
    "PASS": "INDEXED",
    "FAIL": "NOT_INDEXED",
    "NEUTRAL": "NEUTRAL",
    "PARTIAL": "PARTIAL",
    "No Data": "NOT_CHECKED",
}


# --------------------------------------------------------------------------- #
# Connection
# --------------------------------------------------------------------------- #
def _connect(db_path=None):
    """Reuse v1 connection/table bootstrap, then ensure P2 table exists."""
    conn = _cr_connect(db_path)
    conn.execute("PRAGMA busy_timeout=30000")  # 等锁而非立即报错
    conn.executescript(P2_SCHEMA)
    return conn


def _now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _resp_hash(raw: dict) -> str:
    try:
        s = json.dumps(raw, sort_keys=True, default=str)
    except Exception:  # noqa: BLE001
        s = str(raw)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()[:16]


def _parse_dt(s):
    if not s:
        return None
    s = s.strip().replace("Z", "")
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            continue
    return None


# --------------------------------------------------------------------------- #
# Read helpers
# --------------------------------------------------------------------------- #
def get_published_urls(db_path=None) -> list[dict]:
    """All PUBLISHED url rows (id, url, publish_date, index_status, sitemap_status)."""
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        rows = cur.execute(
            "SELECT id, url, publish_date, index_status, sitemap_status "
            "FROM urls WHERE publish_status='PUBLISHED' ORDER BY id"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def _last_inspected_at(db_path, url_id) -> str | None:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        r = cur.execute(
            "SELECT inspected_at FROM index_health_snapshots WHERE url_id=? "
            "ORDER BY inspected_at DESC, id DESC LIMIT 1",
            (url_id,),
        ).fetchone()
        return r["inspected_at"] if r else None
    finally:
        conn.close()


def should_inspect(row: dict, now: datetime | None = None, db_path=None) -> bool:
    """Time-based scheduling WITHOUT a queue.

    Uses publish_date (v1) + last inspected_at (from snapshots) + current index_status.
    """
    now = now or datetime.now()
    status = row.get("index_status")
    pub = _parse_dt(row.get("publish_date"))
    last = _last_inspected_at(db_path, row["id"]) if db_path else None

    if status in (None, "NOT_CHECKED"):
        # First inspection: wait FIRST_INSPECT_DELAY_DAYS after publish.
        if pub is None:
            return True
        return (now - pub).days >= FIRST_INSPECT_DELAY_DAYS
    if status == "INDEXED":
        if last is None:
            return True
        return (now - _parse_dt(last)).days >= INDEXED_RECHECK_DAYS
    # NOT_INDEXED / ERROR / NEUTRAL / PARTIAL -> recheck on the shorter cadence
    if last is None:
        return True
    return (now - _parse_dt(last)).days >= NOT_INDEXED_RECHECK_DAYS


# --------------------------------------------------------------------------- #
# GSC Adapter (official API only)
# --------------------------------------------------------------------------- #
class GSCService:
    """Lightweight wrapper around the Search Console URL Inspection REST endpoint.

    Avoids googleapiclient.discovery (which fetches a discovery document and can
    time out in some network environments). Uses urllib directly with service-account
    token refresh.
    """

    def __init__(self, credentials_path: str, scopes=SCOPES):
        try:
            from google.oauth2 import service_account
            import google.auth.transport.requests as gatr
        except ImportError as e:  # noqa: BLE001
            raise RuntimeError(
                "google-auth not installed; run: pip install google-auth google-auth-oauthlib"
            ) from e
        self._creds = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=scopes
        )
        self._refresh_req = gatr.Request()
        self._endpoint = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"

    def _token(self) -> str:
        if self._creds.expired or not self._creds.token:
            self._creds.refresh(self._refresh_req)
        return self._creds.token

    def inspect(self, site_url: str, url: str) -> dict:
        """POST to the URL Inspection API; return raw indexStatusResult dict."""
        import urllib.request

        body = json.dumps({"inspectionUrl": url, "siteUrl": site_url}).encode("utf-8")
        req = urllib.request.Request(
            self._endpoint,
            data=body,
            headers={
                "Authorization": f"Bearer {self._token()}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read())
        except urllib.error.HTTPError as e:
            data = json.loads(e.read())
            raise GSCAPIError(e.code, data) from e
        return data.get("inspectionResult", {}).get("indexStatusResult", {})


class GSCAPIError(Exception):
    def __init__(self, status_code: int, payload: dict):
        self.status_code = status_code
        self.payload = payload
        super().__init__(f"GSC API error {status_code}: {payload}")


def build_gsc_service(credentials_path: str, site_url: str = None, scopes=SCOPES):
    """Build a lightweight GSC service. site_url accepted for CLI parity."""
    return GSCService(credentials_path, scopes=scopes)


def inspect_url(gsc_service, site_url: str, url: str) -> dict:
    """Call official URL Inspection API; return raw indexStatusResult dict."""
    return gsc_service.inspect(site_url, url)


def map_index_status(raw: dict) -> tuple[str, dict]:
    """Map raw GSC indexStatusResult -> (index_status, detail_dict)."""
    verdict = raw.get("verdict")
    index_status = _VERDICT_MAP.get(verdict, "NOT_CHECKED")
    detail = {
        "verdict": verdict,
        "coverage_state": raw.get("coverageState"),
        "indexing_state": raw.get("indexingState"),
        "google_canonical": raw.get("googleCanonical"),
        "user_canonical": raw.get("userCanonical"),
        "last_crawl_time": raw.get("lastCrawlTime"),
        "robots_txt_state": raw.get("robotsTxtState"),
        "page_fetch_state": raw.get("pageFetchState"),
        "referring_urls": raw.get("referringUrls"),
        "gsc_sitemap_refs": raw.get("sitemap"),
    }
    return index_status, detail


def _inspect_with_retry(gsc_service, site_url, url, max_retries=3, base=2.0) -> dict:
    last = None
    for attempt in range(max_retries):
        try:
            return inspect_url(gsc_service, site_url, url)
        except GSCAPIError as e:
            if e.status_code in RETRYABLE:
                last = e
                time.sleep(base * (2 ** attempt) + random.uniform(0, 1))
                continue
            raise  # non-retryable -> caller marks ERROR, keeps going
    if last is not None:
        raise last
    raise RuntimeError("inspect_url failed with no response")


# --------------------------------------------------------------------------- #
# Write helpers
# --------------------------------------------------------------------------- #
def record_index_snapshot(cur, url_id, inspected_at, index_status, detail, response_hash) -> str:
    """Idempotent: skip if the latest snapshot for this url has the same response_hash
    (state unchanged). Otherwise insert. Returns 'RECORDED' | 'SKIPPED'."""
    latest = cur.execute(
        "SELECT id FROM index_health_snapshots WHERE url_id=? "
        "ORDER BY inspected_at DESC, id DESC LIMIT 1",
        (url_id,),
    ).fetchone()
    if latest:
        prev = cur.execute(
            "SELECT response_hash FROM index_health_snapshots WHERE id=?",
            (latest["id"],),
        ).fetchone()
        if prev and prev["response_hash"] == response_hash:
            return "SKIPPED"
    cur.execute(
        """INSERT INTO index_health_snapshots
           (url_id, inspected_at, verdict, index_status, coverage_state, indexing_state,
            google_canonical, user_canonical, last_crawl_time, robots_txt_state,
            page_fetch_state, referring_urls, gsc_sitemap_refs, response_hash)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            url_id, inspected_at, detail.get("verdict"), index_status,
            detail.get("coverage_state"), detail.get("indexing_state"),
            detail.get("google_canonical"), detail.get("user_canonical"),
            detail.get("last_crawl_time"), detail.get("robots_txt_state"),
            detail.get("page_fetch_state"),
            json.dumps(detail.get("referring_urls") or [], ensure_ascii=False),
            json.dumps(detail.get("gsc_sitemap_refs") or [], ensure_ascii=False),
            response_hash,
        ),
    )
    return "RECORDED"


def update_current_index_status(cur, url_id, index_status, sitemap_status) -> None:
    """Update ONLY the two current-state columns on urls (v1 columns, no new columns)."""
    cur.execute(
        "UPDATE urls SET index_status=?, sitemap_status=? WHERE id=?",
        (index_status, sitemap_status, url_id),
    )


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #
def _derive_base_url(site_url: str | None, sitemap_urls: set[str] | None = None) -> str:
    """Derive a base origin for building full URLs from Registry paths."""
    if site_url and site_url.startswith("sc-domain:"):
        return f"https://{site_url.split(':', 1)[1]}"
    if site_url:
        from urllib.parse import urlparse
        parsed = urlparse(site_url)
        if parsed.scheme and parsed.netloc:
            return f"{parsed.scheme}://{parsed.netloc}"
    if sitemap_urls:
        from urllib.parse import urlparse
        for u in sitemap_urls:
            parsed = urlparse(u)
            if parsed.scheme and parsed.netloc:
                return f"{parsed.scheme}://{parsed.netloc}"
    return ""


def run_index_health_sync(
    db_path=None, gsc_service=None, site_url=None, base_url: str | None = None,
    sitemap_url=None,
    limit=None, force_all=False, now: datetime | None = None,
    sitemap_fetch_fn=None, inter_delay: float = 0.0,
) -> dict:
    """Run one sync pass.

    - Sitemap actual check (if sitemap_url given): writes sitemap_status per URL.
    - GSC inspection (if gsc_service given + should_inspect or force_all).
    - One URL failure never aborts the batch; API failure keeps last current status.
    """
    if base_url is None:
        base_url = ""
    conn = _connect(db_path)
    cur = conn.cursor()
    stats = {
        "published": 0, "sitemap_checked": 0, "inspected": 0,
        "indexed": 0, "not_indexed": 0, "neutral": 0, "partial": 0,
        "errors": 0, "snapshots_recorded": 0, "snapshots_skipped": 0,
        "skipped_schedule": 0, "failed_urls": [],
    }
    try:
        # Sitemap actual fetch (single fetch for the whole site)
        sitemap_urls: set = set()
        sitemap_error = False
        if sitemap_url:
            sm = fetch_sitemap_urls(sitemap_url, fetch_fn=sitemap_fetch_fn)
            sitemap_urls = sm["urls"]
            sitemap_error = sm["status"] == "ERROR"

        if not base_url:
            base_url = _derive_base_url(site_url, sitemap_urls)

        rows = get_published_urls(db_path)
        stats["published"] = len(rows)

        processed = 0
        for row in rows:
            uid = row["id"]
            url_path = row["url"]
            if url_path.startswith(("http://", "https://")):
                full_url = url_path
            else:
                full_url = base_url.rstrip("/") + url_path if base_url else url_path

            # --- Sitemap actual ---
            sm_status = row.get("sitemap_status")
            if sitemap_url:
                if sitemap_error:
                    sm_status = "ERROR"
                else:
                    sm_status = "IN_SITEMAP" if check_sitemap_membership(sitemap_urls, full_url) else "NOT_IN_SITEMAP"
                cur.execute("UPDATE urls SET sitemap_status=? WHERE id=?", (sm_status, uid))
                stats["sitemap_checked"] += 1

            # --- GSC inspection ---
            if gsc_service is not None:
                if not force_all and not should_inspect(row, now=now, db_path=db_path):
                    stats["skipped_schedule"] += 1
                else:
                    try:
                        raw = _inspect_with_retry(gsc_service, site_url, full_url)
                        index_status, detail = map_index_status(raw)
                        inspected_at = _now()
                        rhash = _resp_hash(raw)
                        rec = record_index_snapshot(cur, uid, inspected_at, index_status, detail, rhash)
                        if rec == "RECORDED":
                            stats["snapshots_recorded"] += 1
                        else:
                            stats["snapshots_skipped"] += 1
                        update_current_index_status(cur, uid, index_status, sm_status)
                        stats["inspected"] += 1
                        if index_status == "INDEXED":
                            stats["indexed"] += 1
                        elif index_status == "NOT_INDEXED":
                            stats["not_indexed"] += 1
                        elif index_status == "NEUTRAL":
                            stats["neutral"] += 1
                        elif index_status == "PARTIAL":
                            stats["partial"] += 1
                        elif index_status == "ERROR":
                            stats["errors"] += 1
                    except Exception as e:  # noqa: BLE001
                        stats["errors"] += 1
                        stats["failed_urls"].append({"url": full_url, "error": str(e)})
                        # Keep last current status; only flip NOT_CHECKED -> ERROR
                        cur.execute(
                            "UPDATE urls SET index_status='ERROR' "
                            "WHERE id=? AND index_status='NOT_CHECKED'",
                            (uid,),
                        )
            processed += 1
            conn.commit()  # 逐条落库，前台被杀也不丢已跑数据
            if inter_delay:
                time.sleep(inter_delay)
            if limit and processed >= limit:
                break

        conn.commit()
        return stats
    except Exception:  # noqa: BLE001
        try:
            conn.rollback()
        except Exception:  # noqa: BLE001
            pass
        raise
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# Reporting helpers (for CLI --stats / --show-url)
# --------------------------------------------------------------------------- #
def index_health_stats(db_path=None) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        def _c(expr: str) -> int:
            return cur.execute(
                "SELECT COUNT(*) AS n FROM urls WHERE " + expr
            ).fetchone()["n"]

        orphans = cur.execute(
            "SELECT COUNT(*) AS n FROM urls WHERE publish_status='PUBLISHED' "
            "AND NOT EXISTS (SELECT 1 FROM internal_links l WHERE l.target_url_id=urls.id)"
        ).fetchone()["n"]
        return {
            "published": _c("publish_status='PUBLISHED'"),
            "in_sitemap": _c("publish_status='PUBLISHED' AND sitemap_status='IN_SITEMAP'"),
            "not_in_sitemap": _c("publish_status='PUBLISHED' AND sitemap_status='NOT_IN_SITEMAP'"),
            "indexed": _c("publish_status='PUBLISHED' AND index_status='INDEXED'"),
            "not_indexed": _c("publish_status='PUBLISHED' AND index_status='NOT_INDEXED'"),
            "not_checked": _c("publish_status='PUBLISHED' AND index_status='NOT_CHECKED'"),
            "errors": _c("publish_status='PUBLISHED' AND index_status='ERROR'"),
            "orphans": orphans,
        }
    finally:
        conn.close()


def get_index_history(url_id: int, db_path=None) -> list[dict]:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        rows = cur.execute(
            "SELECT inspected_at, verdict, index_status, coverage_state, "
            "google_canonical, last_crawl_time FROM index_health_snapshots "
            "WHERE url_id=? ORDER BY inspected_at",
            (url_id,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

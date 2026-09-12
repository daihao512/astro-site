"""Content Registry v1 — local memory layer for the Industrial B2B Content Engine.

Design constraints (from spec):
  * SQLite only. No Neo4j, no vector DB, no embeddings, no complex KG framework.
  * v1 Memory Layer, not an enterprise knowledge-graph project.
  * Market feedback is the teacher. Registry is the memory. Gate is the guardrail.
  * One URL = One Primary Question = One Primary Search Intent.
  * Every published URL is committed automatically; WordPress-OK + Registry-FAIL => PARTIAL_FAILURE.

Tables: keywords, questions, urls, internal_links, content_opportunities
"""

from __future__ import annotations

import sqlite3
import re
import hashlib
import json
import os
from datetime import datetime, timezone

DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "content_registry.db"
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS keywords (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword              TEXT NOT NULL,
  normalized_keyword   TEXT NOT NULL UNIQUE,
  search_intent        TEXT,
  primary_question_id  INTEGER,
  entity               TEXT,
  commercial_value     TEXT,
  status               TEXT NOT NULL DEFAULT 'DISCOVERED',
  created_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(primary_question_id) REFERENCES questions(id)
);
CREATE TABLE IF NOT EXISTS questions (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  question             TEXT NOT NULL,
  normalized_question  TEXT NOT NULL UNIQUE,
  primary_keyword      TEXT,
  search_intent        TEXT,
  entity               TEXT,
  answer_status        TEXT NOT NULL DEFAULT 'UNANSWERED',
  canonical_url_id     INTEGER,
  created_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(canonical_url_id) REFERENCES urls(id)
);
CREATE TABLE IF NOT EXISTS urls (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  url               TEXT NOT NULL UNIQUE,
  slug              TEXT,
  page_type         TEXT NOT NULL DEFAULT 'BLOG',
  primary_keyword   TEXT,
  primary_question_id INTEGER,
  primary_entity    TEXT,
  search_intent     TEXT,
  answer_summary    TEXT,
  publish_status    TEXT NOT NULL DEFAULT 'DRAFT',
  publish_date      TEXT,
  last_updated      TEXT,
  sitemap_status    TEXT DEFAULT 'NOT_CHECKED',
  index_status      TEXT DEFAULT 'NOT_CHECKED',
  content_version   TEXT DEFAULT '1',
  content_hash      TEXT,
  created_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(primary_question_id) REFERENCES questions(id)
);
CREATE TABLE IF NOT EXISTS internal_links (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  source_url_id  INTEGER NOT NULL,
  target_url_id  INTEGER NOT NULL,
  anchor_text    TEXT,
  relationship   TEXT,
  created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_url_id, target_url_id, anchor_text, relationship),
  FOREIGN KEY(source_url_id) REFERENCES urls(id),
  FOREIGN KEY(target_url_id) REFERENCES urls(id)
);
CREATE TABLE IF NOT EXISTS content_opportunities (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword            TEXT,
  question           TEXT,
  normalized_question TEXT,
  entity             TEXT,
  search_intent      TEXT,
  source_url_id      INTEGER,
  reason             TEXT,
  priority           TEXT NOT NULL DEFAULT 'MEDIUM',
  status             TEXT NOT NULL DEFAULT 'OPEN',
  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(source_url_id) REFERENCES urls(id)
);
CREATE INDEX IF NOT EXISTS idx_q_norm ON questions(normalized_question);
CREATE INDEX IF NOT EXISTS idx_k_norm ON keywords(normalized_keyword);
CREATE INDEX IF NOT EXISTS idx_url    ON urls(url);
CREATE INDEX IF NOT EXISTS idx_opp_nq ON content_opportunities(normalized_question);
"""

_PUNCT = re.compile(r"[^\w\s]")


class RegistryCommitError(Exception):
    """Raised when a core Registry write fails. Caller must mark PUBLISH_PARTIAL_FAILURE."""


# --------------------------------------------------------------------------- #
# Connection / normalization
# --------------------------------------------------------------------------- #
def _connect(db_path: str | None = None) -> sqlite3.Connection:
    db_path = db_path or DEFAULT_DB_PATH
    parent = os.path.dirname(db_path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(SCHEMA)
    return conn


def normalize_text(s: str | None) -> str:
    """Lowercase, trim, strip punctuation, collapse whitespace. No NLP."""
    if not s:
        return ""
    s = s.lower().strip()
    s = _PUNCT.sub(" ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _content_hash(*parts: str) -> str:
    m = hashlib.sha256()
    for p in parts:
        m.update((p or "").encode("utf-8"))
    return m.hexdigest()


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


# --------------------------------------------------------------------------- #
# Low-level helpers (upsert)
# --------------------------------------------------------------------------- #
def _get_or_create(cur, table, uniq_cols, uniq_vals, set_cols=None, set_vals=None):
    where = " AND ".join(f"{c}=?" for c in uniq_cols)
    row = cur.execute(f"SELECT id FROM {table} WHERE {where}", uniq_vals).fetchone()
    if row:
        rid = row["id"]
        if set_cols:
            sets = ", ".join(f"{c}=?" for c in set_cols)
            cur.execute(
                f"UPDATE {table} SET {sets}, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                list(set_vals) + [rid],
            )
        return rid
    cols = list(uniq_cols) + list(set_cols or [])
    vals = list(uniq_vals) + list(set_vals or [])
    ph = ", ".join("?" for _ in cols)
    r = cur.execute(
        f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({ph})", vals
    )
    return r.lastrowid


def _upsert_url(cur, url, slug, page_type, pk, qid, entity, intent, summary,
                pstatus, pdate, version, chash):
    row = cur.execute(
        "SELECT id, content_hash, content_version FROM urls WHERE url=?", (url,)
    ).fetchone()
    if row:
        rid = row["id"]
        new_version = version
        if row["content_hash"] and row["content_hash"] != chash and version is None:
            try:
                new_version = str(int(row["content_version"] or "1") + 1)
            except ValueError:
                new_version = "2"
        cur.execute(
            """UPDATE urls SET slug=?, page_type=?, primary_keyword=?, primary_question_id=?,
               primary_entity=?, search_intent=?, answer_summary=?, publish_status=?,
               publish_date=?, last_updated=CURRENT_TIMESTAMP, content_version=?, content_hash=?,
               updated_at=CURRENT_TIMESTAMP WHERE id=?""",
            (slug, page_type, pk, qid, entity, intent, summary, pstatus, pdate,
             new_version, chash, rid),
        )
        return rid
    r = cur.execute(
        """INSERT INTO urls (url, slug, page_type, primary_keyword, primary_question_id,
           primary_entity, search_intent, answer_summary, publish_status, publish_date,
           last_updated, content_version, content_hash)
           VALUES (?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?)""",
        (url, slug, page_type, pk, qid, entity, intent, summary, pstatus, pdate,
         version, chash),
    )
    return r.lastrowid


def _insert_link(cur, src, tgt, anchor, rel):
    cur.execute(
        "INSERT OR IGNORE INTO internal_links "
        "(source_url_id, target_url_id, anchor_text, relationship) VALUES (?,?,?,?)",
        (src, tgt, anchor, rel),
    )


# --------------------------------------------------------------------------- #
# 1. lookup_question
# --------------------------------------------------------------------------- #
def lookup_question(question: str, entity: str | None = None, db_path: str | None = None) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        nq = normalize_text(question)
        row = cur.execute(
            "SELECT * FROM questions WHERE normalized_question=?", (nq,)
        ).fetchone()
        if not row and entity:
            row = cur.execute(
                "SELECT * FROM questions WHERE entity=? AND answer_status='ANSWERED' LIMIT 1",
                (entity,),
            ).fetchone()
        if not row:
            return {
                "status": "UNANSWERED",
                "question_id": None,
                "canonical_url": None,
                "primary_keyword": None,
                "search_intent": None,
                "entity": entity,
            }
        q = dict(row)
        canon_url = None
        if q["canonical_url_id"]:
            u = cur.execute(
                "SELECT url FROM urls WHERE id=?", (q["canonical_url_id"],)
            ).fetchone()
            canon_url = u["url"] if u else None
        status = "ANSWERED" if q["canonical_url_id"] else q["answer_status"]
        kw = None
        if q["primary_keyword"]:
            kr = cur.execute(
                "SELECT normalized_keyword FROM keywords WHERE normalized_keyword=?",
                (normalize_text(q["primary_keyword"]),),
            ).fetchone()
            kw = kr["normalized_keyword"] if kr else q["primary_keyword"]
        return {
            "status": status,
            "question_id": q["id"],
            "canonical_url": canon_url,
            "primary_keyword": kw,
            "search_intent": q["search_intent"],
            "entity": q["entity"],
        }
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# 2. lookup_keyword
# --------------------------------------------------------------------------- #
def lookup_keyword(keyword: str, db_path: str | None = None) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        nk = normalize_text(keyword)
        row = cur.execute(
            "SELECT * FROM keywords WHERE normalized_keyword=?", (nk,)
        ).fetchone()
        if not row:
            row = cur.execute("SELECT * FROM keywords WHERE keyword=?", (keyword,)).fetchone()
        if not row:
            return {
                "found": False,
                "has_primary_url": False,
                "question": None,
                "search_intent": None,
                "status": None,
                "canonical_url": None,
            }
        k = dict(row)
        q = None
        canon = None
        if k["primary_question_id"]:
            qr = cur.execute(
                "SELECT * FROM questions WHERE id=?", (k["primary_question_id"],)
            ).fetchone()
            if qr:
                q = dict(qr)
                if q["canonical_url_id"]:
                    ur = cur.execute(
                        "SELECT url FROM urls WHERE id=?", (q["canonical_url_id"],)
                    ).fetchone()
                    canon = ur["url"] if ur else None
        return {
            "found": True,
            "has_primary_url": bool(canon),
            "keyword": k["keyword"],
            "question": q["question"] if q else None,
            "search_intent": k["search_intent"],
            "status": k["status"],
            "canonical_url": canon,
        }
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# 3. register_publish  (atomic transaction)
# --------------------------------------------------------------------------- #
def register_publish(
    url: str,
    slug: str,
    page_type: str,
    primary_keyword: str,
    primary_question: str,
    search_intent: str,
    primary_entity: str,
    answer_summary: str,
    internal_links: list[dict] | None = None,
    content_version: str | None = None,
    publish_date: str | None = None,
    db_path: str | None = None,
) -> dict:
    conn = _connect(db_path)
    conn.isolation_level = None
    cur = conn.cursor()
    try:
        cur.execute("BEGIN IMMEDIATE")
        nk = normalize_text(primary_keyword)
        nq = normalize_text(primary_question)

        # 2. question upsert (created before url so we can bind canonical)
        # NOTE: canonical_url_id is intentionally NOT in set_cols here, so re-publishing
        # the same question never steals an existing canonical (One Question -> One Canonical).
        qid = _get_or_create(
            cur, "questions", ["normalized_question"], [nq],
            ["question", "primary_keyword", "search_intent", "entity", "answer_status"],
            [primary_question, primary_keyword, search_intent, primary_entity, "ANSWERED"],
        )

        # 1. url upsert
        chash = _content_hash(
            primary_question, answer_summary or "",
            json.dumps(internal_links or [], sort_keys=True),
        )
        version = content_version or "1"
        uid = _upsert_url(
            cur, url, slug, page_type, primary_keyword, qid, primary_entity,
            search_intent, answer_summary, "PUBLISHED", publish_date, version, chash,
        )

        # 4. bind canonical — preserve One Question -> One Canonical URL
        existing = cur.execute(
            "SELECT canonical_url_id FROM questions WHERE id=?", (qid,)
        ).fetchone()
        if existing and existing["canonical_url_id"] and existing["canonical_url_id"] != uid:
            # A canonical already exists for this question; do not steal it.
            # This url is recorded but the first canonical wins.
            pass
        else:
            cur.execute(
                "UPDATE questions SET canonical_url_id=?, answer_status='ANSWERED', "
                "updated_at=CURRENT_TIMESTAMP WHERE id=?",
                (uid, qid),
            )

        # 3 & 5 & 6. keyword upsert + bind
        kid = _get_or_create(
            cur, "keywords", ["normalized_keyword"], [nk],
            ["keyword", "search_intent", "entity", "primary_question_id", "status"],
            [primary_keyword, search_intent, primary_entity, qid, "PUBLISHED"],
        )

        # 7. internal link edges (target must already be a known URL)
        for lnk in (internal_links or []):
            turl = lnk.get("target_url")
            if not turl:
                continue
            tgt = cur.execute("SELECT id FROM urls WHERE url=?", (turl,)).fetchone()
            if not tgt:
                continue
            _insert_link(cur, uid, tgt["id"], lnk.get("anchor_text"), lnk.get("relationship"))

        # 8. mark matching OPEN opportunity as PUBLISHED
        if nq:
            cur.execute(
                "UPDATE content_opportunities SET status='PUBLISHED', updated_at=CURRENT_TIMESTAMP "
                "WHERE normalized_question=? AND status IN ('OPEN','PLANNED','IN_PROGRESS')",
                (nq,),
            )

        cur.execute("COMMIT")
        return {
            "status": "COMMITTED",
            "url_id": uid,
            "question_id": qid,
            "keyword_id": kid,
            "publish_status": "PUBLISHED",
        }
    except Exception as e:  # noqa: BLE001
        try:
            cur.execute("ROLLBACK")
        except Exception:
            pass
        raise RegistryCommitError(f"Registry Commit FAILED: {e}") from e
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# 3b. register_product (PRODUCT url node; may have no primary question)
# --------------------------------------------------------------------------- #
def register_product(
    url: str,
    slug: str,
    entity: str,
    keyword: str | None = None,
    search_intent: str | None = "commercial",
    page_type: str = "PRODUCT",
    db_path: str | None = None,
) -> dict:
    conn = _connect(db_path)
    conn.isolation_level = None
    cur = conn.cursor()
    try:
        cur.execute("BEGIN IMMEDIATE")
        chash = _content_hash(url, entity)
        row = cur.execute("SELECT id FROM urls WHERE url=?", (url,)).fetchone()
        if row:
            rid = row["id"]
            cur.execute(
                "UPDATE urls SET slug=?, page_type=?, primary_entity=?, publish_status='PUBLISHED', "
                "last_updated=CURRENT_TIMESTAMP, content_hash=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                (slug, page_type, entity, chash, rid),
            )
        else:
            r = cur.execute(
                "INSERT INTO urls (url, slug, page_type, primary_entity, publish_status, "
                "content_hash) VALUES (?,?,?,?, 'PUBLISHED', ?)",
                (url, slug, page_type, entity, chash),
            )
            rid = r.lastrowid
        kid = None
        if keyword:
            nk = normalize_text(keyword)
            kid = _get_or_create(
                cur, "keywords", ["normalized_keyword"], [nk],
                ["keyword", "search_intent", "entity", "status"],
                [keyword, search_intent, entity, "PUBLISHED"],
            )
        cur.execute("COMMIT")
        return {"status": "COMMITTED", "url_id": rid, "keyword_id": kid}
    except Exception as e:  # noqa: BLE001
        try:
            cur.execute("ROLLBACK")
        except Exception:
            pass
        raise RegistryCommitError(f"Registry Commit FAILED: {e}") from e
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# 4. register_link
# --------------------------------------------------------------------------- #
def register_link(source_url: str, target_url: str, anchor_text: str | None,
                   relationship: str, db_path: str | None = None) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        s = cur.execute("SELECT id FROM urls WHERE url=?", (source_url,)).fetchone()
        t = cur.execute("SELECT id FROM urls WHERE url=?", (target_url,)).fetchone()
        if not s or not t:
            return {"status": "SKIPPED", "reason": "source or target url not found"}
        _insert_link(cur, s["id"], t["id"], anchor_text, relationship)
        conn.commit()
        return {"status": "OK", "edge": f"{source_url} -> {target_url}"}
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# 5. create_opportunity
# --------------------------------------------------------------------------- #
def create_opportunity(
    question: str,
    keyword: str | None = None,
    entity: str | None = None,
    search_intent: str | None = None,
    source_url: str | None = None,
    reason: str | None = None,
    priority: str = "MEDIUM",
    db_path: str | None = None,
) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        nq = normalize_text(question) if question else None
        if nq:
            ex = cur.execute(
                "SELECT id FROM content_opportunities WHERE normalized_question=? "
                "AND status IN ('OPEN','PLANNED','IN_PROGRESS')",
                (nq,),
            ).fetchone()
            if ex:
                return {"status": "EXISTS", "opportunity_id": ex["id"]}
        src_id = None
        if source_url:
            su = cur.execute("SELECT id FROM urls WHERE url=?", (source_url,)).fetchone()
            src_id = su["id"] if su else None
        r = cur.execute(
            """INSERT INTO content_opportunities
               (keyword, question, normalized_question, entity, search_intent, source_url_id, reason, priority, status)
               VALUES (?,?,?,?,?,?,?,?,'OPEN')""",
            (keyword, question, nq, entity, search_intent, src_id, reason, priority),
        )
        conn.commit()
        return {"status": "CREATED", "opportunity_id": r.lastrowid}
    finally:
        conn.close()


# --------------------------------------------------------------------------- #
# Supporting-question decision helper (for Creator, spec section 5/6)
# --------------------------------------------------------------------------- #
def decide_supporting_action(question: str, entity: str | None = None,
                             db_path: str | None = None) -> dict:
    res = lookup_question(question, entity, db_path=db_path)
    if res["status"] == "ANSWERED":
        return {"action": "LINK_EXISTING", "canonical_url": res["canonical_url"],
                "question_id": res["question_id"]}
    return {"action": "CONTENT_OPPORTUNITY", "canonical_url": None, "question_id": res["question_id"]}


# --------------------------------------------------------------------------- #
# Read helpers (CLI / future queries, spec section 12)
# --------------------------------------------------------------------------- #
def list_unanswered(db_path: str | None = None) -> list[dict]:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        rows = cur.execute(
            "SELECT id, question, entity, search_intent, answer_status FROM questions "
            "WHERE canonical_url_id IS NULL ORDER BY id"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def list_opportunities(status: str = "OPEN", db_path: str | None = None) -> list[dict]:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        rows = cur.execute(
            "SELECT id, keyword, question, entity, search_intent, priority, status, reason "
            "FROM content_opportunities WHERE status=? ORDER BY id",
            (status,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def show_url(url: str, db_path: str | None = None) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        u = cur.execute("SELECT * FROM urls WHERE url=?", (url,)).fetchone()
        if not u:
            return {"found": False, "url": url}
        u = dict(u)
        outgoing = cur.execute(
            "SELECT l.anchor_text, l.relationship, u2.url FROM internal_links l "
            "JOIN urls u2 ON u2.id=l.target_url_id WHERE l.source_url_id=?",
            (u["id"],),
        ).fetchall()
        incoming = cur.execute(
            "SELECT u2.url, l.anchor_text, l.relationship FROM internal_links l "
            "JOIN urls u2 ON u2.id=l.source_url_id WHERE l.target_url_id=?",
            (u["id"],),
        ).fetchall()
        q = None
        if u["primary_question_id"]:
            qr = cur.execute("SELECT * FROM questions WHERE id=?", (u["primary_question_id"],)).fetchone()
            if qr:
                q = dict(qr)
        return {
            "found": True,
            "url": u["url"],
            "page_type": u["page_type"],
            "primary_keyword": u["primary_keyword"],
            "primary_entity": u["primary_entity"],
            "search_intent": u["search_intent"],
            "publish_status": u["publish_status"],
            "content_version": u["content_version"],
            "primary_question": q["question"] if q else None,
            "outgoing_links": [dict(r) for r in outgoing],
            "incoming_links": [dict(r) for r in incoming],
            "orphan": len(incoming) == 0,
        }
    finally:
        conn.close()


def list_orphans(db_path: str | None = None) -> list[dict]:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        rows = cur.execute(
            "SELECT u.url, u.page_type FROM urls u "
            "WHERE NOT EXISTS (SELECT 1 FROM internal_links l WHERE l.target_url_id=u.id) "
            "ORDER BY u.id"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def stats(db_path: str | None = None) -> dict:
    conn = _connect(db_path)
    cur = conn.cursor()
    try:
        def _c(table, where=""):
            sql = f"SELECT COUNT(*) AS n FROM {table} {where}"
            return cur.execute(sql).fetchone()["n"]

        answered = _c("questions", "WHERE canonical_url_id IS NOT NULL")
        partial = _c("questions", "WHERE answer_status='PARTIAL'")
        unanswered = _c("questions", "WHERE canonical_url_id IS NULL AND answer_status<>'PARTIAL'")
        published = _c("urls", "WHERE publish_status='PUBLISHED'")
        open_opp = _c("content_opportunities", "WHERE status='OPEN'")
        edges = _c("internal_links")
        orphans = _c(
            "urls",
            "WHERE NOT EXISTS (SELECT 1 FROM internal_links l WHERE l.target_url_id=urls.id)",
        )
        return {
            "urls_total": _c("urls"),
            "urls_published": published,
            "questions_total": _c("questions"),
            "questions_answered": answered,
            "questions_partial": partial,
            "questions_unanswered": unanswered,
            "keywords_total": _c("keywords"),
            "open_opportunities": open_opp,
            "internal_link_edges": edges,
            "orphan_pages": orphans,
        }
    finally:
        conn.close()

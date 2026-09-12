"""P2 — Sitemap XML Parser (standard XML only, no crawler).

Responsibility (per P2-INDEX-HEALTH-PLAN.md):
  * Parse sitemap.xml (including sitemap index -> child sitemaps).
  * Extract <loc>, normalize URLs, membership check.
  * Produce ACTUAL sitemap_status for a URL.

This module does NOT talk to Google. It only reads standard Sitemap XML.
fetch_fn is injectable so tests can run without network.
"""
from __future__ import annotations

import xml.etree.ElementTree as ET


def _local(tag: str) -> str:
    """Strip XML namespace from a tag, e.g. '{ns}loc' -> 'loc'."""
    return tag.split("}", 1)[-1] if "}" in tag else tag


def normalize_url(u: str | None) -> str:
    """Lowercase, trim, drop trailing slash. No NLP, no canonicalization beyond that."""
    if not u:
        return ""
    u = u.strip().lower()
    u = u.rstrip("/")
    return u


def fetch_sitemap_urls(sitemap_url: str, fetch_fn=None, max_depth: int = 5) -> dict:
    """Fetch a sitemap URL and return all contained page URLs.

    Supports sitemap index (recurses into child <sitemap><loc>).
    Returns:
        {
          "urls": set[str],          # all <loc> under urlset
          "errors": list[dict],      # per-fetch failures
          "status": "OK" | "EMPTY" | "ERROR",
          "sitemap_urls": list[str], # sitemaps actually fetched
        }

    A fetch/parse failure is recorded in `errors` and `status` becomes "ERROR".
    It does NOT fabricate NOT_IN_SITEMAP — the caller decides per-URL status.
    """
    if fetch_fn is None:
        import urllib.request

        def _default(u: str) -> bytes:
            req = urllib.request.Request(  # noqa: S310
                u,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (compatible; WorkBuddy-P2-SitemapBot/1.0; "
                        "+https://www.lubandart.com/)"
                    )
                },
            )
            with urllib.request.urlopen(req, timeout=15) as r:  # noqa: S310
                return r.read()

        fetch_fn = _default

    urls: set[str] = set()
    errors: list[dict] = []
    visited: set[str] = set()

    def _walk(url: str, depth: int) -> None:
        if depth <= 0 or url in visited:
            return
        visited.add(url)
        try:
            data = fetch_fn(url)
        except Exception as e:  # noqa: BLE001
            errors.append({"url": url, "error": str(e)})
            return
        try:
            root = ET.fromstring(data)
        except Exception as e:  # noqa: BLE001
            errors.append({"url": url, "error": f"parse: {e}"})
            return
        local = _local(root.tag)
        if local == "sitemapindex":
            for sm in root:
                if _local(sm.tag) != "sitemap":
                    continue
                for c in sm:
                    if _local(c.tag) == "loc" and c.text:
                        _walk(c.text.strip(), depth - 1)
        elif local == "urlset":
            for u in root:
                if _local(u.tag) != "url":
                    continue
                for c in u:
                    if _local(c.tag) == "loc" and c.text:
                        urls.add(c.text.strip())
        else:
            errors.append({"url": url, "error": f"unknown root <{local}>"})

    _walk(sitemap_url, max_depth)
    if errors and not urls:
        status = "ERROR"
    elif urls:
        status = "OK"
    else:
        status = "EMPTY"
    return {
        "urls": urls,
        "errors": errors,
        "status": status,
        "sitemap_urls": list(visited),
    }


def check_sitemap_membership(sitemap_urls: set[str], url: str) -> bool:
    """True if `url` (normalized) is present in the sitemap URL set."""
    target = normalize_url(url)
    if not target:
        return False
    return any(normalize_url(s) == target for s in sitemap_urls)

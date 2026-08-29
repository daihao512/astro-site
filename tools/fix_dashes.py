#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_dashes.py — stage-4 repair helper: bring em-dash density under budget.

Em-dash overuse is the single most reliable AI-writing fingerprint, and it is
also the easiest to fix mechanically, so it gets its own tool.

Rules applied, in order:
  1. definition style  "<strong>Term</strong> — explanation"  ->  "Term: explanation"
  2. paired dashes     "X — aside — Y"                        ->  "X (aside) Y"
  3. lone prose dash   -> comma when followed by lowercase, full stop when capital

By default two rhetorical dashes are left in place on purpose: human writers do
use them, and stripping every single one makes prose mechanical again.

Usage:
  python tools/fix_dashes.py --slug <slug> --dry-run   # preview
  python tools/fix_dashes.py --slug <slug>             # apply
  python tools/fix_dashes.py --all --dry-run           # survey every post
"""

import argparse
import re
import sys

sys.path.insert(0, __import__('os').path.dirname(__file__))
import humanize_check as H  # noqa: E402

DASH = '\u2014'
POSTS = H.POSTS
BUDGET_PER_1K = 6.0


def entry_bounds(src, slug):
    """Return (start, end) character offsets of one posts.ts entry."""
    key = "slug: '%s'" % slug
    i = src.find(key)
    if i == -1:
        key = 'slug: "%s"' % slug
        i = src.find(key)
    if i == -1:
        return None
    nxt = re.search(r'\n  \{\n', src[i + 1:])
    return (i, i + 1 + nxt.start()) if nxt else (i, len(src))


def body_span(segment):
    j = segment.find('body: `')
    if j == -1:
        return None
    end = re.search(r'\n\s*`,', segment[j:])
    if not end:
        return None
    return (j + len('body: `'), j + end.start())


def fix(body, keep=2):
    """Apply the three rules, leaving `keep` dashes untouched."""
    stats = {'definition': 0, 'paired': 0, 'prose': 0}

    # rule 1 — definition style
    body, n = re.subn(r'(</strong>) %s ' % DASH, r'\1: ', body)
    stats['definition'] = n

    # rule 2 — paired dashes inside one sentence -> parentheses
    def pair_sub(m):
        stats['paired'] += 1
        return ' (%s) ' % m.group(1)
    body = re.sub(r'%s ([^%s.]{3,80}?) %s ' % (DASH, DASH, DASH), pair_sub, body)

    # rule 3 — lone dashes: comma before lowercase, full stop before capital
    def lone_sub(m):
        if stats['prose'] >= keep_from_total:
            return m.group(0)
        stats['prose'] += 1
        tail = m.group(1)
        return '. ' + tail if tail[:1].isupper() else ', ' + tail
    total = body.count(DASH)
    keep_from_total = max(0, total - keep)
    body = re.sub(r'%s ([A-Za-z][^%s]{0,120})' % (DASH, DASH), lone_sub, body)

    return body, stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--keep', type=int, default=2, help='rhetorical dashes to preserve')
    args = ap.parse_args()

    with open(POSTS, 'r', encoding='utf-8') as f:
        src = f.read()

    slugs = [args.slug] if args.slug else H.all_slugs(src)
    changed_any = False

    for slug in slugs:
        bounds = entry_bounds(src, slug)
        if not bounds:
            continue
        lo, hi = bounds
        segment = src[lo:hi]
        span = body_span(segment)
        if not span:
            continue
        bs, be = span
        body = segment[bs:be]

        before = body.count(DASH)
        _, paras = H.strip_html(body)
        wc = len(H.tokenize(' '.join(paras)))
        density = before / (wc / 1000.0) if wc else 0

        if density <= BUDGET_PER_1K:
            print('%-42s %2d dash  %5.2f/1k  ok' % (slug[:42], before, density))
            continue

        new_body, stats = fix(body, args.keep)
        after = new_body.count(DASH)
        new_density = after / (wc / 1000.0) if wc else 0

        if args.dry_run:
            print('%-42s %2d -> %2d dash  %5.2f -> %5.2f/1k  (def %d, pair %d, prose %d)  [dry-run]'
                  % (slug[:42], before, after, density, new_density,
                     stats['definition'], stats['paired'], stats['prose']))
        else:
            new_segment = segment[:bs] + new_body + segment[be:]
            src = src[:lo] + new_segment + src[hi:]
            changed_any = True
            print('%-42s %2d -> %2d dash  %5.2f -> %5.2f/1k  (def %d, pair %d, prose %d)  applied'
                  % (slug[:42], before, after, density, new_density,
                     stats['definition'], stats['paired'], stats['prose']))

    if changed_any and not args.dry_run:
        with open(POSTS, 'w', encoding='utf-8') as f:
            f.write(src)
        print('\nposts.ts updated')
    return 0


if __name__ == '__main__':
    sys.exit(main())

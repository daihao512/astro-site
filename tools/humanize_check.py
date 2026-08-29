#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
humanize_check.py — AI-flavour detector for LubandArt blog content.

Zero dependencies (Python stdlib only). Runs in milliseconds, so it can gate
every article before publish.

Five statistical signals + three human-behaviour signals:

  burstiness   sentence-length coefficient of variation   (human 0.60-1.00)
  cov          paragraph-length coefficient of variation  (human >= 0.50)
  sttr         standardised type/token ratio (200w window) (human 0.55-0.80)
  trigram_rep  repeated trigram ratio                     (human <= 0.005)
  slop         AI cliche density per 1000 words           (human <= 3)

  data_points  concrete figures with units                (target >= 8)
  experience   first-hand experience markers              (target >= 3)
  stance       judgement / warning / "don't do this"      (target >= 3)

Outputs:
  humanization   0-10   (per docs/blog-seo-geo-standard.md §2.5C weights)
  ai_likelihood  0-100  (lower is better; >= 60 = rewrite)
  hbr            %      human behaviour ratio (target >= 25%)

Usage:
  python tools/humanize_check.py --slug low-odor-tape-automotive-interiors
  python tools/humanize_check.py --all
  python tools/humanize_check.py --file draft.txt
  python tools/humanize_check.py --slug <slug> --check --threshold 80   # CI gate
  python tools/humanize_check.py --all --json
"""

import argparse
import html
import json
import os
import re
import statistics
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# ---------------------------------------------------------------- paths

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, 'src', 'data', 'posts.ts')

# ---------------------------------------------------------------- lexicons

SLOP_PATTERNS = [
    r"in today'?s (?:fast-paced|ever-evolving|rapidly|modern)",
    r"in the ever-evolving",
    r"when it comes to",
    r"delve into",
    r"it'?s important to note",
    r"it is important to note",
    r"it'?s worth noting",
    r"in conclusion",
    r"this underscores",
    r"unlock the power of",
    r"game[- ]chang\w+",
    r"revolutionar\w+",
    r"cutting[- ]edge",
    r"seamless(?:ly)?",
    r"robust solution",
    r"paradigm shift",
    r"testament to",
    r"navigate the (?:complex|landscape)",
    r"realm of",
    r"tapestry of",
    r"symbi\w+",
    r"holistic approach",
    r"synerg\w+",
    r"leverage the power",
    r"the utilization of",
    r"the implementation of",
    r"a wide range of",
    r"various (?:industrial )?applications",
    r"generally considered",
    r"in many cases",
    r"overall,",
    r"it'?s clear that",
    r"plays? a (?:crucial|vital|key) role",
    r"ensure optimal",
    r"furthermore",
    r"moreover",
]
SLOP_RE = re.compile('|'.join(SLOP_PATTERNS), re.I)

# Concrete figures with units — the single strongest human signal
DATA_RE = re.compile(
    r"\d+(?:\.\d+)?\s?"
    r"(?:mm|µm|μm|um|cm|m|mil|inch|in|°C|℃|C\b|°F|N/25mm|N/25 mm|N\b|kN|MPa|kPa|"
    r"g/m2|gsm|GSM|g\b|kg|oz|lb|%|percent|h\b|hrs?|min(?:ute)?s?|s\b|"
    r"V\b|A\b|W\b|cycles?|times?|years?|months?|weeks?|days?|"
    r"VDA\s?\d+|ISO\s?\d+|ASTM\s?[A-Z]?\d+|DIN\s?\d+|GB/T\s?\d+|UL\s?\d+|JIS\s?[A-Z]?\d+)",
    re.I,
)

EXPERIENCE_RE = re.compile(
    r"\b(?:we|our|us|I)\b[^.]{0,80}?"
    r"(?:test|tested|testing|measure|measured|found|find|observe|observed|see|saw|"
    r"run|ran|check|checked|verify|verified|supply|supplied|ship|shipped|make|made|"
    r"produce|produced|convert|recommend|recommended|specify|specified|build|built|"
    r"qualify|qualified|audit|audited|hear|heard|ask|asked)",
    re.I,
)
EXPERIENCE_BARE_RE = re.compile(
    r"\b(?:in our experience|from our|on the (?:shop|production|line)|in the field|"
    r"customers? (?:tell|report|ask|say|find)|we'?ve seen|we'?ve found|"
    r"on the shop floor|in production|field data|lab data|our (?:lab|test|data))\b",
    re.I,
)

STANCE_RE = re.compile(
    r"\b(?:do not|don'?t|avoid|never|resist the urge|mistake|pitfall|overlook(?:ed)?|"
    r"ignore[ds]?|wrong|incorrect|fails?|fail(?:ure|ed)?|caution|careful|beware|"
    r"warning|the (?:trap|catch|problem|risk)|common(?:ly)? (?:error|mistake)|"
    r"not recommend(?:ed)?|rarely|usually (?:not|wrong)|in practice|actually|"
    r"instead of|rather than|this is where)\b",
    re.I,
)

COLLOQUIAL_RE = re.compile(
    r"\b(?:here'?s the thing|the catch|the point is|in short|simply put|that said|"
    r"worth (?:noting|remembering)|keep in mind|note that|in other words|"
    r"to be fair|let'?s be honest)\b",
    re.I,
)

ABBREV = ['e.g', 'i.e', 'etc', 'vs', 'Fig', 'No', 'approx', 'ca', 'VDA', 'ISO', 'DIN',
          'ASTM', 'UL', 'GB', 'JIS', 'Mr', 'Dr', 'Inc', 'Ltd', 'Co']


# ---------------------------------------------------------------- extraction

def read_posts():
    with open(POSTS, 'r', encoding='utf-8') as f:
        return f.read()


def extract_body(src, slug):
    """Pull the raw HTML body for one post out of posts.ts.

    IMPORTANT: the search is bounded by the next array entry. Without that
    bound, a post with no `body` would silently pick up the *next* post's
    body (src.find scans past the closing brace).
    """
    key = "slug: '%s'" % slug
    i = src.find(key)
    if i == -1:
        key = 'slug: "%s"' % slug
        i = src.find(key)
    if i == -1:
        return None, 'slug not found in posts.ts'

    # Bound the search to this entry: next "  {" at 2-space indent, or EOF.
    nxt = re.search(r'\n  \{\n', src[i + 1:])
    segment = src[i:i + 1 + nxt.start()] if nxt else src[i:]

    j = segment.find('body: `')
    if j == -1:
        return None, 'post has no body field yet ("coming soon")'

    # body ends at the first "`," that starts a line (closing backtick + comma)
    end = re.search(r'\n\s*`,', segment[j:])
    if not end:
        return None, 'could not locate end of body template literal'
    return segment[j + len('body: `'):j + end.start()], None


def all_slugs(src):
    return re.findall(r"slug: '([a-z0-9-]+)'", src)


def strip_html(raw):
    """Turn article HTML into (plain_text, paragraph_list)."""
    # block boundaries become paragraph breaks
    blocks = re.split(r'</?(?:p|li|h[1-6]|td|th|tr|blockquote|div)[^>]*>', raw)
    paras = []
    for b in blocks:
        t = re.sub(r'<[^>]+>', ' ', b)
        t = html.unescape(t)
        t = re.sub(r'&nbsp;?', ' ', t)
        t = re.sub(r'\s+', ' ', t).strip()
        if len(t.split()) >= 4:
            paras.append(t)
    plain = re.sub(r'<[^>]+>', ' ', raw)
    plain = html.unescape(plain)
    plain = re.sub(r'\s+', ' ', plain).strip()
    return plain, paras


def split_sentences(text):
    """Sentence split that survives 'VDA 270.' 'e.g.' and similar."""
    protected = text
    for a in ABBREV:
        protected = re.sub(r'\b(%s)\.' % re.escape(a), r'\1<DOT>', protected, flags=re.I)
    protected = re.sub(r'(\d)\.(\s)', r'\1<DOT>\2', protected)  # "3.0 Next" -> keep
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z"(])', protected)
    out = [p.replace('<DOT>', '.').strip() for p in parts]
    return [s for s in out if len(s.split()) >= 3]


# ---------------------------------------------------------------- metrics

def tokenize(text):
    return re.findall(r"[A-Za-z][A-Za-z'-]*", text.lower())


def sttr(words, window=200):
    """Standardised type/token ratio — mean TTR over fixed windows."""
    if len(words) < window:
        return len(set(words)) / len(words) if words else 0.0
    vals = []
    for i in range(0, len(words) - window + 1, window):
        chunk = words[i:i + window]
        vals.append(len(set(chunk)) / len(chunk))
    return statistics.mean(vals)


def trigram_rep(words):
    if len(words) < 3:
        return 0.0
    grams = [' '.join(words[i:i + 3]) for i in range(len(words) - 2)]
    if not grams:
        return 0.0
    return 1.0 - (len(set(grams)) / len(grams))


def band(v, bands):
    """bands = [(upper_bound_exclusive, score), ...] ascending. Returns 0-100."""
    for thr, sc in bands:
        if v < thr:
            return sc
    return bands[-1][1]


def analyse(text, paras):
    words = tokenize(text)
    wc = len(words)
    if wc < 50:
        return None

    sentences = split_sentences(text)
    slens = [len(s.split()) for s in sentences] or [0]
    plens = [len(p.split()) for p in paras] or [0]

    burst = (statistics.pstdev(slens) / statistics.mean(slens)) if statistics.mean(slens) else 0.0
    cov = (statistics.pstdev(plens) / statistics.mean(plens)) if len(plens) > 1 and statistics.mean(plens) else 0.0
    st = sttr(words)
    tri = trigram_rep(words)

    slop_hits = SLOP_RE.findall(text)
    slop = len(slop_hits) / (wc / 1000.0)

    data_hits = len(DATA_RE.findall(text))
    exp_hits = len(EXPERIENCE_RE.findall(text)) + len(EXPERIENCE_BARE_RE.findall(text))
    stance_hits = len(STANCE_RE.findall(text))
    coll_hits = len(COLLOQUIAL_RE.findall(text))

    dash = text.count('—') + text.count('——')
    dash_density = dash / (wc / 1000.0)

    triads = len(re.findall(r'not only[^.]{0,120}but also', text, re.I))

    # --- human behaviour ratio: how many sentences carry a human signal
    human_sents = set()
    for idx, s in enumerate(sentences):
        if DATA_RE.search(s):
            human_sents.add(idx)
        if EXPERIENCE_RE.search(s) or EXPERIENCE_BARE_RE.search(s):
            human_sents.add(idx)
        if STANCE_RE.search(s):
            human_sents.add(idx)
        if COLLOQUIAL_RE.search(s):
            human_sents.add(idx)
        if s.rstrip().endswith('?') and len(s.split()) > 5:
            human_sents.add(idx)
    hbr = 100.0 * len(human_sents) / len(sentences) if sentences else 0.0

    # --- AI likelihood (0-100, lower is better)
    s_burst = band(burst, [(0.35, 95), (0.45, 80), (0.55, 58), (0.68, 28), (0.90, 10),
                           (1.15, 16), (float('inf'), 35)])
    s_cov = band(cov, [(0.30, 95), (0.45, 72), (0.60, 38), (0.85, 12), (float('inf'), 24)])
    s_sttr = band(st, [(0.45, 92), (0.53, 62), (0.62, 28), (0.78, 10), (float('inf'), 20)])
    s_tri = band(tri, [(0.002, 5), (0.005, 20), (0.010, 45), (0.020, 72), (float('inf'), 95)])
    s_slop = band(slop, [(1.0, 5), (2.0, 18), (3.0, 45), (5.0, 72), (float('inf'), 92)])

    ai = (0.22 * s_burst + 0.18 * s_cov + 0.20 * s_sttr + 0.18 * s_tri + 0.22 * s_slop)

    # --- humanization 0-10 (weights per standard §2.5C)
    def norm(v, target, floor):
        """1.0 at/above target, linear down to 0 at floor."""
        if target == floor:
            return 1.0 if v >= target else 0.0
        return max(0.0, min(1.0, (v - floor) / (target - floor)))

    h_slop = 1.0 - min(1.0, slop / 5.0)                     # 20%
    h_cov = norm(cov, 0.60, 0.20)                           # 15%
    h_burst = norm(burst, 0.70, 0.30)                       # 15%
    h_dash = (1.0 - min(1.0, dash_density / 6.0)) * (1.0 - min(1.0, triads / 4.0))  # 10%
    h_data = norm(data_hits, 8, 2)                          # 15%
    h_exp = norm(exp_hits, 3, 0)                            # 15%
    h_stance = norm(stance_hits, 3, 0)                      # 10%

    humanization = 10.0 * (0.20 * h_slop + 0.15 * h_cov + 0.15 * h_burst +
                           0.10 * h_dash + 0.15 * h_data + 0.15 * h_exp + 0.10 * h_stance)

    return {
        'words': wc,
        'sentences': len(sentences),
        'paragraphs': len(paras),
        'burstiness': round(burst, 3),
        'cov': round(cov, 3),
        'sttr': round(st, 3),
        'trigram_rep': round(tri, 4),
        'slop_per_1k': round(slop, 2),
        'slop_hits': slop_hits,
        'dash_per_1k': round(dash_density, 2),
        'triads': triads,
        'data_points': data_hits,
        'experience': exp_hits,
        'stance': stance_hits,
        'colloquial': coll_hits,
        'hbr': round(hbr, 1),
        'ai_likelihood': round(ai, 1),
        'humanization': round(humanization, 2),
        '_sub': {
            'burst': round(s_burst), 'cov': round(s_cov), 'sttr': round(s_sttr),
            'trigram': round(s_tri), 'slop': round(s_slop),
        },
    }


# ---------------------------------------------------------------- reporting

BAR_TARGETS = {
    'burstiness': (0.60, 1.00, 'sentence-length variation'),
    'cov': (0.50, 0.90, 'paragraph-length variation'),
    'sttr': (0.55, 0.80, 'vocabulary diversity'),
    'trigram_rep': (0.0, 0.005, 'repeated 3-word phrases'),
    'slop_per_1k': (0.0, 3.0, 'AI cliches per 1000w'),
    'data_points': (8, 40, 'figures with units'),
    'experience': (3, 30, 'first-hand markers'),
    'stance': (3, 30, 'judgement / warning'),
    'hbr': (25.0, 60.0, 'human behaviour ratio %'),
}


def verdict(r):
    if r['ai_likelihood'] >= 60 or r['humanization'] < 5.5 or r['hbr'] < 15:
        return 'FAIL', 'rewrite required'
    if r['ai_likelihood'] >= 40 or r['humanization'] < 7.0 or r['hbr'] < 22:
        return 'WARN', 'revise before publish'
    return 'PASS', 'ok to publish'


def print_report(slug, r, verbose=False):
    state, msg = verdict(r)
    mark = {'PASS': '[PASS]', 'WARN': '[WARN]', 'FAIL': '[FAIL]'}[state]
    print('=' * 68)
    print('%s  %s' % (mark, slug))
    print('=' * 68)
    print('  words %-6d  sentences %-5d  paragraphs %d' %
          (r['words'], r['sentences'], r['paragraphs']))
    print()
    print('  humanization      %5.2f / 10   (target >= 7.5)' % r['humanization'])
    print('  AI likelihood     %5.1f / 100  (target <= 40)' % r['ai_likelihood'])
    print('  human behaviour   %5.1f %%       (target >= 25%%)' % r['hbr'])
    print()
    print('  %-14s %10s   %-14s %s' % ('metric', 'value', 'target', 'status'))
    print('  ' + '-' * 62)
    for key, (lo, hi, label) in BAR_TARGETS.items():
        v = r[key]
        ok = lo <= v <= hi if key not in ('data_points', 'experience', 'stance') else v >= lo
        flag = 'ok' if ok else ('LOW' if v < lo else 'HIGH')
        print('  %-14s %10s   %-14s %s' % (key, v, '%s-%s' % (lo, hi), flag))
    print('  ' + '-' * 62)
    print('  dash/1k %-6s triads(not only..but also) %d' % (r['dash_per_1k'], r['triads']))
    if r['slop_hits']:
        uniq = sorted(set(h.lower().strip() for h in r['slop_hits']))
        print('  slop phrases (%d): %s' % (len(r['slop_hits']), ', '.join(uniq[:10])))
    if verbose:
        print('  sub-scores: burst %s  cov %s  sttr %s  trigram %s  slop %s' %
              (r['_sub']['burst'], r['_sub']['cov'], r['_sub']['sttr'],
               r['_sub']['trigram'], r['_sub']['slop']))
    print()
    print('  >>> %s — %s' % (state, msg))
    print()


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description='AI-flavour detector for blog content')
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--slug', help='post slug in src/data/posts.ts')
    g.add_argument('--all', action='store_true', help='scan every post that has a body')
    g.add_argument('--file', help='plain-text or HTML file')
    ap.add_argument('--check', action='store_true', help='exit 1 when below threshold')
    ap.add_argument('--threshold', type=float, default=70.0,
                    help='minimum humanization*10 gate for --check (default 70)')
    ap.add_argument('--json', action='store_true', help='machine-readable output')
    ap.add_argument('--verbose', action='store_true')
    args = ap.parse_args()

    results = {}

    if args.file:
        with open(args.file, 'r', encoding='utf-8') as f:
            raw = f.read()
        plain, paras = strip_html(raw)
        r = analyse(plain, paras)
        if not r:
            print('text too short to analyse', file=sys.stderr)
            return 2
        results[os.path.basename(args.file)] = r
    else:
        src = read_posts()
        slugs = all_slugs(src)
        for s in slugs:
            body, err = extract_body(src, s)
            if not body:
                continue
            plain, paras = strip_html(body)
            r = analyse(plain, paras)
            if r:
                results[s] = r
            if not args.all:
                break
        if args.slug and args.slug not in results:
            body, err = extract_body(src, args.slug)
            print('error: %s (%s)' % (args.slug, err or 'unknown'), file=sys.stderr)
            return 2

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        for slug, r in results.items():
            print_report(slug, r, args.verbose)

        if len(results) > 1:
            print('=' * 68)
            print('  SUMMARY')
            print('  %-42s %6s %7s %7s  %s' % ('slug', 'words', 'human', 'AI%', 'state'))
            print('  ' + '-' * 68)
            for slug, r in sorted(results.items(), key=lambda kv: kv[1]['humanization']):
                st, _ = verdict(r)
                print('  %-42s %6d %7.2f %7.1f  %s' %
                      (slug[:42], r['words'], r['humanization'], r['ai_likelihood'], st))
            print()

    if args.check:
        worst = min((r['humanization'] * 10) for r in results.values())
        if worst < args.threshold:
            print('GATE FAILED: worst score %.1f < threshold %.1f' % (worst, args.threshold),
                  file=sys.stderr)
            return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())

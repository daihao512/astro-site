#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LubandArt 选题优先级打分器（流水线第 0 阶段）。

读取关键词 CSV（keyword,volume,cpc,kd,intent,growth[,cluster,force_fit]），
自动比对 products.ts / industries.ts 计算「战略契合 Fit」，
输出按 Priority 排序、带三道准入闸结论的编辑日历。

零依赖（仅标准库）。所有超参可用 CLI 覆盖。

用法:
  python tools/topic_score.py keywords.sample.csv
  python tools/topic_score.py my.csv --out calendar.csv --kd-gate 35
"""
import csv, re, sys, os, io, argparse

# ---------- 默认超参（CLI 可覆盖） ----------
W_INTENT, W_FIT, W_CPC, W_KD, W_VOL, W_GROWTH = 0.25, 0.20, 0.20, 0.15, 0.10, 0.10
CPC_CAP    = 8.0    # $CPC 映射到 100 分的上限
VOL_CAP    = 300    # 月搜索量上限
GROWTH_CAP = 50     # 增速(%)上限
KD_GATE    = 40     # 难度闸：超过则标记"需长尾变体"
VOL_FLOOR  = 20     # 搜索量地板
INTENT_MAP = {'BOFU': 100, 'MOFU': 70, 'TOFU': 40, 'INFO': 10, 'TRAN': 100}

# 过于泛、不作为产品/行业判别词的 token
GENERIC = {'tape', 'adhesive', '胶', '双面', 'double', 'sided', 'the', 'and', 'for'}


def die(msg):
    sys.stderr.write('ERROR: ' + msg + '\n')
    sys.exit(1)


def keep(w):
    """token 是否保留为判别词：拉丁词≥3 字符，CJK 词≥2 字符。"""
    if not w or w in GENERIC:
        return False
    if any('\u4e00' <= c <= '\u9fff' for c in w):
        return len(w) >= 2
    return len(w) >= 3


# ---------- 解析 products.ts / industries.ts ----------
def parse_blocks(path):
    if not os.path.exists(path):
        return []
    txt = open(path, encoding='utf-8').read()
    out = []
    for m in re.finditer(r'slug:\s*"([^"]+)"', txt):
        start = m.end()
        nxt = re.search(r'slug:\s*"([^"]+)"', txt[start:])
        end = start + nxt.start() if nxt else len(txt)
        chunk = txt[m.start():end]

        def g(field):
            mm = re.search(field + r':\s*"([^"]*)"', chunk)
            return mm.group(1) if mm else ''

        def arr(field):
            mm = re.search(field + r':\s*\[([^\]]*)\]', chunk)
            return re.findall(r'"([^"]*)"', mm.group(1)) if mm else []

        out.append({
            'slug': m.group(1),
            'name': g('name'), 'en': g('en'), 'base': g('base'),
            'apps': arr('applications'),
            'solutions': arr('solutions'),
        })
    return out


def build_lexicon(prods, inds):
    prod_lex, ind_lex = set(), set()
    prod_tokens, ind_tokens = [], []
    for p in prods:
        toks = set()
        for f in (p['name'], p['en'], p['base']):
            for w in re.split(r'[^a-z0-9\u4e00-\u9fff]+', (f or '').lower()):
                if keep(w):
                    toks.add(w)
                    prod_lex.add(w)
        for a in p['apps']:
            for w in re.split(r'[^a-z0-9\u4e00-\u9fff]+', a.lower()):
                if keep(w):
                    toks.add(w)
                    prod_lex.add(w)
        prod_tokens.append(sorted(toks))
    for i in inds:
        toks = set()
        for f in (i['name'], i['en']):
            for w in re.split(r'[^a-z0-9\u4e00-\u9fff]+', (f or '').lower()):
                if keep(w):
                    toks.add(w)
                    ind_lex.add(w)
        for a in i['apps'] + i['solutions']:
            for w in re.split(r'[^a-z0-9\u4e00-\u9fff]+', a.lower()):
                if keep(w):
                    toks.add(w)
                    ind_lex.add(w)
        ind_tokens.append(sorted(toks))
    return prod_lex, ind_lex, prod_tokens, ind_tokens


def match(kw, prod_lex, ind_lex, prods, inds, prod_tokens, ind_tokens):
    k = kw.lower()
    hit_p = any(w in k for w in prod_lex)
    hit_i = any(w in k for w in ind_lex)
    matched_p, matched_i = [], []
    for p, toks in zip(prods, prod_tokens):
        if any(w in k for w in toks):
            matched_p.append(p['slug'])
    for i, toks in zip(inds, ind_tokens):
        if any(w in k for w in toks):
            matched_i.append(i['slug'])
    fit = 100 if (hit_p and hit_i) else 60 if hit_p else 30 if hit_i else 0
    return fit, sorted(set(matched_p)), sorted(set(matched_i))


# (match 已在上方定义；此处为历史重复定义，已移除)


# ---------- 打分 ----------
def norm(x, cap):
    return min(x / cap, 1.0) * 100.0


def score_row(row, prod_lex, ind_lex, prods, inds, prod_tokens=None, ind_tokens=None,
              kd_gate=KD_GATE, vol_floor=VOL_FLOOR, cpc_cap=CPC_CAP,
              vol_cap=VOL_CAP, growth_cap=GROWTH_CAP,
              w_intent=W_INTENT, w_fit=W_FIT, w_cpc=W_CPC, w_kd=W_KD,
              w_vol=W_VOL, w_growth=W_GROWTH):
    kw = (row.get('keyword') or '').strip()
    try:
        volume = int(float(row.get('volume') or 0))
    except ValueError:
        volume = 0
    try:
        cpc = float(row.get('cpc') or 0)
    except ValueError:
        cpc = 0.0
    try:
        kd = int(float(row.get('kd') or 0))
    except ValueError:
        kd = 0

    intent_raw = (row.get('intent') or '').strip().upper()
    if intent_raw in INTENT_MAP:
        I = INTENT_MAP[intent_raw]
    else:
        try:
            I = float(intent_raw)
        except ValueError:
            I = 40  # 默认 TOFU

    g = (row.get('growth') or '').strip()
    try:
        growth = float(g)
    except ValueError:
        growth = None

    ff = (row.get('force_fit') or '').strip()
    if ff:
        try:
            fit = float(ff)
        except ValueError:
            fit = 0
        matched_p, matched_i = [], []
    else:
        fit, matched_p, matched_i = match(kw, prod_lex, ind_lex, prods, inds,
                                      prod_tokens or [], ind_tokens or [])

    C = norm(cpc, cpc_cap)
    K = 100 - kd
    V = norm(volume, vol_cap)
    G = norm(growth, growth_cap) if growth is not None else 50.0

    priority = (w_intent * I + w_fit * fit + w_cpc * C + w_kd * K
                + w_vol * V + w_growth * G)

    notes, eligible = [], True
    if kd > kd_gate:
        notes.append('难度过高(KD>%d)需长尾变体' % kd_gate)
        eligible = False
    if volume < vol_floor:
        notes.append('搜索量<%d地板' % vol_floor)
        eligible = False
    if fit <= 0:
        notes.append('无产品/行业映射,战略外')
        eligible = False

    return {
        'keyword': kw, 'volume': volume, 'cpc': cpc, 'kd': kd, 'intent': intent_raw,
        'fit': int(fit), 'priority': round(priority, 1), 'eligible': eligible,
        'notes': '; '.join(notes), 'products': ','.join(matched_p),
        'industries': ','.join(matched_i), 'cluster': (row.get('cluster') or '').strip(),
    }


def main():
    ap = argparse.ArgumentParser(description='LubandArt 选题优先级打分器')
    ap.add_argument('csv')
    ap.add_argument('--products', default='src/data/products.ts')
    ap.add_argument('--industries', default='src/data/industries.ts')
    ap.add_argument('--out', default=None)
    ap.add_argument('--kd-gate', type=int, default=KD_GATE)
    ap.add_argument('--vol-floor', type=int, default=VOL_FLOOR)
    ap.add_argument('--cpc-cap', type=float, default=CPC_CAP)
    ap.add_argument('--w-intent', type=float, default=W_INTENT)
    ap.add_argument('--w-fit', type=float, default=W_FIT)
    ap.add_argument('--w-cpc', type=float, default=W_CPC)
    ap.add_argument('--w-kd', type=float, default=W_KD)
    ap.add_argument('--w-vol', type=float, default=W_VOL)
    ap.add_argument('--w-growth', type=float, default=W_GROWTH)
    args = ap.parse_args()

    prods = parse_blocks(args.products)
    inds = parse_blocks(args.industries)
    if not prods:
        die('未解析到产品，检查 --products 路径: ' + args.products)
    prod_lex, ind_lex, prod_tokens, ind_tokens = build_lexicon(prods, inds)

    raw = open(args.csv, encoding='utf-8-sig').read()
    lines = [ln for ln in raw.splitlines() if not ln.strip().startswith('#')]
    rows = []
    for r in csv.DictReader(io.StringIO('\n'.join(lines))):
        if not (r.get('keyword') or '').strip():
            continue
        rows.append(score_row(r, prod_lex, ind_lex, prods, inds,
                              prod_tokens=prod_tokens, ind_tokens=ind_tokens,
                              kd_gate=args.kd_gate, vol_floor=args.vol_floor,
                              cpc_cap=args.cpc_cap, w_intent=args.w_intent,
                              w_fit=args.w_fit, w_cpc=args.w_cpc, w_kd=args.w_kd,
                              w_vol=args.w_vol, w_growth=args.w_growth))

    rows.sort(key=lambda x: x['priority'], reverse=True)

    headers = ['rank', 'keyword', 'volume', 'cpc', 'kd', 'intent', 'fit',
               'priority', 'eligible', 'products', 'industries', 'cluster', 'notes']
    out_lines = [','.join(headers)]
    for i, r in enumerate(rows, 1):
        out_lines.append(','.join([
            str(i), r['keyword'], str(r['volume']), str(r['cpc']), str(r['kd']),
            r['intent'], str(r['fit']), str(r['priority']),
            'YES' if r['eligible'] else 'NO', r['products'], r['industries'],
            r['cluster'], '"' + r['notes'] + '"']))
    out_txt = '\n'.join(out_lines)

    if args.out:
        open(args.out, 'w', encoding='utf-8').write(out_txt)
        print('已写出: ' + args.out)
    print(out_txt)

    elig = [r for r in rows if r['eligible']]
    print('\n--- 汇总 ---')
    print('候选 %d 个，准入 %d 个，战略外/难度高 %d 个'
          % (len(rows), len(elig), len(rows) - len(elig)))
    if elig:
        print('Top 选题（按优先级）:')
        for r in elig[:10]:
            print('  %5.1f  %-40s [%s] 产品:%s 行业:%s'
                  % (r['priority'], r['keyword'], r['intent'],
                     r['products'] or '-', r['industries'] or '-'))


if __name__ == '__main__':
    main()

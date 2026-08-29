# 知识库与关键词选题包（SoT · 选题打分）

> **本包定位**：这是内容流水线的**两个最上游、最独立的关键板块**——**知识库（素材来源 SoT）** 与 **关键词/选题选择**。两者互不从属，但共同构成「写什么」与「凭什么写」的地基。
>
> - **板块一｜知识库（Source of Truth）**：文章的技术知识从哪来——不靠 AI 凭记忆编，靠自建素材库。
> - **板块二｜关键词选题**：写什么不拍脑袋——用可量化打分模型驱动，输入真实搜索数据，输出优先级编辑日历。
>
> **下游衔接**：本包输出 → 选题卡（主词/长尾/映射产品）+ 素材卡（技术事实）→ 交给《Blog 发布流程包》执行成文并发布。

---

## 0. TL;DR（先给结论）

1. **素材 ≠ 让 AI 凭记忆编。** 文章知识必须来自「自建素材库（SoT）」，AI 只做综合与成文，**不发明技术事实**。
2. **选题 ≠ 拍脑袋。** 由可量化打分模型驱动，输入真实关键词数据（搜索量 / 竞价 / 难度 / 增速 / 意图），输出按优先级排序的编辑日历。
3. **工业 B2B 不追流量，追「能卖出去的意图」。** 高搜索量往往=低价值泛词；竞价 CPC 才是「有人肯花钱买这个流量」的硬证据。
4. **每个选题必须映射到一条在售产品 + 一个行业**（脚本用 `products.ts` / `industries.ts` 自动校验），否则就是无效劳动——有流量无询盘。

---

# 板块一：知识库（SoT — Source of Truth）

> 护城河是**独家一手技术数据**（规格、检测报告、认证、真实案例）。通用网络内容谁都能写，不形成权重。把零散 PDF / `products.ts` / 证书**抽取成结构化素材卡**，写作才能稳定引用、且每个数字可追溯。

## 1.1 四层来源金字塔

| 层级 | 来源 | 权威度 | 用途 | 能否直接写 |
|---|---|---|---|---|
| **T1 自有技术档案** | `products.ts` 规格、`产品检测报告/`、`public/reports/*.pdf`、`public/certs/`（ISO/RoHS）、生产/QC 记录、真实项目案例 | ★★★★★ | 任何技术参数 / 性能宣称 / 合规声明 | ✅ 必须优先引用 |
| **T2 一线业务反馈** | 销售/客服从真实买家处收集的问题、异议、样品申请理由 | ★★★★ | FAQ、常见误区、选型因素 | ✅ 零竞争、高 E-E-A-T |
| **T3 行业标准/法规** | ASTM / ISO / GB / VDA / REACH / RoHS 指令、EPA / ECHA | ★★★★ | 定义、合规框架、标准号引用 | ✅ 引用标准号 |
| **T4 同业公开文献** | 竞品公开 TDS、专利、论文、行业媒体 | ★★ | 差距分析、验证、找空白 | ⚠️ 仅作参考，**禁止直接搬运** |

## 1.2 三条硬规则

1. **任何定量宣称必须有出处**：写「耐温 −40~180℃」必须能在 `products.ts` 或某份报告里指出来源。无来源的数字不写。
2. **绝不为凑指标编造**（延续红线）：案例、客户反馈、测试数据若无真实素材，记「待补」。
3. **外部网络内容只用于验证，不用于供给实质知识**：AI 训练记忆里的「通识」不可作为产品技术事实的依据——那是泛泛而谈，没有独家数据，稀释 E-E-A-T。

## 1.3 素材库的运作方式

把原始文件**抽取成结构化素材卡**，写作时从卡里取数，而非每次翻 PDF：

```
docs/sources/
├── README.md            # 本库说明 + 抽取规范
├── acrylic.md           # 由 products.ts + pet-rohs.pdf 抽取
├── low-odor.md          # 由 products.ts + low-odor-tissue-odor.pdf 抽取
├── pe-foam.md           # 由 products.ts + pe-foam-*.pdf 等抽取
├── flame-retardant.md
└── pet.md
```

每张素材卡包含：规格速查表（带单位+条件）、可引用事实、关联报告 PDF 路径、待补清单。

**抽取纪律**：数字原样转录，不四舍五入、不「美化」；报告结论注明测试标准与条件（如「VDA 270，40℃ 变体」）；现有文件无法确认的数字 → 记「待补」，不臆测。

## 1.4 当前素材卡清单

| 素材卡 | 主要来源 | 状态 |
|---|---|---|
| `acrylic.md` | `products.ts`(acrylic) + `public/reports/pet-rohs.pdf` | ✅ |
| `low-odor.md` | `products.ts`(low-odor) + `public/reports/low-odor-tissue-odor.pdf` | ✅ |
| `pe-foam.md` | `products.ts`(pe-foam) + `public/reports/pe-foam-*.pdf` | ✅ |
| `flame-retardant.md` | `products.ts`(flame-retardant) + `public/reports/flame-retardant-tissue-rohs.pdf` | ✅ |
| `pet.md` | `products.ts`(pet) + `public/reports/pet-*.pdf` | ✅ |

> 已发布 7 份真实检测/认证 PDF：`low-odor-tissue-odor` / `pe-foam-rohs` / `pe-foam-tape-rohs` / `pe-foam-uv-aging` / `pet-rohs` / `pet-tape-rohs` / `flame-retardant-tissue-rohs`，均位于 `public/reports/`。

## 1.5 素材卡标准模板（写新卡时遵守）

```markdown
# <产品/主题> 素材卡

## 规格速查（带单位 + 条件）
| 参数 | 值 | 条件 / 标准 | 出处 |
|---|---|---|---|
| 使用温度 | −20 ~ 100 °C | 常态 | products.ts:acrylic |
| 气味等级 | ≤ 3.0 | VDA 270, 40℃ 变体 | public/reports/low-odor-tissue-odor.pdf |

## 可引用事实
- <可直接写进文章的句子，附出处>

## 关联报告
- public/reports/<file>.pdf

## 待补清单
- [ ] <无法确认、需真实素材的数字/案例>
```

## 1.6 待建（T2 一线反馈层）

销售/客服从真实买家处收集的问题、异议、样品申请理由 → 沉淀为 `docs/sources/faq-*.md`，直接喂给文章 FAQ 段与「常见误区」段（零竞争、高 E-E-A-T）。

---

# 板块二：关键词选题（写什么，不拍脑袋）

## 2.1 信号逐一表态

| 信号 | 工业 B2B 里的真实权重 | 说明 |
|---|---|---|
| **搜索量 Volume** | 低（仅作地板） | 工业词绝对值都低（10–300/月）但价值高。「tape」几万搜索量你排不进也转化差 |
| **竞价 CPC** | **高（揭示性价值信号）** | 广告主肯花 $3–8/点击 = 这个词真能转化，是 B2B 最好的意图代理信号之一 |
| **关键词难度 KD** | **高（当作闸，不是分）** | 小站必须挑 KD 低的打；KD 太高就做长尾变体 |
| **增速 Growth** | 中（找蓝海） | 新兴 niche 抢先占（如 EV 电池胶带、低 VOC 车内） |
| **热搜 Trending** | 低 | 多为 B2C 噪音；除非法规/贸易事件，否则不相关 |
| **商业意图 Intent** | **最高** | 买家/经销商/OEM 在搜吗？「pe foam tape supplier」≫「what is foam tape」 |

> **结论**：不要单看任何一个信号。Volume 决定「值不值得写」，CPC+Intent 决定「值多少钱」，KD 决定「写不写得过」，Fit 决定「写了对我们生意有没有用」。

## 2.2 优先级打分公式（0–100）

每个候选词归一化到 0–100 后加权：

```
Priority = 0.25·I  + 0.20·F  + 0.20·C  + 0.15·K  + 0.10·V  + 0.10·G

I = 意图分      (BOFU/TRAN=100 · MOFU=70 · TOFU=40 · INFO=10)
F = 战略契合    (产品+行业=100 · 仅产品=60 · 仅行业=30 · 无=0，脚本自动比对 products.ts + industries.ts)
C = CPC 分      = min(CPC / 8, 1) × 100
K = 难度分      = 100 − KD
V = 量分        = min(Volume / 300, 1) × 100
G = 增速分      = 已知则 min(Growth / 50, 1) × 100，未知取中性 50
```

权重与上限均可经 CLI 覆盖（`--w-intent` 等、`--cpc-cap`、`--kd-gate`）。

## 2.3 三道准入闸（全过才进编辑日历）

```
KD ≤ 40           (难度过高 → 标记「需长尾变体」)
Volume ≥ 20       (低于地板 → 流量不值得)
Fit > 0           (不映射到任何产品/行业 → 战略外，除非是品牌/支柱词)
```

## 2.4 反拍脑袋的完整机器

```
1. 用关键词工具导出 CSV（列：keyword, volume, cpc, kd, intent, growth[, cluster]）
   工具：Ahrefs / SEMrush / Google Keyword Planner（免费）/ Search Console（自有真实数据）
   ⚠️ 没有真实数据前，不要凭感觉填数字——见 §3 红字。
2. python tools/topic_score.py keywords.csv --out calendar.csv
   → 脚本自动比对 products.ts / industries.ts 算 Fit，输出按 Priority 排序、带闸结论的清单
3. 人工从清单里挑 → 填选题卡（《Blog 发布流程包》§2）→ 开工
```

### 选题打分器 `tools/topic_score.py`

- **零依赖**（仅 stdlib），读 CSV、自动比对产品/行业算战略契合 Fit、输出按优先级排序的编辑日历。
- **输入 CSV 列**：`keyword, volume, cpc, kd, intent, growth[, cluster]`。
- **关键**：`products` 列会自动显示命中的产品 slug（基于 `products.ts` 的 base/应用英文判别词 + 中文名）；命中产品+行业 → Fit=100。

```bash
PY="C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"

# 打分排序 + 闸门结论，输出到日历 CSV
$PY tools/topic_score.py keywords.csv --out calendar.csv

# 自定义权重/闸（可选）
$PY tools/topic_score.py keywords.csv --w-intent 0.3 --w-fit 0.25 --kd-gate 35 --vol-floor 15
```

**实测表现**（示意数据）：高流量泛词 `what is adhesive tape`（5000 量、KD60）被闸掉；低量高意图高 CPC 的 `pe foam tape for automotive` 排第一（82.0）；`battery pack adhesive tape`（CPC6.0、KD18）被判「战略外」—— 因元数据没把 battery 连到阻燃产品，暴露内容缺口（阻燃胶带本就打电池包）。

---

## 3. 红线（本包专属）

> **⚠️ 红字**：本包方法论的价值 100% 取决于**真实关键词数据**。示例 `keywords.sample.csv` 里的数字是**示意占位**，不是真实调研。在把 Ahrefs / Search Console 真实数据导进来之前，选题卡里的「搜索量/CPC/KD」栏一律写「待补」，**绝不拿示意数字当决策依据**——那和拍脑袋没区别。

同样严禁：① 为凑指标编造案例/数据；② 用 AI 训练记忆里的「通识」充当产品技术事实。

---

## 4. 与下游的接驳

```
[0 素材采集 + 选题打分] → [1 选题卡] → [2 生产] → [3 评审] → [4 修改] → [5 发布]
   （本包）                （→ Blog 发布流程包）
```

- **素材库**（`docs/sources/`）是生产阶段的**唯一知识来源**——写作时从卡取数，不凭 AI 记忆编。
- **选题打分**输出 → 选题卡的 `主词 / 长尾词 / 映射产品 / 映射行业` 字段直接由它填充。
- `topic_score.py` 与 `humanize_check.py` 同属**零依赖脚本**，可一并接入 CI。

---

## 5. 文件与工具清单

| 资产 | 路径 | 作用 |
|---|---|---|
| 本包文档 | `docs/packages/knowledge-base-topic-selection.md` | 知识库 + 选题方法论整合视图 |
| 素材库根 | `docs/sources/` | 5 张结构化素材卡 + README |
| 选题打分器 | `tools/topic_score.py` | 零依赖，输出优先级编辑日历 |
| 输入模板 | `keywords.sample.csv` | CSV 格式示意（数字为占位，非真实） |
| 选题方法论（旧） | `docs/content-sourcing-topic-selection.md` | 本包前身，可删除或保留作历史 |
| 下游执行包 | `docs/packages/blog-publishing-playbook.md` | 本包的输出在此被执行成文章 |

---

> **姊妹包**：《Blog 发布流程包》—— 本包解决「知识从哪来、写什么不拍脑袋」，它负责「怎么写成达标、能上榜、能被引用的文章并发布」。

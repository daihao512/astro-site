# Blog 发布流程包（SEO · GEO · 内链 · 全流程）

> **本包定位**：涵盖一篇 blog 从「动笔」到「上线并被索引」的**全部环节**——生产、评审、修改、发布，以及贯穿其中的三大优化板块：**内链建设、SEO、GEO**。
> 这是流水线总纲与 `blog-seo-geo-standard.md` 的**整合视图**，是可执行的单一权威源。
>
> **上游依赖**：选题卡与素材来自另一独立包《知识库与关键词选题包》。本包假设「写什么、知识从哪来」已由该包解决，本包只负责「怎么把它写成达标、能上榜、能被引用的文章并发布」。

---

## 0. 为什么这是一号工程

### 0.1 四件事是一条链，不是四件事

```
内容质量 ──▶ 内链结构 ──▶ SEO 权重 ──▶ GEO 引用 ──▶ 免费询盘
   │            │            │            │
   │            │            │            └─ AI 引擎引用你的定义/数据
   │            │            └─ 关键词排名、站点权重、爬虫抓取深度
   │            └─ 权重站内流动，主题集群形成权威
   └─ 唯一不可外包：AI 能生成文字，不能生成你的经验
```

**任何一环断了，后面全部归零**：内容水→无人链无人引→内链断→权重不流动；内链断→文章是孤岛→爬虫抓不深→收录成问题；SEO 弱→无基础曝光→GEO 无从谈起；GEO 弱→丢掉 AI 时代流量入口。

### 0.2 战略约束：我们买不起流量

| 渠道 | 单次点击成本 | 可持续性 | 选择 |
|---|---|---|---|
| 付费广告（Google Ads / 阿里国际站） | ¥15–60 | 停投即停流 | ❌ 补充手段 |
| 展会 / B2B 平台年费 | 数万/年 | 依赖平台 | ❌ 辅助 |
| **内容 + SEO + GEO** | ≈0 | **复利，越久越值钱** | ✅ **主航道** |

**稳定每周 1 篇，胜过一次性发 10 篇然后停 3 个月。**

### 0.3 一条不可逾越的红线

> **指标服务于真实，不为真实服务指标。**

绝不允许为凑数编造项目经历、客户反馈、测试数据。没有真实素材时，该指标记「待补」，文章照常发布，后续拿到素材再补。虚构内容一旦被识破，赔上的是整个域名的信任度——而信任度正是 E-E-A-T 和 GEO 的核心。

---

## 1. 流水线总览（六阶段四道闸）

```
  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
  │ 0 素材选题│──▶│ 1 选题卡 │──▶│ 2 生产   │──▶│ 3 评审   │──▶│ 4 修改   │──▶│ 5 发布   │
  │ Source/  │   │ Topic   │   │ Draft   │   │ Review  │   │ Revise  │   │ Publish │
  │ Select   │   │ Card    │   │         │   │         │   │         │   │         │
  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     闸 0          闸 1          自检          闸 3          闸 4?        闸 4
   打分准入      选题准入      （闸 2）      ≥80 才可过    3 次 FAIL     入链闭环
               有业务映射                   ★核心闸       → 作废       + 索引推送
```

| 阶段 | 产出物 | 闸门 | 谁判 |
|---|---|---|---|
| **0 素材/选题** | 关键词 CSV + 素材卡 + 选题卡草稿 | 闸 0：选题打分准入（KD≤40 / 量≥20 / 映射产品∩行业）+ 素材来自 SoT | 人 + 脚本 |
| **1 选题** | 选题卡（主词/长尾/问题词/意图/映射产品） | 闸 1：无重复、有业务映射才开工 | 人 |
| **2 生产** | `posts.ts` 新条目（body + faq + 内链字段） | 闸 2：作者自检（骨架 + 去 AI 味） | 人 |
| **3 评审** | 评分报告 | **闸 3：5 维加权 ≥80**，脚本 + 人工 | **脚本 + 人** |
| **4 修改** | 修订稿 | 回到闸 3；**连续 3 次 FAIL → 作废重写** | 人 |
| **5 发布** | 上线 + 入链 | 闸 4：build 通过、入链 48h 内补齐、sitemap 收录 | 脚本 + 人 |

**不可跳过**：闸 1（选题错了后面全无效）、闸 3（唯一质量保证点，凭「我觉得不错」= 没标准）、入链（发布不入链 = 造孤儿页，权重收益为零）。

---

## 2. 阶段一：选题卡（承接《知识库与关键词选题包》的输出）

选题卡的主词/长尾词/映射产品/映射行业由选题打分器输出直接填充。开工前必须填完：

```markdown
## 选题：<标题草案>
主词（1 个）        : low odor double sided tape
长尾词（3-5）       : low VOC tape automotive / VDA 270 tape / cabin odor adhesive
问题词（5-8）       : what is VDA 270 / how to reduce cabin odor / is acrylic tape low odor
搜索意图            : Informational / Commercial / Transactional
目标字数            : 2000-2500（Commercial 意图）
映射产品（必填）    : low-odor, acrylic, pe-foam
映射行业（必填）    : automotive
买家阶段            : 认知 / 考虑 / 决策
为什么我们能写好    : <我们的独特角度，写不出就换题>
是否已存在相似内容  : 否（已查 posts.ts，无 cannibalization）
```

**闸 1 准入**：主词有真实需求；**至少映射 1 个产品页**；与已有文章无重叠；「为什么我们能写好」有答案（空着说明 AI 也能写、写了也白写）。

---

## 3. 阶段二：生产

### 3.1 骨架：12 段式（照填，不用每次想结构）

```
 1. 定义段          **全称 (缩写)** 开头，前 400 词内全称展开
 2. Key Takeaways   3-5 条自足事实（★ GEO 最高分项，AI 最爱引用）
 3. 背景/为什么重要  业务后果，不是空话
 4. 原理/机理        为什么会这样
 5. 标准与规范       引用真实标准号（VDA / ISO / ASTM / DIN / GB）
 6. 方案对比 A vs B  必须带 ≥1 个表格
 7. 选型因素         3-5 个决策维度
 8. 应用场景         分场景列举，配内链
 9. 规格速查表       ★ ≥5 列 × 8 行，AI 提取友好
10. 实施/验证步骤    标题写成 "How to ..."（触发 HowTo schema）
11. 常见误区         ★ 体现经验：别人踩过的坑
12. FAQ             8-10 条，每条 50-80 词带数据
```

### 3.2 硬性指标

| 项 | 标准 |
|---|---|
| 正文字数 | **2000–2500 词**（按正文计，非 HTML） |
| FAQ | **8–10 条**，每条 **50–80 词**，带数据 |
| Key Takeaways | 3–5 条 |
| 表格 | ≥1 个（对比类 ≥5 列 × 8 行） |
| 列表 | ≥3 个 |
| 段落 | ≤4 行 |
| 主词密度 | **1–2.5%**（>3% 堆砌） |
| 阅读级别 | B2B 技术类 grade 10–12 |

### 3.3 生产时就去 AI 味（事后修比当场写贵 3 倍）

**四个写作习惯**：
1. **破折号预算**：全文 `—` 不超过 **6 个/千词**（2000 词 ≈ 12 个）。
2. **每段自问**：「这句话换成竞争对手能写吗？」能 → 删或换成只有我们知道的判断。
3. **段落故意不齐**：3 行 / 1 行 / 5 行交替。
4. **每个数据带条件**：不写「耐高温」，写「−20 °C 到 100 °C，夏季暴晒工况下仪表板表面可达 80–100 °C」。

**四类必须出现的「人味」信号（每项 ≥3 处）**：

| 类型 | 例子 |
|---|---|
| 具体数据 + 单位 + 条件 | "≤ 3.0（VDA 270，40 °C 变体）" |
| 立场与否定 | "不建议这样做，因为…" / "这里最常被跳过" |
| 失败案例 | "常见做法是 X，实际会导致 Y" |
| 第一手经验 | "我们在 XX 项目发现…"（**必须真实，无素材则留空待补**） |

**对照改写**：

| ❌ AI 写法 | ✅ 人类写法 |
|---|---|
| Foam tape is widely used in various industrial applications. | 门板、顶棚、A 柱这三个位置基本都用泡棉胶带，因为它们是车内面积最大、离乘员最近的地方。 |
| It is important to note that surface preparation affects bond strength. | 表面处理这一步最常被跳过，但现场失效大半能追到它。 |
| The product offers excellent temperature resistance. | −20 °C 到 100 °C。夏天暴晒后仪表板表面能到 80–100 °C，所以上限不能只看常温数据。 |

### 3.4 内链在写作时同步埋（不要留到发布后）

- **正文内联 4–6 个**：锚文本多样化，不要全是产品名
- **`relatedProducts` 3 条**、`relatedIndustries` 1–2 条（字段在 `posts.ts`）
- **权威外链 1–2 条**：链到标准机构（ISO / VDA / ASTM），带 `noopener noreferrer`

### 3.5 `posts.ts` 字段规范

```ts
{
  slug: 'kebab-case-slug',              // 含主词
  title: '≤60 chars',
  category: '必须属于 postCategories',
  date: 'YYYY-MM-DD',
  excerpt: '150-160 字符，含主词',
  focusKeyword: 'primary keyword',       // ★ 驱动关键词覆盖检查
  img: 'https://images.unsplash.com/photo-XXX?w=800&q=80&auto=format&fit=crop',
  imgAlt: '描述性 alt ≤125 字符',
  readMin: 8,
  body: `HTML 正文，遵循 §3.1 骨架`,
  keyTakeaways: ['自足事实1', '自足事实2', '自足事实3'],  // ★ 3-5 条
  faq: [
    { q: '问句？', a: '50-80 词，带数据的答案。' },        // ★ 8-10 条
  ],
  relatedProducts: ['low-odor', 'acrylic', 'pe-foam'],   // 必须是 products.ts 的 slug
  relatedIndustries: ['automotive'],                     // 必须是 industries.ts 的 slug
}
```

> ⚠️ slug 写错不会报错，会静默丢链。发布前对照 `products.ts` / `industries.ts` 核对。

---

## 4. 阶段三：评审（★ 核心闸）

### 4.1 五维评分表

| 维度 | 权重 | 判定方式 | 核心检查项 |
|---|---|---|---|
| **Technical SEO** | 25 | 人工 + 脚本抽查 | title 50-60 / description 150-160 / canonical / 唯一 H1 不跳级 / 图片 alt+尺寸+lazy / OG+Twitter / 三个 JSON-LD |
| **Content SEO** | 22 | 人工 | 主词覆盖 7 处 / 密度 1-2.5% / LSI 同义词 / 长尾词 / **字数 2000-2500** / TOC / H2 描述性 / 可扫描性 / 比较用表格 / 内链 3–7/千词 / 外链 1–3 |
| **GEO Readiness** | 23 | 人工 | **Key Takeaways** / 定义段全称展开 / **≥1 表格** / 直接陈述 / 带单位数据 / **FAQ 8-10 条** / HowTo / E-E-A-T 信号 |
| **Content Quality** | 15 | 人工 | 无填充 / 独特视角 / 可操作 takeaway / 事实准确 / 覆盖完整 / 实例 / 排版打磨 / 图片相关 / 移动端 |
| **Humanization** | **15** | **脚本（客观）** | 见 §4.2 |

### 4.2 Humanization 维度（由 `tools/humanize_check.py` 客观计算）

```
维度得分 = (humanization / 10) × 15
一票否决：hbr < 15%   →  该维度直接 0 分
扣减    ：15% ≤ hbr < 25%  →  该维度得分 × 0.7
```

脚本输出的 5 统计信号 + 3 人味信号：

| 指标 | 人类区间 | 说明 |
|---|---|---|
| `burstiness` | 0.60–1.00 | 句长变异系数 |
| `cov` | 0.50–0.90 | 段落长度变异系数 |
| `sttr` | 0.55–0.80 | 词汇多样性（200 词滑窗） |
| `trigram_rep` | ≤0.005 | 三词组合重复率 |
| `slop_per_1k` | ≤3.0 | AI 套路词密度 |
| `dash_per_1k` | ≤6.0 | **破折号密度，本项目最大痛点** |
| `data_points` | ≥8 | 带单位的数字 |
| `experience` | ≥3 | 第一手经验标记（**无真实素材则记待补**） |
| `stance` | ≥3 | 立场/否定/警告句 |
| `hbr` | **≥25%** | 人类行为比例 = 含人味信号的句子 ÷ 总句数 |

**综合判定**：

```
AI likelihood ≥ 60  或  humanization < 5.5  或  hbr < 15%   →  FAIL，重写
AI likelihood ≥ 40  或  humanization < 7.0  或  hbr < 22%   →  WARN，修改后发
其余                                                        →  PASS
```

### 4.3 评审命令

```bash
PY="C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"

$PY tools/humanize_check.py --slug <slug> --verbose      # 单篇
$PY tools/humanize_check.py --all                        # 全站（分数升序，最差在前）
$PY tools/humanize_check.py --slug <slug> --check --threshold 70   # CI 门禁
$PY tools/humanize_check.py --all --json                 # 机器可读
```

### 4.4 判定

```
综合分 = Σ(维度得分)
90-100  A  优秀
80-89   B  PASS（可发布）
70-79   C  FAIL（需优化）
60-69   D  FAIL（大改）
<60     F  FAIL（重写）
```

**≥80 才可进入阶段五。**

---

## 5. 阶段四：修改

### 5.1 失败项 → 修哪里（速查）

| 失败项 | 修哪里 | 怎么修 |
|---|---|---|
| **`hbr` < 25%** | `posts.ts` → `body` | 加立场句、失败案例、反问句；定性描述换成带条件的数字 |
| **破折号 > 6/千词** | `body` | `—` 改成逗号、句号、冒号或拆成两句 |
| **`experience` = 0** | `body` | ⚠️ **有真实素材才补**；无则记入待补清单，不造假 |
| **`trigram_rep` > 0.005** | `body` | 找出重复三词组合，换同义表达 |
| **字数 < 2000** | `body` | 按 §3.1 骨架补：标准细则 / 场景展开 / 验证步骤 |
| **无 Key Takeaways** | `body` 第 2 段 | 补 3-5 条自足事实 |
| **FAQ < 8 条 / 无数据** | `faq` 字段 | 补到 8-10 条，每条 50-80 词带数字 |
| **定义段无全称** | `body` 首段 | 改为 `**全称 (缩写)**` 开头 |
| **对比表不足** | `body` | 补 ≥5 列 × 8 行 |
| **产品内链不足** | `body` + `relatedProducts` | 正文内联 4-6 个 + 字段 3 条 |
| **HowTo 缺失** | `body` | 步骤章节标题改为 "How to ..." |
| **title 超长** | `title` 字段 | 压到 ≤60 |

### 5.2 修改的三条纪律

1. **对着脚本改，不对着感觉改** —— 每改一轮重跑一次看数字。
2. **连续 3 次 FAIL → 作废重写** —— 不无限修补。
3. **不允许为满足指标而编造** —— 见 §0.3，指标可记「待补」，信任不能透支。

---

## 6. 阶段五：发布与内链闭环

### 6.1 发布清单

```bash
# 1. 构建验证
node ./node_modules/astro/astro.js build

# 2. 页面可达性 + 内容抽查
curl -s http://localhost:8099/blogs/<slug>/ | grep -oE 'Key Takeaways|<table>|faq-item'

# 3. sitemap 收录确认
curl -s http://localhost:8099/sitemap.xml | grep -c '<loc>'

# 4. 人性化门禁（发布前最后一次）
$PY tools/humanize_check.py --slug <slug> --check --threshold 70
```

### 6.2 入链闭环（**发布不是终点**）

> **规则：新文章上线后 48 小时内必须补齐入链。**

```
        ┌──────────────┐
        │  blogs 列表页 │ ← 自动（数据源驱动）
        └──────┬───────┘
   ┌───────────┼───────────┐
   ▼           ▼           ▼
产品详情页   行业详情页    相关文章
（回链）    （回链）      （回链）
```

必须补的三条回链：

| 从 | 到 | 位置 |
|---|---|---|
| `/products/<映射产品>` | 本文 | 详情页「Related Resources」区块 |
| `/industries/<映射行业>` | 本文 | 行业页「Further Reading」区块 |
| 同分类其他文章 | 本文 | 详情页底部「Related Posts」（已自动，优先同分类） |

**孤儿检测**：

```bash
# 产品页入站链接 < 2 → 需要补文章指向它
grep -rn "products/<slug>" src/pages src/data | wc -l
```

### 6.3 发布后（部署到公网域名后）GEO 审计

```bash
geo audit --url https://<域名>/blogs/<slug>/ --threshold 80
geo audit --sitemap https://<域名>/sitemap.xml --max-urls 50
geo citations --domain <域名>      # 每月：品牌是否被 AI 引用
geo monitor --domain <域名>
```

> `geo audit` 因安全策略拒绝 localhost，需公网域名或预览环境。不依赖工具现已能做的：`llms.txt`（18 分）+ `robots.txt` AI 爬虫段（18 分）已手工补齐。

---

## 7. 内链 / SEO / GEO 技术细节

### 7.1 内链规范

**出链配额（每篇）**：

| 类型 | 数量 | 实现 |
|---|---|---|
| **正文内联链接** | **4–6 个** | 正文 HTML 直接写 `<a href="/products/xxx">描述性锚文本</a>` |
| 产品内链（底部区块） | 3 条 | `relatedProducts` |
| 行业内链（底部区块） | 1–2 条 | `relatedIndustries` |
| 文章内链 | 3 条 | 自动（同分类优先） |
| **权威外链** | **1–2 条** | 引用标准处链到权威来源（ISO/VDA/GB），`rel="noopener noreferrer"` |

锚文本：✅ 描述性且多样；❌ `click here` / `read more` / 同一短语重复 5 次以上。密度参考 3–7 条内链 / 1000 词。

**拓扑：Hub-Spoke** —— `/blogs/` 链接所有文章；每篇文章必须回链到指向它的产品页/行业页（闭环）。

**孤儿检测双指标**：Orphan products（产品页入站 blog 链接 < 2，需补文）；Orphan posts（文章无任何入站链接，应补）。

### 7.2 技术规范（按 P0–P3）

**P0 致命（上线前必须修）**：title 非占位符、50–60 字符、主词靠前；meta description 存在、150–160 字符、全站唯一；canonical 为绝对 URL（Layout 已自动，勿覆盖）；页面可索引（勿误加 `noindex`）。

**P1 重要（第一周修）**：全页唯一 H1 含主词，H2/H3 不跳级；所有图片描述性 alt（≤125 字符）、非 base64、有 width/height、折叠下方 lazy；Article schema 含 keywords（≥5）与 articleBody（≥200 词）；有 "How to" 章节 → HowTo schema；权威外链用 `rel="noopener noreferrer"`。

**P2 推荐**：`<html lang="en">`、viewport、charset；语义化标签；TOC 包在 `<nav aria-label="Table of contents">`（>1000 词）；无失效内链；sitemap 已收录；图片 webp/avif。

**P3 打磨**：图片 `<figcaption>`；外链补充；阅读级别微调。

**已自动化（代码保证）**：canonical / OG×7 / Twitter×4 / Organization JSON-LD / article:published_time·modified_time / Article·BreadcrumbList·FAQPage JSON-LD / sitemap（自动生成）/ robots.txt。

### 7.3 GEO 内容写法

- **直接陈述**，不 hedging：❌「低气味胶带通常被认为比较环保」；✅「低气味胶带采用无增粘树脂的丙烯酸体系，不含会迁移的增塑剂。」
- **数据带单位 + 标准出处**：❌「耐温范围很宽」；✅「使用温度 −20 °C 至 100 °C（cabin 表面夏季暴晒可达 80–100 °C）」。
- **避免 AI 腔**：不写 "in today's fast-paced world"、"it's important to note"。

### 7.4 去 AI 味：AI 味特征清单

词汇套路（每 1000 词 >3 个即扣分）：开场套路（in today's fast-paced world / when it comes to / delve into）、空洞强调（revolutionary / game-changing / seamless / robust / cutting-edge）、模糊限定（generally considered / somewhat / relatively）、机械连接（moreover / furthermore / additionally 连续使用）、名词化堆砌（the utilization of / leverage）、总结套路（in conclusion / overall）。

句式特征：三段式排比过度；每段「主题句+解释+总结」过于规整；**段落长度高度一致**；**句长高度一致**；破折号密度过高；列表项结构对称篇幅相等。

内容特征：全定性无数字；无第一手经验；无立场；无误判/修正；无具体案例；对称罗列。

**人性化信号（加分项）**：第一手经验；具体数字+单位+条件；立场与判断；失败案例；信息密度不对称；口语化插入；反问句；段落长度不齐；行业黑话缩写；具体标准号/牌号/型号。

**核心原则**：AI 写「正确的废话」，人类写「具体的判断」。每段问自己：**这句话换成竞争对手能写吗？** 能，就是 AI 味；不能（只有你有这经验），就是人味。

---

## 8. 工具链

| 资产 | 路径 | 作用 |
|---|---|---|
| 人性化检测脚本 | `tools/humanize_check.py` | 零依赖，毫秒级，5 统计+3 人味信号，可接 CI |
| 破折号修复工具 | `tools/fix_dashes.py` | 阶段-4 通用修复，支持全站勘测 |
| GEO 审计工具 | `geo` CLI（`geo-optimizer-skill`） | 100 分制，需公网 URL |
| 站点机器可读入口 | `/llms.txt` `/ai/*.json` `/rss.xml` | GEO 基础设施 |
| 站点配置 | `src/config/site.ts` | ⚠️ 域名占位，上线前必改 |

**为何自己写脚本而不引 ML 工具**：AI 味核心指标本质是纯统计（句长方差、段落方差、词汇多样性、n-gram 重复、套路词密度），不需要任何模型，stdlib 几十行、毫秒级；而可用 ML 检测器都依赖 torch/transformers（GB 级、加载几十秒），对「每篇发布前跑一次」是杀鸡用牛刀。

---

## 9. 节奏与度量

| 频率 | 动作 | 度量 |
|---|---|---|
| **每周** | ≥1 篇新文章走完整流水线 | 发布数、闸 3 一次通过率 |
| **每 3 篇** | 补入链闭环 | 孤儿页数 = 0 |
| **每月** | `geo citations` + `geo monitor` | 品牌被 AI 引用次数 |
| **每月** | 全站 `humanize_check --all` | 平均分趋势（只升不降） |
| **每季度** | `geo history` 回归检测 | 分数不回退 |
| **每 6 个月** | 存量文章刷新 | 刷新覆盖率 |

**三个北极星指标**：① 主题集群覆盖率（每个产品/行业 ≥1 篇文章指向它）；② 零孤儿页（产品页入站 ≥2、文章页入站 ≥1）；③ 人性化平均分 ≥7.5 且只升不降。

---

## 10. 红线与常见错误

**三条红线（触碰即报废）**：① 编造数据/案例/客户反馈；② 跳过闸 3 发布；③ 发布不入链。

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 选题不映射产品 | 有流量无询盘 | 闸 1 强制填「映射产品」 |
| 先写再想 SEO | 结构返工 | 选题卡先定主词/长尾 |
| 事后补 Key Takeaways | 写不出真正要点 | 骨架第 2 段就是它 |
| 为凑经验指标编造 | 信任破产 | 记「待补」 |
| 破折号滥用 | AI 味最显著特征 | 写作时就有预算（≤6/千词） |
| 段落长度整齐 | AI 指纹 | 故意不齐 |
| 只做出链不做入链 | 权重只出不进 | 48h 规则 |
| 凭感觉判断「写得不错」 | 无标准 | 跑脚本、看数字 |
| 无限修补不达标文章 | 沉没成本 | 3 次 FAIL 作废 |

---

## 11. 发布前 Checklist（整合版）

```markdown
### 选题（来自知识库与选题包）
- [ ] 主词 1 + 长尾 3-5 + 问题词 5-8 已确定
- [ ] 搜索意图判定，字数目标对应（Commercial 2000-2500）
- [ ] 对应产品/行业/买家阶段已明确

### 内容（GEO 骨架）
- [ ] 定义段：`**全称 (缩写)**` 开头，前 400 词内全称展开
- [ ] Key Takeaways 3-5 条
- [ ] ≥8 个 h2，符合 12 段骨架
- [ ] ≥1 个 <table>（对比类 ≥5列×8行）
- [ ] ≥3 个列表
- [ ] "How to ..." 章节（如有步骤内容）
- [ ] FAQ 8-10 条，每条 50-80 词带数据
- [ ] 正文 2000-2500 词，段落 ≤4 行
- [ ] 主词密度 1-2.5%，LSI 词已覆盖
- [ ] 直接陈述 + 数据带单位
- [ ] 无任何编造数据

### 技术
- [ ] title 50-60 字符
- [ ] description 150-160 字符，唯一
- [ ] slug 含主词
- [ ] 唯一 H1，层级不跳级
- [ ] 图片 alt + 尺寸 + lazy + 非 base64
- [ ] 三个 JSON-LD（Article/Breadcrumb/FAQPage）+ HowTo（如适用）
- [ ] Article schema 含 keywords ≥5、articleBody ≥200 词

### 内链
- [ ] 正文内联 4-6 个（锚文本多样）
- [ ] relatedProducts 3 条，slug 已核对
- [ ] relatedIndustries 1-2 条，slug 已核对
- [ ] 权威外链 1-2 条，带 noopener noreferrer
- [ ] 入链已补（产品页/行业页 → 本文）
- [ ] 孤儿检测已跑（产品入站 ≥2）

### 门禁
- [ ] 5 维评分 ≥80（B 级以上）
- [ ] astro build 通过
- [ ] sitemap 已收录
- [ ] 人性化门禁通过（humanize_check --check --threshold 70）
- [ ] 抽查渲染（正文/FAQ/Takeaways/内链区块）
```

---

> **姊妹包**：《知识库与关键词选题包》—— 解决「知识从哪来、写什么不拍脑袋」。二者衔接点：选题包输出选题卡（主词/长尾/映射产品）与素材卡（技术事实），本包负责执行成达标文章并发布。

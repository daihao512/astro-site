# Blog SEO / GEO / 内链执行规范 v2.0

> **适用范围**：`src/data/posts.ts` 中每一篇文章。发布前必须走完 §6 评分门禁（**SEO 轨道与 GEO 轨道各自 ≥80**，双轨独立门禁，见 §5.2）。
> **v2.0 变更**：整合 `blog-seo-geo-pipeline`（流水线/门禁）与 `article-seo-geo-auditor`（4 维审计/P0-P3 分级）的方法论，新增 Key Takeaways、HowTo schema、权威外链、正文内联链接、孤儿检测、量化评分。

---

## 0. 三条底线（不可妥协）

1. **不编造数据** —— 所有测试数值必须来自 `products.ts`、客户实测或公开标准。宁可写"需按项目确认"，也不虚构。
2. **每篇必须结构化** —— 定义段 + Key Takeaways + 规格表 + FAQ，四者缺一不可（GEO 核心）。
3. **内链双向闭环** —— 出链 ≥3 条，产品/行业页必须有回链。单向链接不传递权重。

**执行原则（借鉴 pipeline）**：
- **门禁是唯一标准**：分数说了算，不凭感觉"我觉得达标了"。
- **先改数据源再验证**：`posts.ts` 是唯一权威输入，改渲染层会被覆盖。

---

## 1. 选题：关键词与意图

### 1.1 关键词三层

| 层级 | 数量 | 位置 |
|---|---|---|
| 主词（`focus_keyword`） | 1 个 | title / H1 / slug / 首段 / meta / ≥1 个 H2 / ≥1 个图片 alt |
| 长尾词 | 3–5 个 | h2 标题、正文 |
| 问题词 | 5–8 个 | FAQ 区块 |

### 1.2 搜索意图

| 意图 | 触发词 | 重心 | 字数 |
|---|---|---|---|
| Informational | what / why / guide | 原理、标准、定义 + FAQ | 1500–2000 |
| **Commercial（优先）** | vs / best / selection / how to choose | 对比表、选型清单、误区 | **2000–2500** |
| Transactional | supplier / manufacturer / OEM | 规格、能力、CTA | 1500–2000 |

**B2B 工业品优先做 Commercial** —— 离成交最近，竞争小于泛词。

### 1.3 业务映射三问（动笔前必须能回答）

- 对应**哪个/哪些产品**？ → `relatedProducts`
- 对应**哪些行业**？ → `relatedIndustries`
- 买家在**哪一步**读到它？（认知/评估/决策）→ 决定 CTA 措辞

---

## 2. 写作：结构与格式

### 2.1 标题

- **title**：主词靠前 + 场景 + 品牌，**50–60 字符**（上限 70）
- **H1**：与 title 一致或略精简，**全页唯一**
- **slug**：kebab-case，含主词，≤5 词
- **description**：**150–160 字符**，含主词 + 价值主张，全站唯一

### 2.2 正文骨架（12 段式）

1. **定义段**（★GEO 最高分项）：首段以 `**全称 (缩写)**` 开头，格式
   `[Term] is a [category] that [function]. It consists of [components] and is used for [applications].`
   **正文前 400 词内必须出现"全称 (缩写)"展开**（如 `**Volatile Organic Compounds (VOCs)**`；缩写在前不算）
2. **Key Takeaways**（★3–5 条，自足事实，AI 可直接引用）
3. 问题背景（Why it matters）
4. 原理/来源 → `<ul>`
5. 标准与规范 → `<ul>`，**引用处加权威外链**
6. 方案对比/构造差异 → `<h3>` 分段
7. 应用场景 → `<ul>`
8. **规格速查表** → `<table>`（对比类需 **≥5 列 × 8 行**）
9. **选型清单** → `<ol>`
10. **How to ... 步骤章节**（有步骤化内容时必写，触发 HowTo schema）
11. 常见误区 + 验证方法
12. 收尾段（一句话洞察，如"这不是另一种产品，而是控制更严格的同一种产品"）

### 2.3 硬性指标

| 项 | 标准 |
|---|---|
| 正文字数 | **2000–2500 词**（按 sections 正文计，非 HTML） |
| FAQ | **8–10 条**，每条 **50–80 词**，带数据 |
| Key Takeaways | 3–5 条 |
| 表格 | ≥1 个（对比类 ≥5 列 × 8 行） |
| 列表 | ≥3 个 |
| 段落 | ≤4 行 |
| 主词密度 | **1–2.5%**（>3% 堆砌） |
| 阅读级别 | B2B 技术类 grade 10–12 |

### 2.4 GEO 内容写法

- **直接陈述**，不 hedging
  - ❌ "低气味胶带通常被认为比较环保"
  - ✅ "低气味胶带采用无增粘树脂的丙烯酸体系，不含会迁移的增塑剂。"
- **数据带单位 + 标准出处**
  - ❌ "耐温范围很宽"
  - ✅ "使用温度 −20 °C 至 100 °C（ cabin 表面夏季暴晒可达 80–100 °C）"
- **避免 AI 腔**：不写 "in today's fast-paced world"、"it's important to note"

---

## 2.5 去 AI 味与人性化（★ v2.0 新增）

**为什么这不只是文风问题**：Google 的 E-E-A-T 中第一个 E 是 **Experience（经验）**。纯 AI 生成内容会被 helpful content 系统降权，也更难被 AI 引擎引用 —— 因为 AI 倾向引用**有独特视角、有第一手经验**的来源。去 AI 味直接决定 GEO 效果。

### A. AI 味特征清单（发布前逐项排查）

**词汇套路（每 1000 词 >3 个即扣分）**

| 类型 | 典型词/短语 |
|---|---|
| 开场套路 | in today's fast-paced world · in the ever-evolving landscape · when it comes to · delve into |
| 空洞强调 | revolutionary · game-changing · seamless · robust · cutting-edge · unlock the power of |
| 模糊限定 | generally considered · somewhat · relatively · in many cases · it's important to note |
| 机械连接 | moreover · furthermore · additionally（连续使用） |
| 名词化堆砌 | the utilization of · the implementation of · facilitate · leverage（堆砌） |
| 总结套路 | in conclusion · overall · it's clear that · this underscores the importance of |

**句式特征**

- 三段式排比过度（"not only... but also... and..."）
- 每段都严格"主题句 + 解释 + 总结"（过于规整）
- **段落长度高度一致**（AI 显著特征：字数方差极小）
- **句长高度一致**（同上）
- 破折号 `——` 密度过高
- 列表项结构完全对称、篇幅相等

**内容特征**

- 全是定性描述，无具体数字
- 无任何第一手经验（没有"我们实测"、"客户反馈"）
- 无立场（全篇客观陈述，不表态）
- 无误判/修正/不确定性（人类写作会说"这里容易搞错"）
- 无具体案例与场景细节
- 对称罗列（每个点篇幅几乎一样）

### B. 人性化信号（加分项，越多越好）

- ✅ **第一手经验**："我们在 XX 项目中发现"、"实测"、"客户反馈"
- ✅ **具体数字 + 单位 + 条件**："−20 °C 至 100 °C（夏季暴晒工况）"
- ✅ **立场与判断**："不建议这样做，因为…"、"这里最容易被忽略的是"
- ✅ **失败案例**："常见做法是 X，但实际会导致 Y"
- ✅ **信息密度不对称**（有的点深挖，有的一句带过 —— 这是人类写作的天然特征）
- ✅ **口语化插入**："注意"、"这里有个坑"、"换句话说"
- ✅ **反问句**（人类常用，AI 很少用）
- ✅ **段落长度不齐**（3 行 / 1 行 / 5 行混合）
- ✅ **行业黑话与缩写**（不解释，默认读者懂）
- ✅ **具体标准号/牌号/型号**（AI 倾向泛化表述）

### C. 量化评分：人性化得分（0–10）

> **v3.0：已独立为 Humanization 维度，权重 15%，由脚本客观计算。**
> 脚本：`tools/humanize_check.py`（零依赖 stdlib，毫秒级，支持 `--check` 接 CI）
> 用法见 §5.1.1，流水线位置见 [`content-pipeline.md`](./content-pipeline.md) §4.2。

下表是脚本的**计算依据**（脚本已实现，人工无需再逐项数）：

| 检查项 | 权重 | 达标线 |
|---|---|---|
| AI 套路词频 | 20% | ≤3 个 / 1000 词 |
| 段落长度方差 | 15% | 方差显著（非均匀） |
| 句长方差 | 15% | 方差显著 |
| 破折号/排比密度 | 10% | 不密集 |
| 具体数据点（带单位） | 15% | ≥8 个 |
| 第一手经验标记 | 15% | ≥3 处（我们/实测/客户） |
| 立场句（不建议/注意/坑） | 10% | ≥3 处 |

### D. 人类行为比例（Human Behavior Ratio）

> 定义：**体现人类经验、判断或具体性的句子 ÷ 全文总句数**

| 区间 | 判定 |
|---|---|
| **≥25%** | 健康（工业 B2B 技术文目标） |
| 15–25% | 偏薄，需补经验/案例 |
| **<15%** | 高度疑似 AI 生成，AI 引擎可能降权 |

**计入的句子类型**：第一手经验句、带具体数据的句、表达立场的句、失败案例句、反问句、口语化插入句。

### E. 三重检测方法

1. **脚本自检（首选，已建成）**：
   ```bash
   $PY tools/humanize_check.py --slug <slug> --verbose
   ```
   输出 5 个统计信号（burstiness / cov / sttr / trigram_rep / slop）+ 3 个人味信号（data_points / experience / stance）+ HBR + AI 似然分。**这是门禁依据。**
2. **机器检测（辅助）**：GPTZero / Originality.ai / ZeroGPT —— 看"人类撰写概率"，目标 **≥80%**。仅作交叉验证，不作为门禁（外部服务不稳定）。
3. **人工朗读测试**（最有效，脚本测不出）：
   - 读出来像不像人在说话？
   - **这段删了会不会损失信息？** —— AI 写的段落常常删掉也不影响（这是最准的判据）
   - 有没有"只有做过这件事的人才写得出来"的细节？

### F. 去 AI 味的具体改写手法

| AI 写法 | 人类写法 |
|---|---|
| Foam tape is widely used in various industrial applications for bonding purposes. | 门板、顶棚、A 柱 —— 这三个位置基本都用泡沫胶带，因为它们是车内面积最大、离乘员最近的地方。 |
| It is important to note that surface preparation affects bond strength. | 表面处理这一步最常被跳过，但现场失效大半能追到它。 |
| The product offers excellent temperature resistance. | −20 °C 到 100 °C。夏天暴晒后仪表板表面能到 80–100 °C，所以上限不能只看常温数据。 |
| There are several factors to consider when selecting a tape. | 选型时真正卡人的就四个：基材、温度、受力方式、施工方式。 |

**核心原则**：AI 写"正确的废话"，人类写"具体的判断"。每一段问自己一句：**这句话换成竞争对手能写吗？** 能，就是 AI 味；不能（因为只有你有这个经验），就是人味。

---

## 3. 技术规范

### 3.1 已自动化（代码保证，作者无需处理）

| 项目 | 实现 |
|---|---|
| canonical（绝对 URL） | `src/layouts/Layout.astro` |
| Open Graph ×7、Twitter ×4 | 同上 |
| Organization JSON-LD（`@id: /#organization`） | 同上 |
| `article:published_time` / `modified_time` | 同上 |
| Article / BreadcrumbList / FAQPage JSON-LD | `src/pages/blogs/[slug].astro` |
| sitemap（从 posts.ts 自动生成） | `src/pages/sitemap.xml.ts` |
| robots.txt | `public/robots.txt` |

### 3.2 需作者保证（按 P0–P3 分级）

**P0 致命（上线前必须修）**
- [ ] title 非占位符、50–60 字符、主词靠前
- [ ] meta description 存在、150–160 字符、全站唯一
- [ ] canonical 为绝对 URL（Layout 已自动，勿覆盖）
- [ ] 页面可索引（勿误加 `noindex`）

**P1 重要（第一周修）**
- [ ] 全页**唯一 H1**，含主词；H2/H3 不跳级
- [ ] 所有图片有描述性 alt（≤125 字符），内容图不得 `alt=""`
- [ ] 图片**非 base64 内嵌**，有 `width`/`height`，折叠下方 `loading="lazy"`
- [ ] Article schema 含 `keywords`（≥5 个）与 `articleBody`（≥200 词）
- [ ] 有 "How to" 章节 → 生成 **HowTo schema**
- [ ] 权威外链使用 `rel="noopener noreferrer"`

**P2 推荐**
- [ ] `<html lang="en">`、viewport、charset
- [ ] 语义化标签（`<article>` `<section>` `<nav>` `<main>`）
- [ ] TOC 包在 `<nav aria-label="Table of contents">`（>1000 词）
- [ ] 无失效内链
- [ ] sitemap 已收录
- [ ] 图片格式 webp/avif

**P3 打磨**
- [ ] 图片有 `<figcaption>` 说明
- [ ] 外链补充
- [ ] 阅读级别微调

---

## 4. 内链规范

### 4.1 出链配额（每篇）

| 类型 | 数量 | 实现 |
|---|---|---|
| **正文内联链接** | **4–6 个** | 正文 HTML 中直接写 `<a href="/products/xxx">描述性锚文本</a>` |
| 产品内链（底部区块） | 3 条 | `relatedProducts` |
| 行业内链（底部区块） | 1–2 条 | `relatedIndustries` |
| 文章内链 | 3 条 | 自动（同分类优先） |
| **权威外链** | **1–2 条** | 正文中引用标准处链到权威来源（ISO/VDA/GB 标准页） |

**锚文本规范**
- ✅ 描述性且**多样**：`low-odor double sided tape` / `acrylic foam tape` / `PE foam constructions`
- ❌ `click here` / `read more` / 同一短语重复 5 次以上
- 密度参考：3–7 条内链 / 1000 词

### 4.2 入链（发布后 48h 内补齐）

- 涉及的产品详情页 → 加 "Related Articles"
- 相关行业页 → 加 "Related Articles"
- 列表页 `/blogs/` 自动收录

### 4.3 孤儿检测（每次发布后跑）

借鉴 pipeline 的 orphan 检测，两个指标：

| 指标 | 定义 | 阈值 | 处理 |
|---|---|---|---|
| **Orphan products** | 产品页入站 blog 链接 < 2 | ≥2 | 需为该产品补文 |
| **Orphan posts** | 文章无任何入站链接 | 提示 | 不阻塞发布，但应补入链 |

### 4.4 拓扑：Hub-Spoke

```
            /blogs/            ← Hub（链接所有文章）
         /    |    \    \
      文A   文B   文C   文D
       |      |     |     |
   产品页  行业页  产品页  产品页     ← 必须回链到文章（闭环）
```

### 4.5 `posts.ts` 字段规范

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
  body: `HTML 正文，遵循 §2.2 骨架`,
  keyTakeaways: ['自足事实1', '自足事实2', '自足事实3'],  // ★ 3-5 条
  faq: [
    { q: '问句？', a: '50-80 词，带数据的答案。' },        // ★ 8-10 条
  ],
  relatedProducts: ['low-odor', 'acrylic', 'pe-foam'],   // 必须是 products.ts 的 slug
  relatedIndustries: ['automotive'],                     // 必须是 industries.ts 的 slug
}
```

**校验**：slug 写错不会报错，会静默丢链。发布前对照 `products.ts` / `industries.ts` 核对。

---

## 5. 评分门禁（★ v2.0 新增，不可跳过）

借鉴 `blog-seo-geo-pipeline` 的 80 分门禁 + `article-seo-geo-auditor` 的 4 维评分。

### 5.1 双轨独立评分（★ P4.24 战略升级：SEO 与 GEO 分开积分）

> **核心原则**：SEO（传统爬虫 Google/Bing）与 GEO（生成式引擎 ChatGPT/Perplexity/Claude/Gemini）是**两类不同的优化目标、面向不同搜索引擎**，因此**必须分开独立积分、各自独立门禁**，互不替补。每条轨道满分 100，门禁 ≥80；Humanization（HBR）为跨双轨底线。

**① SEO 轨道（满分 100，门禁 ≥80）— 技术 + 站内内容 + 质量**

| 分组 | 子项（权重） | 判定 |
|---|---|---|
| 技术 SEO（42） | H1 唯一含主词(5) · title 长度(3) · slug 含主词(2) · 首段含主词(3) · H2/H3 不跳级(3) · 主词 7 处覆盖≥4(4) · meta 150–160(3,auto) · canonical/OG/JSON-LD/sitemap/robots(5,auto) · 图片 alt 全覆盖(4) · 内链 4–6 正文内联+有效+锚文本多样(5) · 权威外链 1–3(5) |
| 站内内容 SEO（35） | 字数 2000–2500(5) · 密度 1–2.5%(3) · H2≥8(4) · 对比表 ≥1（对比类≥5列×8行）(5) · 列表≥3(2) · E-E-A-T 经验+立场(6) · URL slug(2) · 数据带单位(5) · 词汇多样性/术语(3) |
| 内容质量+去AI味（23） | 阅读级别(4) · AI 套路词≤3/千词(4) · 段落/句长方差(4) · 破折号≤6(3) · 数据点≥8(4) · 经验≥3(2) · 立场≥3(2) |

**② GEO 轨道（满分 100，门禁 ≥80）— 可引用内容 + AI-发现基础设施**

| 分组 | 子项（权重） | 判定 |
|---|---|---|
| GEO 内容（60） | 定义段 **全称(缩写)** 前400词展开(10) · Key Takeaways 3–5(8) · FAQ 8–10 条每条50–80词带数据(12) · 直接陈述低AI腔(6) · 统计密度 citations≥8(7) · **专家引述** '…' — Name,Title,Org(6) · 对比表≥5列×8行(5) · 词汇多样性/术语(3) · 经验≥3(2) · 立场≥3(1) |
| GEO 技术/AI-发现（40） | robots.txt 放行 AI 爬虫(6) · /llms.txt(8) · AI 发现端点 .well-known/ai.txt+/ai/*.json(7) · Schema 触发 Article+FAQPage+HowTo+Breadcrumb(6) · Organization+sameAs(5) · 品牌实体一致(3) · freshness+RSS(3) · `<html lang>`(2) |

> §5.1.1 Humanization 量化换算与脚本不变，作为跨双轨底线（HBR<15% → 双轨否决，见 §5.2）。

#### 5.1.1 Humanization 维度换算（15 分）

```
维度得分 = (humanization / 10) × 15

一票否决：hbr < 15%          → 该维度 0 分
扣减    ：15% ≤ hbr < 25%    → 该维度得分 × 0.7
```

| 脚本指标 | 人类区间 | 权重（内部） |
|---|---|---|
| `slop_per_1k` AI 套路词 | ≤3 / 千词 | 20% |
| `cov` 段落长度变异 | 0.50–0.90 | 15% |
| `burstiness` 句长变异 | 0.60–1.00 | 15% |
| `dash_per_1k` + 三段排比 | ≤6 / 千词 | 10% |
| `data_points` 带单位数据 | ≥8 | 15% |
| `experience` 第一手经验 | ≥3（**无真实素材记待补，不得编造**） | 15% |
| `stance` 立场/否定句 | ≥3 | 10% |

**综合判定**（脚本自动输出）：

```
AI likelihood ≥ 60  或  humanization < 5.5  或  hbr < 15%   →  FAIL，重写
AI likelihood ≥ 40  或  humanization < 7.0  或  hbr < 22%   →  WARN，修改后发
其余                                                        →  PASS
```

**运行**：

```bash
PY="C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"

$PY tools/humanize_check.py --slug <slug> --verbose   # 单篇
$PY tools/humanize_check.py --all                     # 全站（按分数升序）
$PY tools/humanize_check.py --slug <slug> --check --threshold 70   # CI 门禁
$PY tools/humanize_check.py --all --json              # 机器可读
```

### 5.2 双轨独立门禁（★ P4.24 战略升级）

SEO 与 GEO 面向**不同搜索引擎**（传统爬虫 vs 生成式引擎），必须**分开积分、各自独立门禁**，互不替补：

```
SEO 轨道分 = Σ(SEO 子项得分)           满分 100，门禁 ≥80
GEO 轨道分 = Σ(GEO 子项得分)           满分 100，门禁 ≥80
发布条件  = SEO≥80 且 GEO≥80 且 HBR≥15%（HBR<15% 双轨一票否决）
```

- 任一轨道 <80 → `reviewing`（不发布），拖后腿的子项在该轨道卡片中高亮
- **连续 3 次 FAIL → 该篇作废重写**（不无限修补）
- Humanization（HBR）为跨双轨底线：<15% 直接双轨否决，无论单轨分多高

### 5.3 失败项 → 修哪里

| 失败项 | 修哪里 |
|---|---|
| **`hbr` < 25%** | `body` 加立场句、失败案例、反问句；定性描述换成带条件的数字 |
| **破折号 > 6/千词** | `body` 把 `—` 改成逗号/句号/冒号，或拆成两句 |
| **`experience` = 0** | ⚠️ **有真实素材才补**；无则记入待补清单，**不得编造** |
| **`trigram_rep` > 0.005** | 找出重复的三词组合，换同义表达 |
| 字数不足 | `posts.ts` 的 `body` 扩写（按正文词数计，目标 2000–2500） |
| 定义段/全称展开 | `body` 首段改为 `**全称 (缩写)**` 开头 |
| title 超长 | `title` 压到 ≤60 |
| FAQ 深度不足 | `faq` 补 8–10 条，每条 50–80 词带数据 |
| 缺 Key Takeaways | 补 `keyTakeaways` 3–5 条 |
| 对比表缺失/不足 | `body` 补 ≥5 列 × 8 行表格 |
| 产品内链不足 | 正文补内联 `<a>` + `relatedProducts` |
| HowTo 缺失 | 选型步骤章节标题改为 "How to ..." |
| 图片问题 | 换 webp、补 alt/尺寸/懒加载 |

---

## 6. 发布前 Checklist

```markdown
### 选题
- [ ] 主词 1 + 长尾 3-5 + 问题词 5-8 已确定
- [ ] 搜索意图判定，字数目标对应（Commercial 2000-2500）
- [ ] 对应产品/行业/买家阶段已明确

### 内容（GEO 骨架）
- [ ] 定义段：`**全称 (缩写)**` 开头，前 400 词内全称展开
- [ ] Key Takeaways 3-5 条
- [ ] ≥8 个 h2，符合 §2.2 骨架
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
- [ ] SEO 轨道 ≥80（传统搜索引擎）
- [ ] GEO 轨道 ≥80（生成式引擎）
- [ ] HBR ≥15%（否则双轨否决）
- [ ] astro build 通过
- [ ] sitemap 已收录
- [ ] 抽查渲染（正文/FAQ/Takeaways/内链区块）
```

---

## 7. 持续运营（持久战）

| 动作 | 频率 | 说明 |
|---|---|---|
| 发新文章 | 每周 ≥1 篇 | **稳定比爆量重要** |
| 刷新旧文 | 每 6 个月 | 更新 `date` 与内容，GEO 偏好新鲜内容 |
| 补入链 | 每发 3 篇回头补 | 新文章要有旧页面指向它 |
| 孤儿检测 | 每次发布后 | 产品入站 <2 就补文 |
| 一稿多用 | 每篇 | 拆成销售素材、FAQ、社媒卡片 |
| 数据复查 | 每月 | Search Console 曝光/点击/词；检查 AI 是否引用 |

**复利逻辑**：单篇流量有限，但 30 篇相互链接、每篇结构化、每篇指向产品的文章形成**主题权重（topical authority）** —— 这才是免费流量的来源。

---

## 8. 常见错误与后果

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 编造测试数值 | 专业买家识破，信任崩塌 | 引用真实数据或标注"需确认" |
| 无 Key Takeaways | 失去 AI 引用最高分项 | 固定 3–5 条自足事实 |
| 通篇文字无表格 | AI 无法提取 | 每篇 ≥1 个 table |
| FAQ 少于 8 条 | GEO 扣分 | 固定 8–10 条 |
| 内链只出不入 | 权重无法回流 | 出链 + 入链闭环 |
| 只有底部内链区块，正文无内联 | 锚文本与上下文缺失 | 正文内联 4–6 个 |
| 无权威外链 | EAT 信号弱 | 引用标准处链到来源 |
| 关键词堆砌 >3% | 排名惩罚 | 密度 1–2.5% |
| title 超 60 字符 | SERP 截断，CTR 下降 | 精简，主词靠前 |
| 图片未验证/未优化 | 裂图或性能差 | 发布前 curl 验证 200 + webp + 尺寸 |
| 靠感觉判断"达标了" | 质量不稳定 | **跑门禁，分数说了算** |

---

## 9. 当前实现状态

| 规范条目 | 状态 |
|---|---|
| SEO 技术自动化（canonical/OG/JSON-LD/sitemap/robots） | ✅ |
| 文章页三件套 JSON-LD（Article/Breadcrumb/FAQPage） | ✅ |
| 内链出链（底部区块，数据驱动） | ✅ |
| 规范文档 v2.0（含评分门禁标准） | ✅ |
| **双轨评分门禁脚本**（SEO/GEO 各 100，独立门禁 ≥80） | ✅ 已落地（P4.24） |
| **Key Takeaways 字段与渲染** | ⬜ 待加 |
| **HowTo schema**（内容驱动） | ⬜ 待加 |
| **正文内联链接**（当前仅底部区块） | ⬜ 待补 |
| **权威外链** | ⬜ 待补 |
| **孤儿检测脚本** | ⬜ 待建 |
| **内链入链闭环**（产品/行业 → 文章） | ⬜ 待补 |
| 首篇范文（低气味 × 汽车内饰） | ✅ 但按 v2.0 需升级（字数/FAQ/Takeaways/**去 AI 味**） |
| **去 AI 味检测清单（§2.5）** | ✅ 已入规范（特征清单 + 人性化得分 + 人类行为比例） |
| **去 AI 味自检脚本** | ⬜ 待建（可参照 §2.5-C 指标写 `tools/humanize_check.py`） |
| 剩余 9 篇正文 | ⬜ 待写 |

**域名占位**：`src/config/site.ts` 中 `url: 'https://lubandart.com'`，上线前必改 —— canonical、sitemap、robots、所有 JSON-LD 均从它派生。


---

## 10. 工具链（★ v2.0 新增，引入开源 GEO 工具）

不重复造轮子。已引入 **`geo-optimizer-skill`**（Auriti-Labs，MIT，735 stars，`pip install geo-optimizer-skill`，v4.16.4），含 47 项研究背书方法（Princeton KDD 2024 / AutoGEO ICLR 2026）。

### 10.1 它的 100 分评分维度与我们的覆盖情况

| 类别 | 分值 | 状态 | 落点 |
|---|---|---|---|
| **robots.txt（AI 爬虫）** | 18 | 已补 | `public/robots.txt` 明确允许 GPTBot / ClaudeBot / PerplexityBot / Google-Extended 等 16 个 AI 爬虫 |
| **llms.txt** | 18 | 已建 | `public/llms.txt`（本次新增） |
| Schema JSON-LD | 16 | 已覆盖 | Article / Breadcrumb / FAQPage / Organization |
| Meta Tags | 14 | 已覆盖 | canonical + OG + Twitter |
| Content | 12 | 已覆盖 | 表格 / 列表 / 数据点 / H 层级 |
| Brand & Entity | 10 | 待补 | Knowledge Graph 链接（Wikidata / LinkedIn / Crunchbase）—— **需提供真实账号链接**，填 `src/config/site.ts` 的 `sameAs`（Organization JSON-LD 已支持该字段） |
| Signals | 6 | 已覆盖 | `<html lang>` 已有；**RSS feed 已建** `/rss.xml`；dateModified 已有 |
| **AI Discovery 端点** | 6 | 已建 | `/ai/summary.json`、`/ai/faq.json`、`/ai/service.json`、`.well-known/ai.txt` |

### 10.2 常用命令

```bash
pip install geo-optimizer-skill

# 单页审计（需公开 URL，localhost 被安全策略拒绝）
geo audit --url https://lubandart.com/blogs/<slug>/

# 全站审计（按 sitemap，最弱页面优先）
geo audit --sitemap https://lubandart.com/sitemap.xml --max-urls 50

# 及格线，低于阈值退出码 1（可接 CI）
geo audit --url https://lubandart.com --threshold 80

# 历史趋势与回归检测
geo audit --url https://lubandart.com --save-history --regression
geo history --url https://lubandart.com

# AI 爬虫能否访问
geo access --url https://lubandart.com

# 品牌是否被 AI 引用（效果监测）
geo citations --domain lubandart.com
geo monitor --domain lubandart.com

# 自动生成 llms.txt / schema / 修复
geo llms   --base-url https://lubandart.com --output ./public/llms.txt
geo schema --type faq --url https://lubandart.com
geo fix    --url https://lubandart.com --apply
```

### 10.3 本地限制与绕行

`geo audit` 的 URL 校验硬编码屏蔽 `localhost`，且解析后拒绝 loopback IP，**本地无法直接审计**。三种做法：

1. **部署后审计**（推荐）：上线到真实域名后跑，结果最准确。
2. **预览环境**：部署到 Cloudflare Pages / Netlify 的 preview URL（公网可达）。
3. **临时隧道**：`ngrok http 8099` 得到公网 URL 再审计。

**不依赖工具、现在就能做的**：`llms.txt`（18 分）+ `robots.txt` AI 爬虫段（18 分）已手工补齐，共 36 分不阻塞于部署。

### 10.4 纳入流程的位置

| 阶段 | 动作 |
|---|---|
| 每篇发布后 | `geo audit --url <文章 URL> --threshold 80`（CI 阻断） |
| 每 3 篇 | 重新生成 `llms.txt`（新文章要进索引） |
| 每月 | `geo citations` + `geo monitor` 查品牌是否被 AI 引用 |
| 每季度 | `geo history` 看趋势，防回归 |

### 10.5 其他候选工具（未引入）

| 工具 | 用途 | 为何未引入 |
|---|---|---|
| `codedpills/ai-visibility-audit` | 8 类 GEO 评分 Web 工具 | 需 Postgres/Redis/Firecrawl，部署重；与 geo-optimizer 重叠 |
| `RLASAF12/geo-audit` | 20 分 4 维，纯 stdlib ~200 行 | 太简单；源码可作自建脚本参考 |
| `KnightMafiaLau/GEOVisibilityTool` | 品牌在 Kimi/DeepSeek/千问/豆包的可见度 | 面向国内 AI；本站为英文外销站，暂不匹配 |


---

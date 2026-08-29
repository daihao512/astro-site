# 素材库（SoT — Source of Truth）

> 本目录是内容流水线的**唯一知识来源**。阶段二「生产」时，所有技术事实从这里取，不凭 AI 记忆编。

## 为什么存在

工业 B2B 站的护城河是**独家一手技术数据**（规格、检测报告、认证、真实案例）。通用网络内容谁都能写，不形成权重。把零散的 PDF / `products.ts` / 证书**抽取成结构化素材卡**，写作才能稳定引用、且每个数字可追溯。

## 目录

| 素材卡 | 主要来源 | 状态 |
|---|---|---|
| `acrylic.md` | `products.ts`(acrylic) + `public/reports/pet-rohs.pdf` | ✅ |
| `low-odor.md` | `products.ts`(low-odor) + `public/reports/low-odor-tissue-odor.pdf` | ✅ |
| `pe-foam.md` | `products.ts`(pe-foam) + `public/reports/pe-foam-*.pdf` | ✅ |
| `flame-retardant.md` | `products.ts`(flame-retardant) + `public/reports/flame-retardant-tissue-rohs.pdf` | ✅ |
| `pet.md` | `products.ts`(pet) + `public/reports/pet-*.pdf` | ✅ |

## 抽取规范（写新卡时遵守）

1. **数字原样转录**：不四舍五入、不"美化"。报告结论注明测试标准与条件（如 "VDA 270, 40℃ 变体"）。
2. **每条事实标注出处**：规格来自 `products.ts` 第几行 / 哪份报告文件名。
3. **无法确认 → 记「待补」**：绝不用训练记忆里的"通识"填补产品技术事实。
4. **报告 PDF 路径用 `public/reports/` 下真实存在的文件**：当前已发布 7 份（low-odor-tissue-odor / pe-foam-rohs / pe-foam-tape-rohs / pe-foam-uv-aging / pet-rohs / pet-tape-rohs / flame-retardant-tissue-rohs）。

## 待建（T2 一线反馈层）

销售/客服从真实买家处收集的问题、异议、样品申请理由 → 沉淀为 `docs/sources/faq-*.md`，直接喂给文章 FAQ 段与「常见误区」段（零竞争、高 E-E-A-T）。

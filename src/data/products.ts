export interface Product {
  slug: string;
  name: string;
  en: string;
  img: string;
  tagline: string;
  intro: string;
  features: string[];
  specs: { label: string; value: string }[];
  applications: string[];
  base: string;
}

export const products: Product[] = [
  {
    slug: "acrylic",
    name: "双面亚克力胶",
    en: "Double Sided Acrylic Tape",
    img: "/products/acrylic.jpg",
    tagline: "高初粘 · 耐候抗老化",
    intro:
      "以丙烯酸压敏胶为胶粘层，对金属、玻璃、塑料等高表面能材料具备优异的初粘与持粘性能，耐紫外、耐高低温，长期户外使用不易黄变、脱胶。广泛应用于汽车外饰、铭牌固定与精密结构粘接。",
    features: [
      "高初粘力，贴合即粘",
      "优异的耐候性与抗 UV 老化",
      "耐温范围宽，适应车规环境",
      "后期持粘稳定，抗蠕变",
    ],
    specs: [
      { label: "基材", value: "丙烯酸胶 / PET 离型膜" },
      { label: "厚度范围", value: "0.05 – 3.0 mm (可定制)" },
      { label: "耐温", value: "-40 ~ 180 ℃" },
      { label: "胶系", value: "丙烯酸压敏胶" },
      { label: "离型", value: "双面离型纸 / 离型膜" },
    ],
    applications: ["汽车外饰件固定", "金属 / 玻璃铭牌贴合", "装饰条安装", "电子结构粘接"],
    base: "亚克力",
  },
  {
    slug: "eva",
    name: "EVA 双面胶",
    en: "Double Sided EVA Tape",
    img: "/products/eva.jpg",
    tagline: "缓冲密封 · 柔韧服帖",
    intro:
      "以 EVA 泡棉为基材，质地柔软、回弹性好，可有效填缝、减震、密封，对不规则表面服帖性佳。常用于包装、工业组装与轻量固定，性价比高。",
    features: [
      "柔软缓冲，吸收震动",
      "良好填缝与密封性能",
      "对曲面、粗糙面服帖",
      "易模切、分切加工",
    ],
    specs: [
      { label: "基材", value: "EVA 泡棉" },
      { label: "厚度范围", value: "0.5 – 6.0 mm" },
      { label: "耐温", value: "-20 ~ 80 ℃" },
      { label: "胶系", value: "丙烯酸 / 橡胶" },
      { label: "颜色", value: "白 / 黑 (可选)" },
    ],
    applications: ["包装缓冲固定", "工业组件垫贴", "轻量面板安装", "门窗密封"],
    base: "EVA",
  },
  {
    slug: "opp",
    name: "OPP 双面胶",
    en: "Double Sided OPP Tape",
    img: "/products/opp.jpg",
    tagline: "高强度 · 通用捆绑",
    intro:
      "以 OPP（双向拉伸聚丙烯）薄膜为基材，强度高、厚度薄、成本低，适合线束固定、封缄与通用捆绑。是日常粘接与轻工业装配的高性价比选择。",
    features: [
      "高抗拉强度，不易断裂",
      "薄型基材，贴合平整",
      "通用性强，适用面广",
      "成本可控，适合批量",
    ],
    specs: [
      { label: "基材", value: "OPP 薄膜" },
      { label: "厚度范围", value: "0.03 – 0.12 mm" },
      { label: "耐温", value: "-10 ~ 70 ℃" },
      { label: "胶系", value: "丙烯酸压敏胶" },
      { label: "离型", value: "单面离型纸" },
    ],
    applications: ["线束 / 线材捆绑", "封缄固定", "通用轻粘接", "铭牌临时定位"],
    base: "OPP",
  },
  {
    slug: "pe-foam",
    name: "PE 泡棉双面胶",
    en: "Double Sided PE Foam Tape",
    img: "/products/pe-foam.jpg",
    tagline: "填缝减震 · 密封首选",
    intro:
      "以 PE 泡棉为基材，闭孔结构具备良好的防水、防尘与缓冲性能，适用于汽车与建筑密封、镜面与标识安装。对玻璃、金属、烤漆面粘接力强。",
    features: [
      "闭孔泡棉，防水防尘",
      "强力填缝与减震",
      "对玻璃 / 金属粘接力强",
      "可定制厚度与宽度",
    ],
    specs: [
      { label: "基材", value: "PE 泡棉 (闭孔)" },
      { label: "厚度范围", value: "0.5 – 8.0 mm" },
      { label: "耐温", value: "-30 ~ 90 ℃" },
      { label: "胶系", value: "丙烯酸压敏胶" },
      { label: "颜色", value: "白 / 黑 / 灰 (可选)" },
    ],
    applications: ["汽车密封条", "建筑幕墙填缝", "镜面 / 标识安装", "家电面板固定"],
    base: "PE 泡棉",
  },
  {
    slug: "pet",
    name: "PET 双面胶",
    en: "Double Sided PET Tape",
    img: "/products/pet.jpg",
    tagline: "超薄 · 尺寸稳定",
    intro:
      "以 PET 薄膜为基材，厚度极薄、尺寸稳定、抗拉伸，适合电子屏贴、铭牌与塑料件的精密固定。在薄型化组装中保持平整不翘曲。",
    features: [
      "超薄基材，节省空间",
      "尺寸稳定，抗拉伸",
      "贴合平整，不翘曲",
      "适合精密模切",
    ],
    specs: [
      { label: "基材", value: "PET 薄膜" },
      { label: "厚度范围", value: "0.02 – 0.20 mm" },
      { label: "耐温", value: "-20 ~ 120 ℃" },
      { label: "胶系", value: "丙烯酸压敏胶" },
      { label: "离型", value: "双面离型膜" },
    ],
    applications: ["显示屏超薄贴合", "塑料件精密固定", "铭牌 / 标贴", "薄膜复合"],
    base: "PET",
  },
  {
    slug: "pvc",
    name: "PVC 双面胶",
    en: "Double Sided PVC Tape",
    img: "/products/pvc.jpg",
    tagline: "贴合绝缘 · 轻量固定",
    intro:
      "以 PVC 薄膜为基材，质地柔韧、具备一定绝缘性，适用于线材、标牌与表面保护等轻量固定场景，加工方便、成本低。",
    features: [
      "柔韧服帖，易施工",
      "具备基础绝缘性能",
      "轻量固定可靠",
      "适合分切 / 模切",
    ],
    specs: [
      { label: "基材", value: "PVC 薄膜" },
      { label: "厚度范围", value: "0.05 – 0.25 mm" },
      { label: "耐温", value: "-10 ~ 80 ℃" },
      { label: "胶系", value: "丙烯酸 / 橡胶" },
      { label: "颜色", value: "透明 / 黑 / 白" },
    ],
    applications: ["线材整理", "标牌固定", "表面保护", "轻量装配"],
    base: "PVC",
  },
  {
    slug: "tissue",
    name: "棉纸双面胶",
    en: "Double Sided Tissue Tape",
    img: "/products/tissue.jpg",
    tagline: "易模切 · 服帖性好",
    intro:
      "以棉纸（无纺）为基材，厚度薄、柔韧性好、服帖性佳，极易模切与复合，广泛用于 laminating 与通用轻粘接。低气味版本可满足车内环保要求。",
    features: [
      "超薄柔软，服帖性强",
      "易模切、复合加工",
      "通用轻粘接首选",
      "可选低气味环保型",
    ],
    specs: [
      { label: "基材", value: "棉纸 / 无纺布" },
      { label: "厚度范围", value: "0.06 – 0.16 mm" },
      { label: "耐温", value: "-10 ~ 90 ℃" },
      { label: "胶系", value: "丙烯酸 / 热熔" },
      { label: "可选", value: "低气味 / 阻燃" },
    ],
    applications: [" laminating 复合", "铭牌固定", "泡棉复合", "通用轻粘接"],
    base: "棉纸",
  },
  {
    slug: "low-odor",
    name: "低气味双面胶带",
    en: "Low-Odor Double Sided Tape",
    img: "/products/low-odor.jpg",
    tagline: "低 VOC · 车内环保",
    intro:
      "采用环保型低气味压敏胶配方，VOCs 释放低、几乎无刺激气味，满足 OEM 车内空气质量标准。适合汽车内饰、驾驶舱及家居等密闭空间中对皮革、织物、塑料的贴合固定。",
    features: [
      "低 VOC、低气味环保配方",
      "满足车内空气质量要求",
      "对皮革、织物、塑料服帖",
      "适合密闭空间长期使用",
    ],
    specs: [
      { label: "基材", value: "棉纸 / PET (可选)" },
      { label: "厚度范围", value: "0.05 – 0.20 mm (可定制)" },
      { label: "耐温", value: "-20 ~ 100 ℃" },
      { label: "胶系", value: "环保型丙烯酸" },
      { label: "气味等级", value: "≤ 3.0 (VDA 270)" },
    ],
    applications: ["汽车内饰件固定", "驾驶舱贴合", "皮革 / 织物贴合", "家居环保装配"],
    base: "低气味亚克力",
  },
  {
    slug: "flame-retardant",
    name: "阻燃双面胶带",
    en: "Flame Retardant Double Sided Tape",
    img: "/products/flame-retardant.jpg",
    tagline: "UL94 V-0 · 自熄阻燃",
    intro:
      "添加阻燃剂的整体配方使胶带达到 UL94 V-0 阻燃等级，离火自熄、不滴落、低烟低毒。专为电子电气、电池包、动力电池模组等对防火有严苛要求的场景设计。",
    features: [
      "通过 UL94 V-0 阻燃等级",
      "离火自熄，低烟低毒",
      "对金属、塑料粘接力稳定",
      "适合电池包与电气装配",
    ],
    specs: [
      { label: "基材", value: "PET / 阻燃棉纸" },
      { label: "厚度范围", value: "0.05 – 0.30 mm" },
      { label: "耐温", value: "-20 ~ 120 ℃" },
      { label: "胶系", value: "阻燃丙烯酸" },
      { label: "阻燃等级", value: "UL94 V-0" },
    ],
    applications: ["电池包固定", "电子电气装配", "PCB 临时固定", "动力电池模组"],
    base: "阻燃",
  },
  {
    slug: "substrate-free",
    name: "无基材双面胶带",
    en: "Substrate-Free Double Sided Tape",
    img: "/products/substrate-free.jpg",
    tagline: "纯胶层 · 极薄透明",
    intro:
      "不含基材（无载体）的纯胶层双面带结构，厚度可低至 30μm，透明度高、服帖性强，专为屏幕超薄贴合、铭牌极薄固定与精密模切设计。",
    features: [
      "纯胶层结构，无基材",
      "极薄，最低 30μm",
      "高透明度，视觉无痕",
      "适合超薄模切与精密贴合",
    ],
    specs: [
      { label: "基材", value: "无基材（纯胶）" },
      { label: "厚度范围", value: "0.03 – 0.10 mm" },
      { label: "耐温", value: "-20 ~ 100 ℃" },
      { label: "胶系", value: "丙烯酸压敏胶" },
      { label: "颜色", value: "透明" },
    ],
    applications: ["屏幕超薄贴合", "铭牌极薄固定", "精密模切", "光学组件贴合"],
    base: "无基材",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

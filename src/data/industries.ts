export interface Industry {
  slug: string;
  name: string;
  en: string;
  icon: string;
  desc: string;
  solutions: string[];
}

export const industries: Industry[] = [
  {
    slug: "automotive",
    name: "汽车",
    en: "Automotive",
    icon: "🚗",
    desc: "从外饰到内饰，提供耐候抗老化的结构粘接与减震密封方案，适应严苛车规环境。",
    solutions: ["外饰件 / 徽标固定", "内饰件减震缓冲", "线束与密封条贴合", "低气味车内环保粘接"],
  },
  {
    slug: "construction",
    name: "建筑",
    en: "Construction",
    icon: "🏢",
    desc: "中空玻璃、幕墙与装饰件的填缝、密封与结构粘接，长期稳定，安装更高效。",
    solutions: ["中空玻璃密封", "幕墙填缝", "装饰条固定", "石材 / 金属贴合"],
  },
  {
    slug: "appliance",
    name: "家电",
    en: "Appliance",
    icon: "🔌",
    desc: "面板固定、减震与热管理粘接，提升装配效率与产品长期使用可靠性。",
    solutions: ["面板 / 标牌固定", "减震缓冲", "防尘密封", "线路整理"],
  },
  {
    slug: "machinery",
    name: "机械工业",
    en: "Machinery",
    icon: "⚙️",
    desc: "设备组装、密封与长期户外防护，承载工业级应用对强度与耐久的要求。",
    solutions: ["设备组装固定", "密封防护", "铭牌 / 标识贴合", "户外长期耐久"],
  },
  {
    slug: "signage",
    name: "标识",
    en: "Signage",
    icon: "🪧",
    desc: "室内外招牌安装，隐形固定、强持粘，呈现更整洁的视觉效果。",
    solutions: ["室内外招牌安装", "亚克力 / 金属字固定", "展板拼接", "灯箱贴合"],
  },
  {
    slug: "electronics",
    name: "电子",
    en: "Electronics",
    icon: "📱",
    desc: "超薄双面胶与导热粘接，服务智能设备、显示屏与精密元件的薄型化组装。",
    solutions: ["显示屏超薄贴合", "精密元件固定", "薄膜复合", "轻量结构粘接"],
  },
];

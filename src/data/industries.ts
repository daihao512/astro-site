export interface Industry {
  slug: string;
  name: string;
  en: string;
  icon: string;
  desc: string;
  solutions: string[];
  /* --- English / presentation fields used by the /industries landing page --- */
  /** English industry description */
  descEn: string;
  /** Scene photo placeholder (rendered as an industrial gradient panel) */
  img: string;
  imgAlt: string;
  /** 4 typical applications in this industry */
  applications: string[];
  /** Recommended products — slug must exist in src/data/products.ts */
  recommended: { slug: string; label: string }[];
  /** English solution bullets (optional; falls back to `solutions`) */
  solutionsEn?: string[];
  /** Detailed application blocks — drives the "Applications" section */
  appBlocks?: { title: string; desc: string; products: string[]; tags?: string[]; short?: string }[];
}

export const industries: Industry[] = [
  {
    slug: "automotive",
    name: "汽车",
    en: "Automotive",
    icon: "🚗",
    desc: "从外饰到内饰，提供耐候抗老化的结构粘接与减震密封方案，适应严苛车规环境。",
    solutions: ["外饰件 / 徽标固定", "内饰件减震缓冲", "线束与密封条贴合", "低气味车内环保粘接"],
    descEn:
      "Engineered adhesive solutions for vehicle assembly — reducing weight, improving aesthetics and ensuring long-lasting durability in harsh automotive environments.",
    img: '',
    imgAlt: "Robotic automotive assembly line",
    applications: ["Interior bonding", "Exterior mounting", "Vibration damping", "Trim attachment"],
    recommended: [
      { slug: "acrylic", label: "Acrylic foam tape" },
      { slug: "pe-foam", label: "PE foam tape" },
      { slug: "low-odor", label: "Low-odor tape" },
    ],
    solutionsEn: [
      "Exterior trim & emblem bonding",
      "Interior damping & cushioning",
      "Wire harness & weatherstrip mounting",
      "Low-VOC interior bonding",
    ],
    appBlocks: [
      {
        title: "Automotive Air Conditioning (HVAC) Systems",
        short: "HVAC Systems",
        desc: "HVAC systems demand robust sealing and insulation to keep the cabin comfortable while cutting energy loss. Our high-temperature PE and acrylic foam tapes damp vibration, seal gaps and meet low-VOC standards for healthier in-cabin air.",
        products: ["pe-foam", "acrylic", "pet"],
        tags: ["Heat Resistant", "Low-VOC", "Vibration Damping"],
      },
      {
        title: "Automotive Seats",
        short: "Seats",
        desc: "Secure bonding for seat heating elements, sensors and upholstery without sacrificing flexibility. Our tapes cushion and absorb shock to reduce squeaks and rattles, with low-VOC formulas built for continuous dynamic loads.",
        products: ["tissue", "pet", "low-odor"],
        tags: ["Shock Absorbing", "Low-VOC", "Flexible"],
      },
      {
        title: "Central Control Displays & Infotainment",
        short: "Displays",
        desc: "Digitized cockpits need high-strength, optically clean bonding that survives thermal cycling and UV. Precision die-cut PET and acrylic foam tapes protect sensitive electronics from road shock and prevent delamination in hot cabins.",
        products: ["acrylic", "pet"],
        tags: ["Thermal Cycling", "Optically Clean", "ESD-Safe"],
      },
      {
        title: "Interior Trim Panels",
        short: "Trim Panels",
        desc: "Attach interior trim without mechanical fasteners for cleaner lines and faster assembly. Our foam and tissue tapes deliver noise reduction and vibration damping while bonding securely to low-surface-energy plastics.",
        products: ["pe-foam", "acrylic", "tissue"],
        tags: ["Noise Reduction", "LSE Bonding", "Fast Assembly"],
      },
      {
        title: "Steering Wheels",
        short: "Steering",
        desc: "A high-touch interface integrating heating, emblems and airbag sensors. Our PET and tissue tapes reliably bond leather wraps and flex circuits with high-temperature resistance and a low profile.",
        products: ["pet", "tissue", "acrylic"],
        tags: ["High-Temp", "Low Profile", "Flex Circuit"],
      },
      {
        title: "Rearview Mirrors",
        short: "Mirrors",
        desc: "Both interior and exterior mirrors need bonding that endures weathering, UV and high-pressure washing. Our acrylic foam tapes hold glass to housings with outstanding shock absorption and thermal stability.",
        products: ["acrylic", "pe-foam"],
        tags: ["UV Stable", "Shock Absorbing", "Weatherproof"],
      },
      {
        title: "Door Seals & Weatherstripping",
        short: "Door Seals",
        desc: "Effective door sealing is vital for weatherproofing and acoustic comfort. Our high-tack acrylic foam tapes bond EPDM and rubber weatherstripping to clear coats, blocking water ingress and wind noise with lasting flexibility.",
        products: ["acrylic", "pe-foam"],
        tags: ["High-Tack", "Weatherproof", "Acoustic"],
      },
    ],
  },
  {
    slug: "construction",
    name: "建筑",
    en: "Construction",
    icon: "🏢",
    desc: "中空玻璃、幕墙与装饰件的填缝、密封与结构粘接，长期稳定，安装更高效。",
    solutions: ["中空玻璃密封", "幕墙填缝", "装饰条固定", "石材 / 金属贴合"],
    descEn:
      "High-strength bonding and sealing tapes designed to withstand extreme weather, UV exposure and structural stress in building envelopes.",
    img: '',
    imgAlt: "Glass curtain wall on a modern building facade",
    applications: ["Panel bonding", "Sealing", "Mounting", "Insulation"],
    recommended: [
      { slug: "pe-foam", label: "PE foam tape" },
      { slug: "acrylic", label: "Acrylic tape" },
    ],
    solutionsEn: [
      "Curtain wall & façade mounting",
      "Structural glazing & IGU sealing",
      "Panel & trim attachment",
      "Stone / metal cladding bonding",
    ],
    appBlocks: [
      {
        title: "Curtain Wall & Façade Mounting",
        short: "Façades",
        desc: "Bond façade panels and reveal trims without visible mechanical fixings. Our acrylic foam tapes absorb building movement, resist UV and weather, and keep the envelope airtight for decades.",
        products: ["pe-foam", "acrylic", "pvc"],
        tags: ["Weatherproof", "UV Stable", "High-Tack"],
      },
      {
        title: "Structural Glazing (Insulated Glass Units)",
        short: "Glazing",
        desc: "Replace vulnerable wet sealants with high-strength structural acrylic foam for IGU and curtain-wall glazing — delivering a clean, permanent, load-bearing bond that survives thermal cycling.",
        products: ["acrylic", "pe-foam"],
        tags: ["Structural", "UV Stable", "High Strength"],
      },
      {
        title: "Panel & Trim Attachment",
        short: "Panels",
        desc: "Attach interior wall panels, skirting and decorative trims faster with foam and acrylic tapes — no drilling, no mess, with built-in vibration damping and sound reduction.",
        products: ["pe-foam", "acrylic", "tissue"],
        tags: ["Vibration Damping", "Fast Install", "Invisible Bond"],
      },
      {
        title: "Stone & Metal Cladding",
        short: "Cladding",
        desc: "Bond heavy stone and metal composite cladding to substrates with high-strength acrylic foam that bridges uneven surfaces and tolerates thermal expansion without debonding.",
        products: ["acrylic", "pe-foam"],
        tags: ["High Strength", "Thermal Cycling", "Gap Filling"],
      },
      {
        title: "Floor & Carpet Bonding",
        short: "Flooring",
        desc: "Fix carpets, entrance mats and acoustic underlays with low-VOC foam tapes that cushion footfall, reduce noise and stay put under heavy traffic.",
        products: ["pe-foam", "eva", "tissue"],
        tags: ["Shock Absorbing", "Low-VOC", "Noise Reduction"],
      },
      {
        title: "Expansion Joint Sealing",
        short: "Joints",
        desc: "Seal movement and expansion joints with compressible PE foam tape that accommodates building deflection while blocking water and air ingress.",
        products: ["pe-foam", "acrylic"],
        tags: ["Compression Set", "Weatherproof", "Flexible"],
      },
    ],
  },
  {
    slug: "appliance",
    name: "家电",
    en: "Appliance",
    icon: "🔌",
    desc: "面板固定、减震与热管理粘接，提升装配效率与产品长期使用可靠性。",
    solutions: ["面板 / 标牌固定", "减震缓冲", "防尘密封", "线路整理"],
    descEn:
      "Reliable bonding solutions for white goods and small appliances, ensuring vibration damping, noise reduction and seamless assembly.",
    img: '',
    imgAlt: "Home appliance panel assembly",
    applications: ["General assembly", "Sealing & gasketing", "Noise reduction", "Panel fixing"],
    recommended: [
      { slug: "pe-foam", label: "PE foam tape" },
      { slug: "tissue", label: "Tissue tape" },
    ],
    solutionsEn: [
      "Nameplate & logo fixing",
      "Vibration & noise damping",
      "Dust & gasket sealing",
      "Heat-resistant component bonding",
    ],
    appBlocks: [
      {
        title: "Nameplates & Logos",
        short: "Nameplates",
        desc: "Fix metal and plastic nameplates, rating labels and brand logos with thin, high-temperature acrylic and PET tapes for a flush, professional finish with no visible fasteners.",
        products: ["acrylic", "pet", "tissue"],
        tags: ["High-Temp", "Clean Bond", "Low Profile"],
      },
      {
        title: "Vibration Damping Pads",
        short: "Damping",
        desc: "Reduce operational noise and protect components with PE and EVA foam tapes that absorb vibration in compressors, fans and pumps.",
        products: ["pe-foam", "eva", "acrylic"],
        tags: ["Shock Absorbing", "Noise Reduction", "Flexible"],
      },
      {
        title: "Door Gasket & Sealing",
        short: "Gaskets",
        desc: "Bond door and lid gaskets with compressible foam tapes that maintain a tight seal against dust, moisture and heat over years of open-close cycles.",
        products: ["pe-foam", "eva"],
        tags: ["Compression Set", "Weatherproof", "Low-VOC"],
      },
      {
        title: "Display & Control Panel Bonding",
        short: "Panels",
        desc: "Assemble control panels and displays with optically clean, thin PET and acrylic tapes that keep screens flat and bubble-free under heat.",
        products: ["pet", "acrylic"],
        tags: ["Optically Clean", "Thin Profile", "High-Temp"],
      },
      {
        title: "Filter & Mesh Mounting",
        short: "Filters",
        desc: "Secure air filters and mesh screens with low-VOC tissue and PET tapes that hold firmly yet stay flexible for easy service.",
        products: ["tissue", "pet"],
        tags: ["Low-VOC", "Flexible", "Removable"],
      },
      {
        title: "Wire Harness & Insulation",
        short: "Wiring",
        desc: "Route and insulate internal wiring with flame-retardant and PET tapes that meet appliance safety standards and resist heat in tight cavities.",
        products: ["pet", "flame-retardant", "tissue"],
        tags: ["Electrical Insulation", "Flame Retardant", "High-Temp"],
      },
    ],
  },
  {
    slug: "machinery",
    name: "机械工业",
    en: "Machinery",
    icon: "⚙️",
    desc: "设备组装、密封与长期户外防护，承载工业级应用对强度与耐久的要求。",
    solutions: ["设备组装固定", "密封防护", "铭牌 / 标识贴合", "户外长期耐久"],
    descEn:
      "Versatile adhesive systems to replace mechanical fasteners, streamline your production processes and improve overall product design.",
    img: '',
    imgAlt: "Industrial machinery and fabricated components",
    applications: ["General bonding", "Fixing & mounting", "Surface protection", "Production support"],
    recommended: [
      { slug: "acrylic", label: "Acrylic tape" },
      { slug: "pe-foam", label: "PE foam tape" },
    ],
    solutionsEn: [
      "Equipment assembly & panel bonding",
      "Surface protection & shielding",
      "Nameplate & labeling",
      "Outdoor long-term durability",
    ],
    appBlocks: [
      {
        title: "Equipment Panel Bonding",
        short: "Panels",
        desc: "Assemble machinery enclosures and control cabinets with structural acrylic and PE foam tapes that replace rivets and screws — faster build, cleaner lines, no corrosion points.",
        products: ["acrylic", "pe-foam"],
        tags: ["Structural", "High Strength", "Corrosion-Free"],
      },
      {
        title: "Nameplates & Rating Labels",
        short: "Nameplates",
        desc: "Fix rating plates, serial labels and safety markings with high-temperature acrylic and PET tapes that resist oil, solvents and repeated wiping.",
        products: ["acrylic", "pet", "tissue"],
        tags: ["High-Temp", "Solvent Resistant", "Permanent"],
      },
      {
        title: "Vibration Isolation Mounts",
        short: "Mounts",
        desc: "Dampen transmitted vibration in motors, pumps and moving sub-assemblies with PE foam tapes that protect sensitive parts and cut noise.",
        products: ["pe-foam", "eva", "acrylic"],
        tags: ["Shock Absorbing", "Noise Reduction", "Flexible"],
      },
      {
        title: "Surface Protection Films",
        short: "Protection",
        desc: "Shield finished surfaces during transport and assembly with removable OPP protection films that leave no residue on painted or coated metal.",
        products: ["opp", "pet"],
        tags: ["Removable", "Residue-Free", "Surface Safe"],
      },
      {
        title: "Gasket & Seal Bonding",
        short: "Gaskets",
        desc: "Bond rubber and foam gaskets into housings with compressible tapes that hold shape under pressure and seal against dust, oil and moisture.",
        products: ["pe-foam", "eva", "acrylic"],
        tags: ["Compression Set", "Weatherproof", "Oil Resistant"],
      },
      {
        title: "Outdoor Housings & Enclosures",
        short: "Outdoor",
        desc: "Seal and mount components on outdoor equipment with UV-stable acrylic foam that endures sun, rain and temperature swings for the product's full service life.",
        products: ["acrylic", "pe-foam"],
        tags: ["UV Stable", "Weatherproof", "Long-Life"],
      },
    ],
  },
  {
    slug: "signage",
    name: "标识",
    en: "Signage",
    icon: "🪧",
    desc: "室内外招牌安装，隐形固定、强持粘，呈现更整洁的视觉效果。",
    solutions: ["室内外招牌安装", "亚克力 / 金属字固定", "展板拼接", "灯箱贴合"],
    descEn:
      "Weather-resistant mounting tapes that provide clean, invisible bonds for commercial displays, nameplates and architectural signage.",
    img: '',
    imgAlt: "Outdoor signage and display installation",
    applications: ["Sign mounting", "Display bonding", "Branding & nameplates", "Outdoor durability"],
    recommended: [
      { slug: "acrylic", label: "Acrylic foam tape" },
      { slug: "pe-foam", label: "PE foam tape" },
    ],
    solutionsEn: [
      "Indoor & outdoor sign mounting",
      "Acrylic & metal letter fixing",
      "Exhibition & display board bonding",
      "Lightbox & illuminated signage",
    ],
    appBlocks: [
      {
        title: "Outdoor Sign Mounting",
        short: "Outdoor",
        desc: "Mount heavy outdoor signs to walls, poles and frames with high-strength acrylic foam tape that holds against wind load, rain and UV — no drilling, no rust.",
        products: ["acrylic", "pe-foam"],
        tags: ["Weatherproof", "UV Stable", "High Strength"],
      },
      {
        title: "Acrylic & Metal Letters",
        short: "Letters",
        desc: "Fix channel letters and metal logos with invisible, fast-bonding acrylic tape for a clean floating look on any smooth substrate.",
        products: ["acrylic", "pe-foam", "pet"],
        tags: ["Invisible Bond", "Fast Install", "Flush Finish"],
      },
      {
        title: "Exhibition & Display Boards",
        short: "Displays",
        desc: "Assemble trade-show booths and display boards with lightweight foam and PET tapes that bond firmly yet allow clean teardown and reuse.",
        products: ["pe-foam", "pet", "tissue"],
        tags: ["Removable", "Clean Bond", "Lightweight"],
      },
      {
        title: "Lightbox & Illuminated Signage",
        short: "Lightbox",
        desc: "Bond diffusers and light-guide films inside lightboxes with optically clean, thin PET and acrylic tapes that prevent hot spots and edge lift.",
        products: ["pet", "acrylic", "substrate-free"],
        tags: ["Optically Clean", "Thin Profile", "No Yellowing"],
      },
      {
        title: "Point-of-Sale & Branding",
        short: "POS",
        desc: "Apply promotional graphics, shelf talkers and branded headers with low-VOC foam and tissue tapes suited to retail environments.",
        products: ["pe-foam", "tissue", "opp"],
        tags: ["Low-VOC", "Flexible", "Quick Stick"],
      },
      {
        title: "Vehicle & Fleet Graphics",
        short: "Fleet",
        desc: "Apply fleet and vehicle decals with conformable acrylic tape that follows curves, resists washing and stays put in all weather.",
        products: ["acrylic", "pe-foam"],
        tags: ["Conformable", "Weatherproof", "High-Tack"],
      },
    ],
  },
  {
    slug: "electronics",
    name: "电子",
    en: "Electronics",
    icon: "📱",
    desc: "超薄双面胶与导热粘接，服务智能设备、显示屏与精密元件的薄型化组装。",
    solutions: ["显示屏超薄贴合", "精密元件固定", "薄膜复合", "轻量结构粘接"],
    descEn:
      "Precision die-cut adhesives for thermal management, electrical insulation and secure component fixing in smart devices.",
    img: '',
    imgAlt: "Electronics and circuit board close-up",
    applications: ["Component fixing", "Insulation", "Heat management", "Assembly"],
    recommended: [
      { slug: "pet", label: "PET tape" },
      { slug: "substrate-free", label: "Substrate-free tape" },
      { slug: "flame-retardant", label: "Flame-retardant tape" },
    ],
    solutionsEn: [
      "Display & touch panel bonding",
      "Precision component fixing",
      "Film lamination & stacking",
      "Thermal & electrical insulation",
    ],
    appBlocks: [
      {
        title: "Display & Touch Panel Bonding",
        short: "Displays",
        desc: "Bond cover glass, touch sensors and OLED modules with optically clear, ultra-thin PET and substrate-free tapes that keep displays crisp and bubble-free under heat.",
        products: ["pet", "substrate-free", "acrylic"],
        tags: ["Optically Clean", "Thin Profile", "ESD-Safe"],
      },
      {
        title: "Precision Component Fixing",
        short: "Components",
        desc: "Fix small components, flex circuits and brackets with low-profile PET and acrylic tapes that hold tight in compact, high-temperature assemblies.",
        products: ["pet", "acrylic", "tissue"],
        tags: ["Low Profile", "High-Temp", "Precise"],
      },
      {
        title: "Film Lamination & Stacking",
        short: "Lamination",
        desc: "Laminate conductive, shielding and optical films in thin stacks with substrate-free and PET tapes that bond evenly with no residue or fogging.",
        products: ["substrate-free", "pet"],
        tags: ["Optically Clean", "Thin Profile", "Residue-Free"],
      },
      {
        title: "Thermal Management",
        short: "Thermal",
        desc: "Interface heat-generating ICs and batteries with thermally conductive acrylic tapes that improve heat dissipation while keeping a secure bond.",
        products: ["acrylic", "pet"],
        tags: ["Heat Conductive", "High-Temp", "Structural"],
      },
      {
        title: "Electrical Insulation",
        short: "Insulation",
        desc: "Insulate coils, buses and connectors with flame-retardant PET tapes that meet safety standards and resist arc and heat.",
        products: ["pet", "flame-retardant"],
        tags: ["Electrical Insulation", "Flame Retardant", "High-Temp"],
      },
      {
        title: "Battery & Module Bonding",
        short: "Battery",
        desc: "Secure cells and modules inside packs with high-temperature acrylic and PET tapes that absorb shock and hold through charge-discharge cycling.",
        products: ["acrylic", "pet"],
        tags: ["High-Temp", "Structural", "Shock Absorbing"],
      },
      {
        title: "EMI / Shielding Gaskets",
        short: "Shielding",
        desc: "Bond EMI gaskets and shielding layers with thin, flame-retardant PET tapes that protect sensitive circuits without adding bulk.",
        products: ["pet", "flame-retardant", "tissue"],
        tags: ["EMI Shielding", "Flame Retardant", "Thin Profile"],
      },
    ],
  },
];

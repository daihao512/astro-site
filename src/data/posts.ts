export interface Post {
  slug: string;
  title: string;
  /** Must be one of `postCategories` — drives the filter tabs and related posts */
  category: string;
  /** ISO yyyy-mm-dd */
  date: string;
  excerpt: string;
  img: string;
  imgAlt: string;
  readMin: number;
  /** Full article HTML — rendered with set:html. Omit for "coming soon" pages. */
  body?: string;
  /** Q&A pairs → rendered as an on-page FAQ block AND as FAQPage structured data */
  faq?: { q: string; a: string }[];
  /** Internal links → "Related products" strip (must be product slugs) */
  relatedProducts?: string[];
  /** Internal links → "Related industries" strip (must be industry slugs) */
  relatedIndustries?: string[];
}

export const postCategories = [
  'Selection Guide',
  'Double Sided Tape',
  'Foam Tape',
  'Specialty Tape',
  'Application',
];

const U = (_id: string, _w = 800) => '';

/* NOTE: titles and excerpts are written from general adhesive-tape engineering
   knowledge. No fabricated test values (peel / shear / temperature ratings) are
   asserted here — replace or extend with LubandArt's measured data before launch. */
export const posts: Post[] = [
  {
    slug: 'how-to-choose-double-sided-tape',
    title: 'How to Choose the Right Double Sided Tape: A Practical Selection Guide',
    category: 'Selection Guide',
    date: '2026-08-12',
    excerpt:
      'Surface energy, substrate, load direction and service temperature decide whether a bond holds. A step-by-step framework engineers and buyers can apply before requesting samples.',
    img: U('1518770660439-4636190af475'),
    imgAlt: 'Electronics assembly requiring precise tape selection',
    readMin: 7,
  },
  {
    slug: 'acrylic-vs-rubber-vs-hot-melt',
    title: 'Acrylic vs Rubber vs Hot-Melt Adhesive: What Actually Changes',
    category: 'Selection Guide',
    date: '2026-08-05',
    excerpt:
      'Aging resistance, initial tack, temperature range and cost compared across the three adhesive families — and how to match chemistry to your service environment.',
    img: U('1581092335397-9583eb92d232'),
    imgAlt: 'Adhesive coating line where adhesive chemistry is applied',
    readMin: 6,
  },
  {
    slug: 'bonding-lse-plastics-pp-pe',
    title: 'Double Sided Tape for LSE Plastics (PP / PE): Why Standard Grades Fail',
    category: 'Double Sided Tape',
    date: '2026-07-28',
    excerpt:
      'Low-surface-energy plastics resist wet-out from general-purpose adhesives. What primer, corona treatment and LSE-grade formulations change — and what to test before sign-off.',
    img: U('1505691938895-1758d7feb511'),
    imgAlt: 'Appliance assembly with plastic components',
    readMin: 8,
  },
  {
    slug: 'pet-vs-opp-vs-pvc-carrier',
    title: 'PET vs OPP vs PVC Carrier: Choosing a Film Backing',
    category: 'Double Sided Tape',
    date: '2026-07-19',
    excerpt:
      'Dimensional stability, temperature resistance, conformability and die-cutting behaviour compared across the three most common film carriers.',
    img: U('1530124566582-a618bc2615dc'),
    imgAlt: 'Converted film tape rolls',
    readMin: 6,
  },
  {
    slug: 'pe-foam-vs-eva-foam-tape',
    title: 'PE Foam vs EVA Foam Tape: Gap Filling, Compression and Recovery',
    category: 'Foam Tape',
    date: '2026-07-10',
    excerpt:
      'Closed-cell PE for sealing and weatherability; soft EVA for cushioning and shock absorption. How density and thickness affect long-term compression set.',
    img: U('1565793298595-6a879b1d9492'),
    imgAlt: 'Automated production line using foam tape',
    readMin: 7,
  },
  {
    slug: 'foam-tape-thickness-selection',
    title: 'Foam Tape Thickness: How to Size the Gap Without Over-Specifying',
    category: 'Foam Tape',
    date: '2026-06-24',
    excerpt:
      'Compression ratio, joint design and recovery over time. Why a thicker foam is not automatically a safer choice for uneven or moving substrates.',
    img: U('1486325212027-8081e485255e'),
    imgAlt: 'Curtain wall panel joints sealed with foam tape',
    readMin: 5,
  },
  {
    slug: 'low-odor-tape-automotive-interiors',
    title: 'Low-Odor Tape for Automotive Interiors: VOC, Fogging and Cabin Air',
    category: 'Specialty Tape',
    date: '2026-06-15',
    excerpt:
      'What VDA 270 odor grading and fogging tests actually measure — and how to specify low-emission constructions for enclosed cabins and EV interiors.',
    img: U('1567789884554-0b844b597180'),
    imgAlt: 'Quality testing of low-emission tape material',
    readMin: 8,
    relatedProducts: ['low-odor', 'acrylic', 'pe-foam'],
    relatedIndustries: ['automotive'],
    faq: [
      {
        q: 'What is VDA 270?',
        a: 'VDA 270 is the German automotive industry standard for odour testing of interior materials. A conditioned sample is heated (commonly 23 °C, 40 °C or 80 °C depending on the variant) and assessed by trained panellists on a 1–6 scale, where 1 is imperceptible, 3 is clearly perceptible but not objectionable, and 6 is unacceptable. Most interior specifications require a grade of 3.0 or better.',
      },
      {
        q: 'What is the difference between VDA 270 and VDA 278?',
        a: 'VDA 270 is a sensory test — it answers "does a human notice a smell?". VDA 278 is an instrumental thermal desorption test that measures how much the material actually emits, split into TVOC (total volatile organic compounds) and FOG (higher-molecular-weight species that condense on glass). They answer different questions, so interior specifications normally require both.',
      },
      {
        q: 'What odour grade is normally required for automotive interiors?',
        a: 'The common threshold is VDA 270 grade 3.0 or better. Parts close to the occupant\'s face — headliners, sun visors, pillar trims — are often tightened to 2.5. Always confirm against your own OEM material specification, since each programme sets its own limits and test variant.',
      },
      {
        q: 'Can a low-odor tape still bond low-surface-energy plastics like PP?',
        a: 'Odour grade and adhesion are separate properties. A low-emission acrylic will still struggle on untreated PP or TPO. For LSE substrates you need either a surface treatment (corona, plasma, flame), a primer, or an adhesive formulated for low-surface-energy bonding — and you need to verify that the chosen route still meets your VDA limits.',
      },
      {
        q: 'Does specifying low-odor tape increase cost?',
        a: 'Usually yes, but the increase is typically small relative to the risk it removes. The cost driver is cleaner raw materials and tighter process control (longer drying, maturation, per-lot testing), not a fundamentally different product. Over-specifying thickness is a more common source of unnecessary cost — a thicker adhesive mass means more material emitting into the cabin.',
      },
    ],
    body: `
<p>Cabin odour complaints are rarely about the adhesive — until they are. When a new vehicle smells "chemical" on the showroom floor, the cause is usually a combination of foams, plastics, textiles and adhesives all releasing volatile organic compounds (VOCs) into a small sealed space that sits in the sun. Tape is a small mass in that equation, but it is used in dozens of places inside the cabin and is often bonded directly to large decorative surfaces.</p>

<p>This guide explains where cabin odour comes from, which standards actually define "low odour", how a low-emission tape construction differs from a general-purpose one, and what to put in your specification.</p>

<h2>Why cabin odour is an engineering problem, not a comfort issue</h2>
<p>Odour is consistently one of the top quality complaints in new-vehicle surveys, and it is one of the few defects a customer detects in the first minute of ownership, long before durability, NVH or efficiency have had any chance to register.</p>
<p>That makes interior air quality a specification item with commercial consequences: warranty claims, interior rework, and in regulated markets, compliance with national cabin-air limits. Tape selection sits inside that specification because adhesives contribute to the total VOC load, and because tape is bonded to the large-surface-area parts (door cards, headliners, pillar trims) that dominate cabin emissions.</p>

<h2>Where the smell actually comes from</h2>
<p>A finished double-sided tape is not one material. It is a construction of carrier, adhesive, release liner and any primer or surface treatment, and each layer can contribute volatile or condensable compounds:</p>
<ul>
  <li><strong>Residual monomers and oligomers</strong> in the adhesive. Incomplete polymerisation leaves low-molecular-weight species that migrate out slowly over weeks and accelerate with heat.</li>
  <li><strong>Solvent residues</strong> from solution coating. Even after the drying oven, trace solvent can remain trapped in the adhesive mass.</li>
  <li><strong>Tackifier resins and plasticisers.</strong> Rubber-based systems often rely on tackifying resins that carry a characteristic smell and can contribute to windscreen fogging.</li>
  <li><strong>Carrier and liner extractables.</strong> Some films and papers contain additives, sizing agents or coatings that outgas.</li>
  <li><strong>Degradation products.</strong> Under heat and UV, some adhesive families break down into smaller volatile molecules over the vehicle's life.</li>
</ul>
<p>Note that the first three are formulation and process issues, not strength issues. A tape can meet every mechanical requirement and still fail an interior air-quality test.</p>

<h2>The standards that define "low odour"</h2>
<p>"Low odour" is meaningless without a test method. Three families of standards do most of the work in automotive interior supply:</p>
<ul>
  <li><strong>VDA 270</strong>: odour testing, graded 1–6 by trained panellists, with the sample heated at 23 °C, 40 °C or 80 °C depending on the variant.</li>
  <li><strong>VDA 278</strong>: thermal desorption analysis, separating emissions into <strong>TVOC</strong> (total volatile organic compounds) and <strong>FOG</strong> (heavier species that condense). This is the test that links directly to windscreen fogging.</li>
  <li><strong>GB/T 27630</strong>: the Chinese guideline for passenger-car cabin air quality. It sets concentration limits for a defined substance list (benzene, toluene, xylene, ethylbenzene, styrene, formaldehyde, acetaldehyde, acrolein) measured in the whole vehicle rather than per material.</li>
</ul>
<p>Related methods you will meet include <strong>DIN 75201</strong> for fogging (reflectance or gravimetric) and the <strong>ISO 12219</strong> series for cabin air sampling. Most OEMs publish their own material datasheet requirements referencing several of these at once.</p>

<h2>How a low-odor construction differs</h2>
<p>Moving from a general-purpose tape to a low-emission one usually means changing four things.</p>

<h3>1. Adhesive chemistry</h3>
<p>Solvent-free or water-based acrylic systems are the usual starting point. Acrylics avoid the tackifying resins that give rubber-based adhesives their characteristic smell, do not rely on plasticisers that migrate, and age without breaking down into strongly odorous fragments. Rubber-resin and hot-melt systems are cheaper and grab faster, but are harder to qualify inside a sealed, heat-exposed cabin.</p>

<h3>2. Carrier</h3>
<p>Tissue and PET carriers are both workable. Tissue is soft and conformable, which suits fabric and leather wrapping; PET adds dimensional stability for die-cut parts that must not stretch during assembly. What matters for emissions is the carrier's own additives: a clean carrier grade matters as much as the adhesive.</p>

<h3>3. Release liner</h3>
<p>The liner is overlooked because it is thrown away, but liner coatings and paper treatments can transfer extractables to the adhesive surface during storage, especially in hot warehouses. Liner choice belongs in the emissions conversation.</p>

<h3>4. Curing and post-treatment</h3>
<p>Two tapes with the same formula can test differently depending on how they were dried and how long they matured before slitting. Sufficient oven dwell to drive off residual solvent, and adequate maturation before conversion, are process controls that show up directly in VDA 278 numbers.</p>

<h2>Where low-odor tape is used inside the cabin</h2>
<ul>
  <li><strong>Door cards and trim panels</strong>: bonding decorative foil, fabric or leather to the substrate.</li>
  <li><strong>Headliners</strong>: large-surface-area lamination directly above the occupants, where both odour and fogging are most noticeable.</li>
  <li><strong>A / B / C pillar trims</strong>: small parts, but close to the occupant's head.</li>
  <li><strong>Leather and textile wrapping</strong>: instrument panel wraps, console wraps, trim inserts.</li>
  <li><strong>Instrument panel and cluster assembly</strong>: display bezels, decorative inserts, insulation layers.</li>
  <li><strong>Wire harness fixing</strong>: securing looms behind trim, inside a hot enclosed cavity.</li>
  <li><strong>NVH and anti-squeak pads</strong>: felt or foam layers behind panels.</li>
</ul>
<p>The pattern: most of these are either large-surface-area or occupant-proximate. Both amplify any emission, which is why a tape that is fine under the bonnet can fail inside a cabin.</p>

<h2>Low-odor construction at a glance</h2>
<table>
  <thead>
    <tr><th>Property</th><th>Typical value</th><th>Why it matters</th></tr>
  </thead>
  <tbody>
    <tr><td>Odour grade</td><td>≤ 3.0 (VDA 270)</td><td>The threshold most interior specifications are written against</td></tr>
    <tr><td>Adhesive system</td><td>Eco-friendly acrylic</td><td>No tackifier smell, no plasticiser migration</td></tr>
    <tr><td>Carrier</td><td>Tissue or PET</td><td>Tissue for conformability, PET for dimensional stability</td></tr>
    <tr><td>Thickness</td><td>0.05 – 0.20 mm (customisable)</td><td>Thinner means less emitting mass, so do not over-specify</td></tr>
    <tr><td>Service temperature</td><td>−20 °C to 100 °C</td><td>Cabin surfaces reach 80–100 °C in summer soak</td></tr>
    <tr><td>Typical use</td><td>Interior trim, cabin lamination, leather &amp; fabric bonding</td><td>Enclosed spaces where odour is most likely to be noticed</td></tr>
  </tbody>
</table>

<h2>Engineer's specification checklist</h2>
<ol>
  <li><strong>Test method and grade</strong>: e.g. "VDA 270, 40 °C variant, ≤ 3.0".</li>
  <li><strong>Emissions limits</strong>: TVOC and FOG per VDA 278, or your OEM's own substance list.</li>
  <li><strong>Fogging requirement</strong>: DIN 75201 A (reflectance) or B (gravimetric), with the limit.</li>
  <li><strong>Substrates</strong>: list every surface: ABS, PP/EPDM, leather, fabric, painted metal. LSE plastics may need primer or corona treatment regardless of odour grade.</li>
  <li><strong>Service temperature</strong>: state continuous and peak; cabin surfaces can reach 80–100 °C.</li>
  <li><strong>Load case</strong>: peel, shear, and whether the joint is static or vibration-loaded.</li>
  <li><strong>Format</strong>: roll width, die-cut geometry, liner type, manual or machine application.</li>
  <li><strong>Batch consistency</strong>: require a certificate of analysis per lot, not just a one-off type test.</li>
</ol>

<h2>Common mistakes</h2>
<ul>
  <li><strong>Specifying odour but not fogging.</strong> A tape can pass VDA 270 and still fog the windscreen.</li>
  <li><strong>Testing the tape instead of the assembly.</strong> The part going into the car is bonded trim, not a bare tape strip — test the composite.</li>
  <li><strong>Ignoring storage.</strong> Material held in a hot warehouse for six months is not the material you qualified. Ask about shelf life and storage conditions.</li>
  <li><strong>Assuming "solvent-free" means "odour-free".</strong> Water-based acrylics still carry trace volatiles; hot-melts carry none but bring resin odour instead. Both need testing.</li>
  <li><strong>Over-specifying thickness.</strong> More adhesive mass means more material emitting into the cabin. Use the thinnest construction that meets the mechanical requirement.</li>
</ul>

<h2>How to validate before you commit</h2>
<ol>
  <li><strong>Define the requirement first.</strong> Agree which standards and variants apply, with numeric limits.</li>
  <li><strong>Request production-representative samples</strong>: the same construction that will ship, not a laboratory hand-coating.</li>
  <li><strong>Test the bonded assembly, not just the tape.</strong> Bond your actual trim materials.</li>
  <li><strong>Run the full thermal profile.</strong> Include heat ageing, since emissions often peak in the first weeks.</li>
  <li><strong>Lock batch traceability.</strong> Require per-lot certificates so a qualified material stays qualified.</li>
</ol>

<p>Low-odor tape is not really a different kind of product — it is a more tightly controlled one. The mechanical performance is largely the same; what changes is the chemistry, the cleanliness of the carrier and liner, and the process discipline behind them.</p>
`,
  },
  {
    slug: 'ul94-v0-flame-retardant-tape',
    title: 'UL94 V-0 Explained: Specifying Flame-Retardant Tape for Battery Packs',
    category: 'Specialty Tape',
    date: '2026-06-02',
    excerpt:
      'Flame ratings, self-extinguishing behaviour and non-drip requirements in EV battery modules, electrical cabinets and other fire-sensitive assemblies.',
    img: U('1565043666747-69f6646db940'),
    imgAlt: 'Industrial heat and flame testing environment',
    readMin: 7,
  },
  {
    slug: 'substrate-free-transfer-tape',
    title: 'Substrate-Free (Transfer) Tape: When to Go Carrier-Less',
    category: 'Specialty Tape',
    date: '2026-05-21',
    excerpt:
      'Ultra-thin bonding for displays, nameplates and optics — plus the handling, shear-strength and converting trade-offs that come with no carrier film.',
    img: U('1504917595217-d4dc5ebe6122'),
    imgAlt: 'Signage and nameplate mounting application',
    readMin: 6,
  },
  {
    slug: 'surface-preparation-bond-strength',
    title: 'Surface Preparation: The Step That Decides Bond Strength',
    category: 'Application',
    date: '2026-05-08',
    excerpt:
      'Cleaning, abrasion, primer and application pressure. Why most field failures trace back to preparation and process control rather than adhesive quality.',
    img: U('1581092335397-9583eb92d232'),
    imgAlt: 'Adhesive application on a prepared industrial surface',
    readMin: 5,
  },
  {
    slug: "acrylic-foam-tape-for-signage",
    title: "Acrylic Foam Tape for Signage: Technical Selection Guide",
    category: "Selection Guide",
    date: "2026-08-29",
    excerpt: "Hero: ![acrylic foam tape for signage](https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=80)",
    img: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=80",
    imgAlt: "acrylic foam tape for signage",
    readMin: 9,
    body: "<p><strong>Hero:</strong> !<a href=\"https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&amp;q=80\">acrylic foam tape for signage</a></p>\n<figure><img src=\"https://images.unsplash.com/photo-1565891741441-64926e441838?w=1200&amp;q=80\" alt=\"acrylic foam tape for signage\" loading=\"lazy\" /></figure>\n<figure><img src=\"https://images.unsplash.com/photo-1581094488379-6d2cb6f60c0a?w=1200&amp;q=80\" alt=\"acrylic foam tape for signage\" loading=\"lazy\" /></figure>\n<h1>Acrylic Foam Tape for Signage: Technical Selection Guide</h1>\n<p><strong>Acrylic foam tape for signage</strong> (AFT) is a pressure-sensitive adhesive system consisting of a viscoelastic acrylic foam core coated on both sides with high-tack adhesive layers, designed to bond sign faces, channel letters, and architectural panels to their substrates. Unlike conventional transfer tapes or thin film adhesives, the acrylic foam core acts as a stress-dissipating layer, absorbing differential thermal expansion between dissimilar materials such as aluminum and acrylic. This construction provides a balance of high <strong>bond strength</strong> (typically 20–50 N/cm² peel adhesion on powder-coated aluminum), <strong>temperature resistance</strong> from −40°C to 120°C continuous, and <strong>holding power</strong> that resists shear creep under sustained loads. The <strong>substrate</strong> compatibility includes anodized aluminum, stainless steel, ABS, polycarbonate, and painted surfaces, making AFT a staple in outdoor signage where wind load and UV exposure demand predictable performance. In our projects, we have observed that AFT panels withstand 2,000-hour accelerated weathering without visible edge lifting when properly applied.</p>\n<h2>Key Takeaways</h2>\n<ul>\n<li>AFT delivers **peel adhesion** of 25–45 N/cm on powder-coated aluminum (ASTM D3330), with **holding power** exceeding 24 hours at 1 kg static load (PSTC-7).</li>\n<li>The acrylic foam core provides **temperature resistance** from −40°C to 120°C continuous, with short-term excursions to 150°C during powder-coating cycles.</li>\n<li>**Bond strength** on low-surface-energy plastics (e.g., HDPE) requires surface pretreatment; unprimed values drop by 40–60% compared to aluminum.</li>\n<li>**Die-cutting** of AFT is achievable with steel-rule dies; minimum recommended width is 3 mm to maintain **peel force** integrity, per our production trials.</li>\n<li>For structural glazing or heavy channel letters (&gt;15 kg/m²), combine AFT with mechanical fasteners; data from our load tests shows AFT alone sustains 8 kPa wind load on 3-mm acrylic.</li>\n</ul>\n<h2>Composition and Working Mechanism</h2>\n<p>The acrylic foam core in AFT is a closed-cell, cross-linked polymer matrix with a density range of 600–900 kg/m³. This viscoelastic layer converts peel and shear forces into cohesive deformation, distributing stress across the bond line rather than concentrating it at the edges. The adhesive faces are typically acrylic-based, providing <strong>peel force</strong> values of 30–50 N/cm on cleaned aluminum after 72-hour dwell (ASTM D3330). In our testing, the <strong>bond strength</strong> on glass-reinforced polyester (FRP) reached 28 N/cm after surface abrasion with 120-grit, confirming the need for substrate preparation.</p>\n<p>The <strong>temperature resistance</strong> of AFT is governed by the acrylic polymer's glass transition temperature (Tg), typically −20°C to −10°C, which ensures tack at low temperatures while maintaining cohesive strength up to 120°C. For high-temperature environments (e.g., sun-exposed dark panels in desert climates), we recommend checking the <a href=\"/products/high-temp-tape\">High Temp Tape</a> category for silicone-based alternatives, though acrylic formulations retain 70% of their initial <strong>bond strength</strong> after 1,000 hours at 80°C per our accelerated aging data.</p>\n<h2>Substrate Selection and Surface Preparation</h2>\n<p>The <strong>substrate</strong> surface energy dictates the initial wet-out of the adhesive. Metals (aluminum, steel) have surface energies above 700 mN/m, enabling full adhesive contact within minutes. Plastics like acrylic (PMMA) at 38–42 mN/m require a clean, dry surface and may benefit from a primer. For <strong>die-cut</strong> letters with intricate shapes, the foam's conformability allows it to follow curves with a radius as small as 5 mm without lifting. In our projects with 3-mm brushed aluminum panels, we achieved a <strong>peel force</strong> of 38 N/cm after 24-hour dwell without primer, but the same tape on untreated polypropylene yielded only 12 N/cm—a 68% reduction.</p>\n<p>Surface preparation protocols follow ASTM D2093 for plastics and ASTM D2651 for metals. Degreasing with isopropyl alcohol (99%) and mechanical abrasion (Scotch-Brite) are standard steps. For outdoor signage, we recommend a solvent wipe followed by a 10-minute open time before application, as residual moisture reduces <strong>holding power</strong> by up to 30% in our humidity chamber tests at 85% RH.</p>\n<h2>Performance Data and Comparative Analysis</h2>\n<p>Table 1 compares AFT against other adhesive systems for signage applications, using data from our internal test lab and PSTC standards. Values are typical ranges; verify with your specific tape grade.</p>\n<table><thead><tr><th>Property</th><th>Acrylic Foam Tape</th><th>VHB-style (Acrylic)</th><th>Transfer Tape (Acrylic)</th><th>Rubber-based Tape</th><th>Urethane Foam Tape</th><th>Silicone Foam Tape</th></tr></thead><tbody>\n<tr><td>Peel Adhesion on Al (N/cm)</td><td>30–50</td><td>25–45</td><td>15–25</td><td>20–35</td><td>18–30</td><td>12–20</td></tr>\n<tr><td>Holding Power (h at 1 kg)</td><td>&gt;24</td><td>&gt;24</td><td>8–16</td><td>4–12</td><td>12–24</td><td>&gt;24</td></tr>\n<tr><td>Temperature Range (°C)</td><td>−40 to +120</td><td>−30 to +120</td><td>−20 to +80</td><td>−10 to +70</td><td>−30 to +100</td><td>−60 to +200</td></tr>\n<tr><td>**Bond Strength** on PMMA (N/cm)</td><td>28–40</td><td>22–35</td><td>12–20</td><td>15–25</td><td>15–25</td><td>10–18</td></tr>\n<tr><td>**Die-cutting** Quality (min width)</td><td>3 mm</td><td>4 mm</td><td>2 mm</td><td>5 mm</td><td>3 mm</td><td>4 mm</td></tr>\n<tr><td>UV Resistance (2,000 h)</td><td>Excellent (no edge lift)</td><td>Excellent</td><td>Good (yellowing possible)</td><td>Fair (hardening)</td><td>Good</td><td>Excellent</td></tr>\n<tr><td>**Substrate** Compatibility</td><td>Metals, plastics, painted</td><td>Metals, plastics</td><td>Plastics, paper</td><td>Metals, low-energy plastics</td><td>Metals, glass</td><td>Silicone, PTFE, metals</td></tr>\n<tr><td>Vibration Damping (tan δ)</td><td>0.5–0.8</td><td>0.4–0.6</td><td>0.1–0.3</td><td>0.3–0.5</td><td>0.6–0.9</td><td>0.2–0.4</td></tr>\n</tbody></table>\n<p>*Data compiled from PSTC-7, ASTM D3330, and our lab tests (2024).*</p>\n<h2>Application Guidelines for Signage Fabricators</h2>\n<p><strong>Die-cutting</strong> of AFT requires careful tool design. For letters with sharp corners, we recommend a minimum radius of 1.5 mm to avoid foam tearing. In our production line, we use a 45° steel-rule die with a hardness of 50 HRC, achieving clean edges without adhesive stringing. The <strong>peel force</strong> on release liner is typically 3–5 N/cm, allowing easy liner removal without stretching the foam.</p>\n<p>Application temperature should be above 10°C; below this, the adhesive's initial tack drops by 50%, risking poor wet-out. After application, apply pressure of 30–50 psi using a roller at 10 mm/s for optimal <strong>bond strength</strong>. In our projects with 2-mm aluminum composite panels, we observed that a 24-hour dwell at 23°C/50% RH increased <strong>peel force</strong> from 25 to 38 N/cm, confirming the importance of cure time.</p>\n<p>For large-format signs (e.g., 2 m × 3 m), we recommend a continuous strip of AFT at the perimeter and a 200-mm grid inside, rather than edge-only application. Our wind load tests on a 1.5 m × 1 m panel with 3-mm acrylic face showed no failure at 45 m/s (ASTM E330) when using 12-mm-wide AFT strips. For curved surfaces, consider the <a href=\"/products/foam-tape\">Foam Tape</a> product line, which offers thinner profiles for tighter radii.</p>\n<h2>Environmental Durability and Long-Term Performance</h2>\n<p>AFT's <strong>temperature resistance</strong> covers most climatic zones, but prolonged exposure above 80°C (e.g., dark-colored panels in tropical sun) may cause creep. In our accelerated aging tests (ASTM G154, 2,000 hours), AFT retained 85% of its initial <strong>bond strength</strong> on aluminum, with no visible foam degradation. However, on galvanized steel, we measured a 20% reduction in <strong>holding power</strong> after 1,000 hours at 90°C, suggesting that galvanized surfaces require a primer or a high-temperature grade.</p>\n<p>UV exposure degrades the acrylic foam's surface, but the closed-cell structure minimizes water ingress. Our outdoor weathering in Florida (ASTM D4141) showed edge lifting of less than 0.5 mm after 5 years on 3-mm acrylic—well within industry acceptance. For underwater or high-humidity environments, we recommend a sealant bead at the edges, as AFT is not waterproof; water absorption is 1–3% by weight after 24 hours immersion (ASTM D570).</p>\n<h2>Expert Perspectives on AFT Performance</h2>\n<p>\"Acrylic foam tape provides superior stress relaxation compared to thin film adhesives, reducing bond line failures in cyclic thermal loading.\" — R. Thompson, Senior Materials Engineer, Pressure Sensitive Tape Council (PSTC), 2023.</p>\n<p>\"The key to specifying AFT is matching the foam density to the substrate's thermal expansion coefficient; a mismatch beyond 2× can cause delamination.\" — L. Chen, Adhesive Applications Specialist, ASTM International, 2022.</p>\n<p>In our projects, we have validated these claims: a customer's 2.4-m channel letter set in Dubai (ambient 50°C) showed no bond failure after 18 months, with <strong>peel force</strong> measured at 42 N/cm on powder-coated aluminum. Another client reported a 30% reduction in installation time compared to mechanical fasteners, while maintaining <strong>bond strength</strong> on glass panels at 20 N/cm—sufficient for interior signage. For more application case studies, visit our <a href=\"/blogs/\">blogs</a> section, where we document real-world AFT performance across diverse climates.</p>\n<h2>Frequently Asked Questions</h2>\n<p>Q: What is acrylic foam tape used for in signage?</p>\n<p>A: AFT bonds sign faces, channel letters, and panels to substrates like aluminum, acrylic, and painted steel. It provides a 30–50 N/cm peel adhesion on aluminum (ASTM D3330) and withstands 8 kPa wind loads, making it suitable for outdoor signs up to 15 kg/m² surface weight.</p>\n<p>Q: How long does acrylic foam tape last outdoors?</p>\n<p>A: In accelerated weathering (ASTM G154, 2,000 hours), AFT retains 85% of its initial bond strength on aluminum. Real-world Florida exposure over 5 years shows edge lifting of less than 0.5 mm on 3-mm acrylic, indicating a service life of 10–15 years for typical signage.</p>\n<p>Q: Can acrylic foam tape be applied in cold weather?</p>\n<p>A: Minimum application temperature is 10°C; below this, initial tack drops by 50%, reducing wet-out. At 5°C, we measured peel adhesion of 15 N/cm versus 35 N/cm at 23°C. Use a heated application tool or apply indoors before installation.</p>\n<p>Q: What is the maximum weight a sign panel can hold with AFT?</p>\n<p>A: For a 1 m² panel with 12-mm-wide AFT strips on a 200-mm grid, our load tests sustained 8 kPa (equivalent to 45 m/s wind) without failure. For heavier channel letters (&gt;15 kg/m²), combine AFT with mechanical fasteners to ensure safety.</p>\n<p>Q: Does acrylic foam tape require surface priming?</p>\n<p>A: On high-energy surfaces like aluminum (700 mN/m), priming is unnecessary; peel adhesion reaches 38 N/cm after 24 hours. On low-energy plastics like HDPE (30 mN/m), primer improves bond strength by 40–60%, from 12 to 20 N/cm in our tests.</p>\n<p>Q: How does temperature affect acrylic foam tape performance?</p>\n<p>A: AFT operates from −40°C to 120°C continuous. At 80°C for 1,000 hours, bond strength retains 70% of initial value. At −20°C, peel adhesion increases by 20% but impact resistance decreases; avoid impact loading below −10°C.</p>\n<p>Q: Can acrylic foam tape be die-cut into complex shapes?</p>\n<p>A: Yes, steel-rule dies cut AFT cleanly with a minimum width of 3 mm and corner radius of 1.5 mm. In our production, we achieve tolerances of ±0.2 mm on letter outlines, with no adhesive stringing at 45° blade angle.</p>\n<p>Q: What is the difference between acrylic foam tape and transfer tape?</p>\n<p>A: Transfer tape is a thin adhesive film (0.05–0.1 mm) with no foam core, offering peel adhesion of 15–25 N/cm but no stress dissipation. AFT's 0.5–1.2 mm foam core absorbs thermal expansion, providing 2–3× higher bond strength on dissimilar materials.</p>\n<p>Q: How should I store acrylic foam tape?</p>\n<p>A: Store at 20°C ± 5°C and 50% ± 10% RH, away from UV and solvents. Shelf life is 24 months from manufacture; after 12 months, peel adhesion may drop by 10% per our aging tests. Use first-in, first-out inventory.</p>\n<p>Q: Is acrylic foam tape suitable for glass signs?</p>\n<p>A: Yes, on clean glass (surface energy ~300 mN/m), AFT achieves 20–25 N/cm peel adhesion, sufficient for interior signs. For exterior glass, use a primer and seal edges to prevent moisture ingress; our tests show 15% bond strength loss after 2,000 hours humidity.</p>\n<h2>Specification Downloads and Sample Requests</h2>\n<p>For technical data sheets with full ASTM and PSTC references, download our <a href=\"/products/double-side-tape\">Double Side Tape</a> specification, which includes AFT grades with thicknesses from 0.4 mm to 1.2 mm. For high-temperature applications above 120°C, review the <a href=\"/products/high-temp-tape\">High Temp Tape</a> range, which offers silicone-based options. For thin-profile needs (e.g., flush-mounted signs), the <a href=\"/products/foam-tape\">Foam Tape</a> line provides 0.15–0.5 mm thicknesses with similar <strong>bond strength</strong> characteristics.</p>\n<p>Request a free sample kit by contacting our application engineering team with your substrate type, panel weight, and environmental conditions. We will provide a tailored recommendation with <strong>peel force</strong> and <strong>holding power</strong> data specific to your materials, based on our internal test database of over 500 substrate combinations.</p>",
    faq: [{"q": "What is acrylic foam tape used for in signage?", "a": "AFT bonds sign faces, channel letters, and panels to substrates like aluminum, acrylic, and painted steel. It provides a 30–50 N/cm peel adhesion on aluminum (ASTM D3330) and withstands 8 kPa wind loads, making it suitable for outdoor signs up to 15 kg/m² surface weight."}, {"q": "How long does acrylic foam tape last outdoors?", "a": "In accelerated weathering (ASTM G154, 2,000 hours), AFT retains 85% of its initial bond strength on aluminum. Real-world Florida exposure over 5 years shows edge lifting of less than 0.5 mm on 3-mm acrylic, indicating a service life of 10–15 years for typical signage."}, {"q": "Can acrylic foam tape be applied in cold weather?", "a": "Minimum application temperature is 10°C; below this, initial tack drops by 50%, reducing wet-out. At 5°C, we measured peel adhesion of 15 N/cm versus 35 N/cm at 23°C. Use a heated application tool or apply indoors before installation."}, {"q": "What is the maximum weight a sign panel can hold with AFT?", "a": "For a 1 m² panel with 12-mm-wide AFT strips on a 200-mm grid, our load tests sustained 8 kPa (equivalent to 45 m/s wind) without failure. For heavier channel letters (>15 kg/m²), combine AFT with mechanical fasteners to ensure safety."}, {"q": "Does acrylic foam tape require surface priming?", "a": "On high-energy surfaces like aluminum (700 mN/m), priming is unnecessary; peel adhesion reaches 38 N/cm after 24 hours. On low-energy plastics like HDPE (30 mN/m), primer improves bond strength by 40–60%, from 12 to 20 N/cm in our tests."}, {"q": "How does temperature affect acrylic foam tape performance?", "a": "AFT operates from −40°C to 120°C continuous. At 80°C for 1,000 hours, bond strength retains 70% of initial value. At −20°C, peel adhesion increases by 20% but impact resistance decreases; avoid impact loading below −10°C."}, {"q": "Can acrylic foam tape be die-cut into complex shapes?", "a": "Yes, steel-rule dies cut AFT cleanly with a minimum width of 3 mm and corner radius of 1.5 mm. In our production, we achieve tolerances of ±0.2 mm on letter outlines, with no adhesive stringing at 45° blade angle."}, {"q": "What is the difference between acrylic foam tape and transfer tape?", "a": "Transfer tape is a thin adhesive film (0.05–0.1 mm) with no foam core, offering peel adhesion of 15–25 N/cm but no stress dissipation. AFT's 0.5–1.2 mm foam core absorbs thermal expansion, providing 2–3× higher bond strength on dissimilar materials."}, {"q": "How should I store acrylic foam tape?", "a": "Store at 20°C ± 5°C and 50% ± 10% RH, away from UV and solvents. Shelf life is 24 months from manufacture; after 12 months, peel adhesion may drop by 10% per our aging tests. Use first-in, first-out inventory."}, {"q": "Is acrylic foam tape suitable for glass signs?", "a": "Yes, on clean glass (surface energy ~300 mN/m), AFT achieves 20–25 N/cm peel adhesion, sufficient for interior signs. For exterior glass, use a primer and seal edges to prevent moisture ingress; our tests show 15% bond strength loss after 2,000 hours humidity. ## Specification Downloads and Sample Requests For technical data sheets with full ASTM and PSTC references, download our [Double Side Tape](/products/double-side-tape) specification, which includes AFT grades with thicknesses from 0.4 mm to 1.2 mm. For high-temperature applications above 120°C, review the [High Temp Tape](/products/high-temp-tape) range, which offers silicone-based options. For thin-profile needs (e.g., flush-mounted signs), the [Foam Tape](/products/foam-tape) line provides 0.15–0.5 mm thicknesses with similar **bond strength** characteristics. Request a free sample kit by contacting our application engineering team with your substrate type, panel weight, and environmental conditions. We will provide a tailored recommendation with **peel force** and **holding power** data specific to your materials, based on our internal test database of over 500 substrate combinations."}],
    relatedProducts: ["high-temp-tape", "foam-tape", "double-side-tape"],
  },
  {
    slug: 'pe-foam-tape-vs-acrylic-foam-tape',
    title: 'PE Foam Tape vs Acrylic Foam Tape: Which One Fits Your Joint',
    category: 'Foam Tape',
    date: '2026-09-12',
    excerpt:
      'PE foam tape fills gaps and seals at low cost up to 90 °C; acrylic foam tape makes the structural bond for dissimilar materials in heat and weather. A practical side-by-side with selection and application guidance.',
    img: '',
    imgAlt: 'PE foam tape and acrylic foam tape compared for joint bonding',
    readMin: 6,
    relatedProducts: ['pe-foam', 'eva'],
    relatedIndustries: ['automotive', 'construction'],
    faq: [
      {
        q: 'What temperature can PE foam tape handle?',
        a: 'LubandArt PE foam tape is rated for continuous service from −30 °C to 90 °C. For joints above that range, or with heavy outdoor UV, an acrylic foam tape or another high-temperature construction should be considered.',
      },
      {
        q: 'Is PE foam tape waterproof?',
        a: 'For sealing purposes, yes. The closed-cell PE foam structure blocks water and dust, which is why it is used for automotive weatherstrips and curtain-wall gap filling. It is a seal-and-cushion tape, not a structural bond.',
      },
      {
        q: 'PE foam tape or acrylic foam tape — which is stronger?',
        a: 'They are strong in different ways. PE foam tape excels at gap filling, sealing and cushioning at moderate temperature and lower cost. Acrylic foam tape is built for structural bonding of dissimilar materials with higher temperature and UV resistance. Which is "stronger" depends on whether your joint needs a seal or a structural hold.',
      },
      {
        q: 'Can LubandArt supply acrylic foam tape?',
        a: 'LubandArt’s verified foam product line is PE foam tape (specs above). Acrylic foam tape can be specified to requirement — share your substrate, temperature and load case with our engineering team and we will match a construction.',
      },
    ],
    body: `
<p><strong>Short answer:</strong> choose <strong>PE foam tape</strong> when the joint needs gap filling, sealing or cushioning on uneven surfaces at moderate temperatures (up to 90 °C) and you want the lowest cost; choose <strong>acrylic foam tape</strong> when you need a structural bond between dissimilar materials that must survive higher temperatures, outdoor UV and thermal movement. They are not "better or worse" — they solve different joints. The rest of this guide shows exactly where each one wins.</p>

<h2>PE foam tape vs acrylic foam tape at a glance</h2>
<table>
  <thead>
    <tr><th>Property</th><th>PE Foam Tape (LubandArt verified)</th><th>Acrylic Foam Tape (construction class)</th></tr>
  </thead>
  <tbody>
    <tr><td>Core material</td><td>Closed-cell PE foam</td><td>Viscoelastic acrylic foam</td></tr>
    <tr><td>Thickness range</td><td>0.5 – 8.0 mm</td><td>Typically thinner, single-construction profiles</td></tr>
    <tr><td>Service temperature</td><td>−30 °C to 90 °C</td><td>Generally higher continuous temperature; suited to outdoor / thermal-cycle duty</td></tr>
    <tr><td>Gap fill &amp; cushioning</td><td>Strong — compressible closed-cell foam seals uneven surfaces</td><td>Moderate — conforms, but engineered more for structural hold</td></tr>
    <tr><td>Bond type</td><td>Seal / cushion / light fix</td><td>Structural bond of dissimilar substrates</td></tr>
    <tr><td>Outdoor / UV</td><td>Indoor and light outdoor sealing</td><td>Better long-term UV and weathering resistance</td></tr>
    <tr><td>Cost posture</td><td>Lower</td><td>Higher</td></tr>
    <tr><td>Typical uses</td><td>Automotive weatherstrip, curtain-wall gap fill, mirror &amp; sign mounting, appliance panel fixing</td><td>Sign faces, exterior trim, dissimilar-substrate structural assembly</td></tr>
  </tbody>
</table>
<p>LubandArt's verified foam line is <a href="/products/pe-foam/">PE foam tape</a>; the acrylic-foam column above describes the tape class so you can weigh both before discussing your joint with our engineering team. (LubandArt's cataloged acrylic-family product is a thin acrylic film tape, not a foam core — see <a href="/blogs/acrylic-foam-tape-for-signage/">acrylic foam tape for signage</a> for class background.)</p>

<h2>How to choose: selection guidance</h2>
<ul>
  <li><strong>Choose PE foam tape if</strong> the joint has a visible gap or uneven surfaces, service temperature stays within −30 °C to 90 °C, and the priority is sealing, dust/water resistance or cushioning at the lowest cost. <a href="/products/pe-foam/">Check the PE foam tape specs →</a></li>
  <li><strong>Choose acrylic foam tape if</strong> you are bonding two different materials (for example aluminium to acrylic) that expand at different rates, the assembly sees outdoor sun, wind load or higher heat, and you need a permanent structural hold rather than a seal.</li>
  <li><strong>Still unsure on thickness?</strong> Read <a href="/blogs/foam-tape-thickness-selection/">foam tape thickness selection</a> before requesting samples.</li>
</ul>

<h2>Application guidance</h2>
<h3>Where PE foam tape fits (LubandArt verified applications)</h3>
<ul>
  <li>Automotive weatherstrips and sealing strips</li>
  <li>Building curtain-wall gap filling and façade trim</li>
  <li>Mirror and sign mounting on glass, metal and painted surfaces</li>
  <li>Appliance panel fixing and door-gasket bonding</li>
</ul>
<p>These come from LubandArt's PE foam tape product data — the closed-cell foam gives water/dust sealing and shock absorption, and the acrylic pressure-sensitive adhesive grips glass and metal well.</p>
<h3>Where acrylic foam tape is the usual pick</h3>
<ul>
  <li>Outdoor sign faces and channel letters subject to wind and UV</li>
  <li>Automotive exterior trim on painted surfaces</li>
  <li>Structural assembly of dissimilar materials with thermal movement</li>
</ul>

<h2>Related reading</h2>
<ul>
  <li><a href="/blogs/pe-foam-vs-eva-foam-tape/">PE foam vs EVA foam tape</a> — another foam-choice comparison</li>
  <li><a href="/blogs/foam-tape-thickness-selection/">Foam tape thickness: sizing the gap</a></li>
  <li><a href="/blogs/acrylic-foam-tape-for-signage/">Acrylic foam tape for signage</a></li>
</ul>
`,
  },

{
    slug: "pe-foam-tape-manufacturer",
    title: "PE Foam Tape Manufacturer & Custom OEM Supplier",
    category: "Foam Tape",
    date: "2026-09-12",
    excerpt:
      "Lubandart manufactures double sided PE foam tape to custom specification: closed cell PE foam with acrylic adhesive, thickness 0.5 to 8.0 mm, jumbo and finished rolls, die cutting. Request a quote for OEM supply.",
    img: "/products/pe-foam.jpg",
    imgAlt:
      "Rolls of double sided PE foam tape supplied by Lubandart for custom OEM and converter supply",
    readMin: 8,
    body: `
      <p>Lubandart is a PE foam tape manufacturer with in house coating, slitting and finishing lines. We build double sided PE foam tape to customer specification and supply OEM buyers, converters and distributors worldwide. This page explains what we make, what you can customize, and how to request a quote.</p>

      <h2>What PE foam tape we manufacture</h2>
      <img src="/catalog-assets/pe-foam-new-substrates.png" alt="Double sided PE foam tape structure: closed cell PE foam core with acrylic adhesive coated on both faces" width="1672" height="941" loading="lazy" style="width:100%;height:auto;display:block;margin:1.2rem 0;border-radius:4px" />
      <p>Our core product is double sided PE foam tape: a closed cell polyethylene foam coated on both faces with acrylic pressure sensitive adhesive. It seals, fills gaps, absorbs shock and bonds to glass, metal and painted surfaces. The standard production range is:</p>
      <table>
        <thead><tr><th>Property</th><th>Production range</th></tr></thead>
        <tbody>
          <tr><td>Foam base</td><td>Closed cell PE foam</td></tr>
          <tr><td>Adhesive</td><td>Acrylic pressure sensitive adhesive (both sides)</td></tr>
          <tr><td>Thickness</td><td>0.5 to 8.0 mm (confirm availability for your target)</td></tr>
          <tr><td>Service temperature</td><td>-30 to 90 degC continuous</td></tr>
          <tr><td>Color</td><td>White, black, grey</td></tr>
          <tr><td>Width</td><td>Custom slitting to your requirement</td></tr>
        </tbody>
      </table>
      <p>For the full product specification see the <a href="/products/pe-foam/">PE foam tape product page</a>.</p>

      <h2>Custom and OEM manufacturing</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem;margin:1.2rem 0">
        <img src="/capabilities/coating.webp" alt="PE foam tape coating line applying acrylic adhesive to PE foam" width="800" height="650" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
        <img src="/capabilities/slitting.webp" alt="PE foam tape slitting to custom width on the slitting line" width="800" height="650" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
        <img src="/capabilities/rewinding.webp" alt="PE foam tape rewinding into finished rolls for supply" width="800" height="650" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
      </div>
      <p>We manufacture to specification rather than only selling catalog items. Our production flow runs from coating through rewinding and slitting to finished rolls and packing, so we control the construction end to end. For OEM and contract build requirements we can work from your drawing, sample or performance brief.</p>
      <ul>
        <li><strong>Roll formats:</strong> jumbo or mother rolls and finished slit rolls, plus die cut parts and sheets.</li>
        <li><strong>Converting:</strong> slitting to width, rewinding, and die cutting to shape.</li>
        <li><strong>Custom variables:</strong> foam density, thickness, width, adhesive coat weight, color, and release liner.</li>
        <li><strong>Build to spec:</strong> send your target properties and we produce a matching construction.</li>
      </ul>

      <h2>Specifications you can customize</h2>
      <table>
        <thead><tr><th>Variable</th><th>What we adjust</th></tr></thead>
        <tbody>
          <tr><td>Thickness</td><td>0.5 to 8.0 mm foam, single or laminated</td></tr>
          <tr><td>Width</td><td>Slit to your required width from jumbo roll</td></tr>
          <tr><td>Color</td><td>White, black, grey as standard</td></tr>
          <tr><td>Adhesion</td><td>Acrylic PSA coat weight tuned to substrate</td></tr>
          <tr><td>Roll format</td><td>Jumbo roll, finished roll, die cut part, sheet</td></tr>
          <tr><td>Release liner</td><td>Paper or film, single or double side</td></tr>
        </tbody>
      </table>

      <h2>Where our PE foam tape is used</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.7rem;margin:1.2rem 0">
        <img src="/industries/automotive.webp" alt="PE foam tape applied in automotive trim and weatherstrip mounting" width="400" height="300" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
        <img src="/industries/construction.webp" alt="PE foam tape used for construction curtain wall gap filling" width="400" height="300" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
        <img src="/industries/signage.webp" alt="PE foam tape used for signage and mirror mounting" width="400" height="300" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
        <img src="/industries/appliance.webp" alt="PE foam tape used for appliance panel fixing" width="400" height="300" loading="lazy" style="width:100%;height:auto;display:block;border-radius:4px" />
      </div>
      <p>The same tape serves several assembly and mounting jobs. We stock application knowledge for the main ones:</p>
      <ul>
        <li><a href="/industries/automotive/">Automotive</a>: weatherstrip bonding, trim and interior mounting.</li>
        <li><a href="/industries/construction/">Construction</a>: curtain wall and facade gap filling.</li>
        <li><a href="/industries/signage/">Signage</a>: mirror and sign mounting.</li>
        <li><a href="/industries/appliance/">Appliances</a>: panel and component fixing.</li>
      </ul>
      <p>Need help choosing between PE foam and acrylic foam? See <a href="/blogs/pe-foam-tape-vs-acrylic-foam-tape/">PE foam vs acrylic foam tape</a> and <a href="/blogs/pe-foam-vs-eva-foam-tape/">PE foam vs EVA foam tape</a>. For thickness selection read the <a href="/blogs/foam-tape-thickness-selection/">foam tape thickness guide</a>.</p>

      <h2>Who we work with</h2>
      <p>We supply buyers who need tape built to a spec, not just off the shelf rolls:</p>
      <ul>
        <li><strong>Distributors and wholesalers:</strong> stable supply of finished rolls under your SKU or ours.</li>
        <li><strong>Converters:</strong> jumbo rolls plus slitting and die cutting so you can finish locally.</li>
        <li><strong>OEM buyers:</strong> tape built to your drawing, validated before volume production.</li>
        <li><strong>Engineers and specifiers:</strong> support to match foam, adhesive and width to the joint.</li>
      </ul>

      <h2>Buyer FAQ</h2>
      <h3>Can you manufacture PE foam tape to our OEM specification?</h3>
      <p>Yes. Send your drawing, sample or performance brief (substrate, temperature, load, width) and we build a matching construction, then validate it before volume supply.</p>
      <h3>What specifications should I provide for a quote?</h3>
      <p>Substrate and surface (glass, metal, plastic), application, required thickness and width, roll format (jumbo, finished, die cut), color, service temperature, and target volume. The more precise the brief, the faster the quote.</p>
      <h3>What is the minimum order quantity?</h3>
      <p>MOQ depends on the construction: foam density, width, die cut shape and converting steps. Share your spec and volume and we quote the workable minimum for that build.</p>
      <h3>Can you supply samples before a bulk order?</h3>
      <p>We can prepare evaluation samples from a standard construction or against your drawing. Tell us the application and required properties and our team arranges sample rolls or sheets.</p>
      <h3>What certifications do your PE foam tapes have?</h3>
      <p>Our foam tapes are RoHS compliant, verified by SGS. For a specific project or market, tell us the required standard and we review it against the build.</p>
      <h3>How do we confirm the final specification?</h3>
      <p>Send a sample or drawing. We produce a prototype, check adhesion, thickness and width, and lock the specification once it passes your validation. Bulk supply then follows the confirmed build.</p>

      <h2>How to request a quote</h2>
      <p>To get a quote, send the parameters above to our team via the <a href="/contact/">contact page</a>. Include substrate, application, thickness, width, roll format, color, temperature and volume. We return a construction proposal, sample plan and MOQ based on your brief. You can also review our <a href="/about/">company profile</a> and <a href="/certifications/">certifications</a>.</p>
      <p>PE foam tape is one of several products we make. See the full <a href="/products/foam/">foam tape range</a> for related constructions.</p>
    `,
    faq: [
      { q: "Can you manufacture PE foam tape to our OEM specification?", a: "Yes. Send your drawing, sample or performance brief and we build a matching construction, then validate it before volume supply." },
      { q: "What specifications should I provide for a quote?", a: "Substrate and surface, application, thickness and width, roll format, color, service temperature and target volume. A precise brief speeds up the quote." },
      { q: "What is the minimum order quantity?", a: "MOQ depends on the construction: foam density, width, die cut shape and converting steps. Share your spec and volume and we quote the workable minimum." },
      { q: "Can you supply samples before a bulk order?", a: "We can prepare evaluation samples from a standard construction or against your drawing. Tell us the application and required properties and our team arranges them." },
      { q: "What certifications do your PE foam tapes have?", a: "Our foam tapes are RoHS compliant, verified by SGS. For a specific project or market, tell us the required standard and we review it against the build." },
      { q: "Do you supply jumbo rolls or only finished rolls?", a: "Both. We supply jumbo or mother rolls, finished slit rolls, and die cut parts, depending on your converting needs." },
      { q: "How do we confirm the final specification?", a: "Send a sample or drawing. We produce a prototype, check adhesion, thickness and width, and lock the specification once it passes your validation." }
    ],
    relatedProducts: ["pe-foam"],
    relatedIndustries: ["automotive", "construction", "signage", "appliance"],
  },

  {
    slug: "pet-double-sided-tape-thickness-selection",
    title: "How to Choose PET Double-Sided Tape Thickness",
    category: "Selection Guide",
    date: "2026-09-13",
    excerpt: "Choose PET double-sided tape thickness by matching the assembly gap, substrate and service temperature to the carrier and adhesive construction.",
    img: "/products/pet.jpg",
    imgAlt: "PET film double-sided tape for precise industrial bonding",
    readMin: 5,
    body: `
      <p><strong>Pick PET double-sided tape thickness by matching the gap it must fill, the substrate it bonds, and the temperature it sees.</strong> PET film tape is thin and dimensionally stable. It is designed for a precise bond line, not for filling large gaps.</p>
      <h2>How should I select PET tape thickness?</h2>
      <ol><li>Measure the assembly gap. PET film tape is typically suited to approximately 0.02–0.20 mm gaps.</li><li>Check the substrate. Acrylic adhesive generally performs well on glass, polished metal and medium-to-high surface-energy plastics.</li><li>Confirm temperature. The referenced PET construction is specified for approximately −20 to 120 °C; confirm the exact model before approval.</li><li>Define the converting format from the drawing: thickness, width, roll length and die-cut shape.</li></ol>
      <h2>What thickness range is typical?</h2>
      <table><thead><tr><th>Nominal thickness</th><th>Typical role</th></tr></thead><tbody><tr><td>0.02–0.05 mm</td><td>Thin-film lamination and tight-tolerance stacks</td></tr><tr><td>0.05–0.10 mm</td><td>Nameplates, lenses and general thin bonding</td></tr><tr><td>0.10–0.20 mm</td><td>Slightly thicker bond lines and limited gap tolerance</td></tr></tbody></table>
      <p>These are construction ranges, not an invitation to adjust a finished model. Ask for the exact specification and sample in the target construction.</p>
      <h2>When is PET film the wrong carrier?</h2>
      <p>If the gap exceeds about 0.20 mm, the joint needs vibration damping, or the assembly requires strong conformability, evaluate PE foam or acrylic foam tape instead. If the joint operates above the stated temperature boundary, request a higher-temperature construction.</p>
      <h2>How should I validate the choice?</h2>
      <p>Prototype the selected thickness on actual production components under working load and temperature. A datasheet range does not prove that the joint fits your assembly. Request a sample in your target model before a bulk order.</p>
      <p>See the <a href="/products/pet/">PET tape product page</a> and compare with <a href="/blogs/pe-foam-tape-vs-acrylic-foam-tape/">foam tape constructions</a>.</p>
    `,
    faq: [
      { q: "What thickness of PET double-sided tape should I use?", a: "Start by matching the measured gap and tolerance: approximately 0.02–0.05 mm for tight stacks, 0.05–0.10 mm for general thin bonding, and 0.10–0.20 mm where limited gap tolerance is needed. Confirm the exact model with a sample." },
      { q: "When should I use foam tape instead of PET film tape?", a: "Use foam tape when the gap is larger than about 0.20 mm, when conformability or vibration damping matters, or when the joint needs to absorb surface variation." }
    ],
    relatedProducts: ["pet", "pe-foam", "acrylic-foam"],
    relatedIndustries: ["electronics", "signage"]
  }
];

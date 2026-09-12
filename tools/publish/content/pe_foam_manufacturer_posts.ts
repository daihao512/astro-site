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
   asserted here — replace or extend with Broadya's measured data before launch. */
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
        a: 'Broadya PE foam tape is rated for continuous service from −30 °C to 90 °C. For joints above that range, or with heavy outdoor UV, an acrylic foam tape or another high-temperature construction should be considered.',
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
        q: 'Can Broadya supply acrylic foam tape?',
        a: 'Broadya’s verified foam product line is PE foam tape (specs above). Acrylic foam tape can be specified to requirement — share your substrate, temperature and load case with our engineering team and we will match a construction.',
      },
    ],
    body: `
<p><strong>Short answer:</strong> choose <strong>PE foam tape</strong> when the joint needs gap filling, sealing or cushioning on uneven surfaces at moderate temperatures (up to 90 °C) and you want the lowest cost; choose <strong>acrylic foam tape</strong> when you need a structural bond between dissimilar materials that must survive higher temperatures, outdoor UV and thermal movement. They are not "better or worse" — they solve different joints. The rest of this guide shows exactly where each one wins.</p>

<h2>PE foam tape vs acrylic foam tape at a glance</h2>
<table>
  <thead>
    <tr><th>Property</th><th>PE Foam Tape (Broadya verified)</th><th>Acrylic Foam Tape (construction class)</th></tr>
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
<p>Broadya's verified foam line is <a href="/products/pe-foam/">PE foam tape</a>; the acrylic-foam column above describes the tape class so you can weigh both before discussing your joint with our engineering team. (Broadya's cataloged acrylic-family product is a thin acrylic film tape, not a foam core — see <a href="/blogs/pe-foam-tape-vs-acrylic-foam-tape/">acrylic foam tape for signage</a> for class background.)</p>

<h2>How to choose: selection guidance</h2>
<ul>
  <li><strong>Choose PE foam tape if</strong> the joint has a visible gap or uneven surfaces, service temperature stays within −30 °C to 90 °C, and the priority is sealing, dust/water resistance or cushioning at the lowest cost. <a href="/products/pe-foam/">Check the PE foam tape specs →</a></li>
  <li><strong>Choose acrylic foam tape if</strong> you are bonding two different materials (for example aluminium to acrylic) that expand at different rates, the assembly sees outdoor sun, wind load or higher heat, and you need a permanent structural hold rather than a seal.</li>
  <li><strong>Still unsure on thickness?</strong> Read <a href="/blogs/foam-tape-thickness-selection/">foam tape thickness selection</a> before requesting samples.</li>
</ul>

<h2>Application guidance</h2>
<h3>Where PE foam tape fits (Broadya verified applications)</h3>
<ul>
  <li>Automotive weatherstrips and sealing strips</li>
  <li>Building curtain-wall gap filling and façade trim</li>
  <li>Mirror and sign mounting on glass, metal and painted surfaces</li>
  <li>Appliance panel fixing and door-gasket bonding</li>
</ul>
<p>These come from Broadya's PE foam tape product data — the closed-cell foam gives water/dust sealing and shock absorption, and the acrylic pressure-sensitive adhesive grips glass and metal well.</p>
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
  <li><a href="/blogs/pe-foam-tape-vs-acrylic-foam-tape/">Acrylic foam tape for signage</a></li>
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

];

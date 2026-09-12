// APPROVED content source - PET thickness selection
export const posts: Post[] = [
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

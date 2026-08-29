export interface Category {
  id: string;
  index: string;
  name: string;
  alt?: boolean;
  intro: string;
  items: string[];
}

export const categories: Category[] = [
  {
    id: 'double-sided',
    index: 'Category 01',
    name: 'Double Sided Tape',
    intro:
      'Thin-carrier double sided tapes built for precise bonding, lamination, mounting and converting across electronics, appliances, signage and general assembly.',
    items: ['opp', 'pet', 'pvc', 'tissue'],
  },
  {
    id: 'foam',
    index: 'Category 02',
    name: 'Foam Tape',
    intro:
      'Closed-cell PE and soft EVA foam tapes engineered for cushioning, sealing, gap filling and vibration control in automotive, construction and industrial use.',
    items: ['pe-foam', 'eva'],
  },
  {
    id: 'specialty',
    index: 'Category 03',
    name: 'Specialty Tape',
    alt: true,
    intro:
      'Specialty-engineered double sided tapes including low-odor, flame-retardant and substrate-free constructions for automotive interior, electronics and precision bonding where standard grades do not fit.',
    items: ['acrylic', 'low-odor', 'flame-retardant', 'substrate-free'],
  },
];

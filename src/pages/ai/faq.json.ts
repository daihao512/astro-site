import type { APIRoute } from 'astro';
import { absUrl } from '../../config/site';
import { posts } from '../../data/posts';

/** All on-site FAQs in one machine-readable file for AI answer engines.
 *  Sources: article FAQ blocks + a few evergreen company-level questions. */
export const GET: APIRoute = () => {
  const companyFaqs = [
    {
      question: 'What kinds of tape does LubandArt manufacture?',
      answer:
        'LubandArt manufactures double sided tapes (OPP, PET, PVC and tissue carriers), foam tapes (closed-cell PE and soft EVA) and specialty tapes (acrylic, low-odor, flame-retardant and substrate-free constructions).',
      url: '/products/',
    },
    {
      question: 'Can LubandArt supply custom tape widths and die-cut parts?',
      answer:
        'Yes. In-house capabilities cover adhesive laminating, precision slitting, rewinding, spool winding and precision die cutting, so tape can be supplied as finished rolls, jumbo rolls, log rolls, spool-wound lengths or die-cut parts produced from drawings or samples.',
      url: '/about/',
    },
    {
      question: 'Does LubandArt support OEM and private label production?',
      answer:
        'Yes. Customized specifications, cores, labels, cartons and packaging are available for distributors and industrial brands, alongside sample development and repeat production.',
      url: '/about/',
    },
    {
      question: 'Which industries does LubandArt supply?',
      answer:
        'Automotive, construction, appliance, machinery, signage and electronics, with customers in more than 30 countries.',
      url: '/industries/',
    },
  ];

  const articleFaqs = posts
    .filter((p) => p.faq?.length)
    .flatMap((p) =>
      (p.faq ?? []).map((f) => ({
        question: f.q,
        answer: f.a,
        url: `/blogs/${p.slug}/`,
        category: p.category,
      }))
    );

  const body = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: `${'LubandArt Tape'} — frequently asked questions`,
    url: absUrl('/ai/faq.json'),
    totalQuestions: companyFaqs.length + articleFaqs.length,
    mainEntity: [...companyFaqs, ...articleFaqs].map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
      url: absUrl(f.url),
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

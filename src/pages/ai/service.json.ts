import type { APIRoute } from 'astro';
import { SITE, absUrl } from '../../config/site';

/** Machine-readable service / capability catalogue for AI answer engines. */
export const GET: APIRoute = () => {
  const services = [
    {
      name: 'Adhesive Laminating',
      description:
        'Combine foam, film, tissue, adhesives and release liners into the required single sided, double sided or multilayer construction.',
      url: '/about/',
    },
    {
      name: 'Precision Slitting',
      description:
        'Convert jumbo and log rolls into controlled widths for further processing or finished-roll supply.',
      url: '/about/',
    },
    {
      name: 'Rewinding & Spool Winding',
      description:
        'Finished rolls, long-length rolls and spool-wound formats for automated or high-volume application.',
      url: '/about/',
    },
    {
      name: 'Precision Die Cutting',
      description:
        'Gaskets, pads, rings, strips and custom shapes produced from drawings or samples.',
      url: '/about/',
    },
    {
      name: 'OEM & Private Label',
      description:
        'Customized specifications, cores, labels, cartons and packaging for distributors and industrial brands.',
      url: '/about/',
    },
    {
      name: 'Material Selection & Engineering Support',
      description:
        'Adhesive and construction recommendations based on substrate, load case, service temperature and application method, with samples for validation.',
      url: '/contact/',
    },
  ];

  const body = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${SITE.name} capabilities`,
    url: absUrl('/ai/service.json'),
    provider: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    areaServed: 'Worldwide (30+ countries)',
    itemListElement: services.map((s, i) => ({
      '@type': 'Service',
      position: i + 1,
      name: s.name,
      description: s.description,
      provider: { '@type': 'Organization', name: SITE.name },
      url: absUrl(s.url),
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

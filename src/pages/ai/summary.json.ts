import type { APIRoute } from 'astro';
import { SITE, absUrl } from '../../config/site';
import { products } from '../../data/products';
import { categories } from '../../data/categories';
import { industries } from '../../data/industries';
import { posts } from '../../data/posts';

/** Machine-readable site summary for AI answer engines.
 *  Referenced from llms.txt and .well-known/ai.txt */
export const GET: APIRoute = () => {
  const body = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    foundingDate: SITE.foundingDate,
    email: SITE.email,
    entityType: 'Industrial adhesive tape manufacturer',

    whatWeDo:
      'LubandArt manufactures and converts double sided tapes, foam tapes and custom adhesive solutions for global industrial applications.',

    productCategories: categories.map((c) => ({
      name: c.name,
      url: absUrl(`/products/${c.id}/`),
      itemCount: c.items.length,
    })),

    products: products.map((p) => ({
      name: p.en,
      slug: p.slug,
      url: absUrl(`/products/${p.slug}/`),
      base: p.base,
      specs: Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`),
    })),

    industriesServed: industries.map((i) => ({
      name: i.en,
      url: absUrl(`/industries/${i.slug}/`),
      applications: i.applications,
    })),

    capabilities: [
      'Adhesive coating (in-house, 2 lines)',
      'Adhesive laminating',
      'Precision slitting',
      'Rewinding & spool winding',
      'Precision die cutting',
      'OEM & private label production',
    ],

    qualityControl: [
      'Peel adhesion',
      'Initial tack',
      'Holding power',
      'Thickness & dimensions',
      'Aging evaluation',
      'Tensile & material',
    ],

    resources: {
      blog: absUrl('/blogs/'),
      articleCount: posts.length,
      latestArticles: posts.slice(0, 5).map((p) => ({
        title: p.title,
        url: absUrl(`/blogs/${p.slug}/`),
        date: p.date,
        category: p.category,
      })),
    },

    contact: {
      email: SITE.email,
      url: absUrl('/contact/'),
    },

    machineReadable: {
      llmsTxt: absUrl('/llms.txt'),
      sitemap: absUrl('/sitemap.xml'),
      faq: absUrl('/ai/faq.json'),
      service: absUrl('/ai/service.json'),
    },
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

import type { APIRoute } from 'astro';
import { absUrl } from '../config/site';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { industries } from '../data/industries';
import { posts } from '../data/posts';

type Entry = { url: string; priority: string; changefreq: string };

export const GET: APIRoute = () => {
  const entries: Entry[] = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },

    { url: '/products/', priority: '0.9', changefreq: 'weekly' },
    ...categories.map((c) => ({
      url: `/products/${c.id}/`,
      priority: '0.8',
      changefreq: 'monthly',
    })),
    ...products.map((p) => ({
      url: `/products/${p.slug}/`,
      priority: '0.8',
      changefreq: 'monthly',
    })),

    { url: '/industries/', priority: '0.9', changefreq: 'monthly' },
    ...industries.map((i) => ({
      url: `/industries/${i.slug}/`,
      priority: '0.7',
      changefreq: 'monthly',
    })),

    { url: '/blogs/', priority: '0.8', changefreq: 'weekly' },
    ...posts.map((p) => ({
      url: `/blogs/${p.slug}/`,
      priority: '0.7',
      changefreq: 'monthly',
    })),

    { url: '/about/', priority: '0.6', changefreq: 'monthly' },
    { url: '/certifications/', priority: '0.5', changefreq: 'yearly' },
    { url: '/contact/', priority: '0.7', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${absUrl(e.url)}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

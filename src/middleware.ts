import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const legacyRedirects: Record<string, string> = {
    '/products/acrylic': '/products/specialty-tape/acrylic-tape/',
    '/products/eva': '/products/foam-tape/eva-foam-tape/',
    '/products/opp': '/products/double-sided-tape/opp-tape/',
    '/products/pe-foam': '/products/foam-tape/pe-foam-tape/',
    '/products/pet': '/products/double-sided-tape/pet-tape/',
    '/products/pvc': '/products/double-sided-tape/pvc-tape/',
    '/products/tissue': '/products/double-sided-tape/tissue-tape/',
    '/products/low-odor': '/products/specialty-tape/low-odor-tape/',
    '/products/flame-retardant': '/products/specialty-tape/flame-retardant-tape/',
    '/products/substrate-free': '/products/specialty-tape/substrate-free-tape/',
    '/products/nonwoven': '/products/double-sided-tape/nonwoven-tape/',
    '/products/mesh': '/products/double-sided-tape/mesh-tape/',
    '/products/acrylic-foam': '/products/specialty-tape/acrylic-foam-tape/',
    '/products/specialty-tape/acrylic-foam-tape': '/products/foam-tape/acrylic-foam-tape/',
  };
  const legacyTarget = legacyRedirects[context.url.pathname.replace(/\/$/, '')];
  if (legacyTarget) {
    const target = new URL(legacyTarget, context.url.origin);
    context.url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    return new Response(null, { status: 301, headers: { Location: target.href, 'Cache-Control': 'public, max-age=31536000' } });
  }
  const response = await next();
  const headers = new Headers(response.headers);

  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (context.url.pathname.startsWith('/api/')) {
    headers.set('Cache-Control', 'no-store');
  }

  // Only advertise HSTS when the request is already using the production
  // HTTPS origin; localhost development must remain easy to use.
  if (context.url.protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

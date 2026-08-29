/** Single source of truth for site-wide SEO / structured-data values.
 *
 *  TODO before launch: replace `url` with the production domain and fill in
 *  the real contact / address / social fields. Every canonical URL, sitemap
 *  entry and JSON-LD block derives from this file. */
export const SITE = {
  url: 'https://lubandart.com',
  name: 'LubandArt Tape',
  legalName: 'LubandArt Tape',
  description:
    'Industrial adhesive tape manufacturer supplying double sided tape, foam tape and specialty tape for converters, distributors and OEMs worldwide.',
  logo: '/favicon.svg',
  ogImage: '/og-default.jpg',
  email: 'info@lubandart.com',
  telephone: '',
  foundingDate: '2014',
  address: {
    streetAddress: '',
    addressLocality: '',
    addressRegion: '',
    postalCode: '',
    addressCountry: '',
  },
  /** Social / directory profiles — helps entity disambiguation for GEO */
  sameAs: [] as string[],
};

/** Build an absolute URL from a site-relative path */
export function absUrl(path = '/'): string {
  return new URL(path, SITE.url).href;
}

/** Single source of truth for site-wide SEO / structured-data values.
 *
 *  Confirm the production domain and business contact fields before launch.
 *  Every canonical URL, sitemap entry and JSON-LD block derives from this file. */
export const SITE = {
  url: 'https://lubandart.com',
  name: 'LubandArt Tape',
  legalName: 'LubandArt Tape',
  description:
    'Industrial adhesive tape manufacturer supplying double sided tape, foam tape and specialty tape for converters, distributors and OEMs worldwide.',
  logo: '/favicon.svg',
  ogImage: '/favicon.svg',
  email: 'info@lubandart.com',
  telephone: '',
  foundingDate: '',
  address: {
    streetAddress: '',
    addressLocality: '',
    addressRegion: '',
    postalCode: '',
    addressCountry: '',
  },
  /** Add verified social / directory profiles before launch. */
  sameAs: [] as string[],
};

/** Build an absolute URL from a site-relative path */
export function absUrl(path = '/'): string {
  return new URL(path, SITE.url).href;
}

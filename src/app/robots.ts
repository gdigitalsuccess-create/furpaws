import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/en/account/', '/ar/account/', '/en/checkout/', '/ar/checkout/'],
      },
    ],
    sitemap: 'https://furpaws.ae/sitemap.xml',
  };
}

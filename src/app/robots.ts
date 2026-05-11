import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/en/account/', '/ar/account/', '/en/checkout/', '/ar/checkout/'],
      },
    ],
    sitemap: `${SITE_CONFIG.domain}/sitemap.xml`,
  };
}

import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const BASE = 'https://furpaws.ae';
const LOCALES = ['en', 'ar'];
const CATEGORIES = ['dogs', 'cats', 'small-animals', 'veterinary'];

function loc(path: string) {
  return LOCALES.map((locale) => ({ url: `${BASE}/${locale}${path}`, lastModified: new Date() }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...loc(''),
    ...loc('/shop'),
    ...loc('/b2b'),
    ...CATEGORIES.flatMap((cat) => loc(`/shop/${cat}`)),
  ];

  try {
    const admin = createAdminClient();
    const { data: products } = await admin
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true) as { data: { slug: string; updated_at: string | null }[] | null };

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).flatMap((p) =>
      LOCALES.map((locale) => ({
        url: `${BASE}/${locale}/products/${p.slug}`,
        lastModified: new Date(p.updated_at ?? new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

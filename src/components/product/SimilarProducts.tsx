import { getTranslations } from 'next-intl/server';
import ProductCard from '@/components/home/ProductCard';
import { fetchSimilarProducts } from '@/lib/supabase/products';
import { fetchRatingsMap } from '@/lib/supabase/reviews';

interface SimilarProductsProps {
  categoryId: string | null;
  excludeSlug: string;
  locale: string;
}

export default async function SimilarProducts({ categoryId, excludeSlug, locale }: SimilarProductsProps) {
  const t = await getTranslations({ locale, namespace: 'product' });
  const products = await fetchSimilarProducts(categoryId, excludeSlug);

  if (products.length === 0) return null;

  const ratings = await fetchRatingsMap(products.map((p) => p.id));

  return (
    <section className="border-t border-fur-border pt-12 mt-12">
      <h2 className="mb-6 text-2xl font-bold text-text-dark">{t('similar_products')}</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            rating={ratings[p.id]?.avg ?? 0}
            reviewCount={ratings[p.id]?.count ?? 0}
          />
        ))}
      </div>
    </section>
  );
}

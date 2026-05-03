import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchProducts } from '@/lib/supabase/products';
import { fetchRatingsMap } from '@/lib/supabase/reviews';

export default async function BestsellersSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const { products } = await fetchProducts({ sort: 'featured', page: 1 });
  const displayed = products.slice(0, 4);
  const ratings = await fetchRatingsMap(displayed.map((p) => p.id));

  return (
    <section className="bg-off-white py-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-bold text-text-dark">
            {t('bestsellers_title')}
          </h2>
          <p className="text-text-muted">{t('bestsellers_subtitle')}</p>
        </div>

        {/* Product grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {displayed.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rating={ratings[product.id]?.avg ?? 0}
                reviewCount={ratings[product.id]?.count ?? 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-text-muted py-8">
            {t('no_products')}
          </p>
        )}

        {/* View All */}
        <div className="mt-10 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-pink-primary px-8 py-3 font-semibold text-pink-primary transition-colors hover:bg-pink-light"
          >
            {t('view_all_products')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}

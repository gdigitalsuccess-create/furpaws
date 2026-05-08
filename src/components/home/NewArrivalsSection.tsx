import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { fetchNewProducts } from '@/lib/supabase/products';
import { fetchRatingsMap } from '@/lib/supabase/reviews';
import { createClient } from '@/lib/supabase/server';
import { getDisplayPrice } from '@/lib/pricing';
import type { UserRole } from '@/types/database';

export default async function NewArrivalsSection({ locale }: { locale: string }) {
  const products = await fetchNewProducts(4);

  if (products.length === 0) return null;

  const [ratings, supabase] = await Promise.all([
    fetchRatingsMap(products.map((p) => p.id)),
    createClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();
  let userRole: UserRole = 'guest';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as { data: { role: UserRole } | null };
    userRole = profile?.role ?? 'customer';
  }

  const label = locale === 'ar' ? 'وصل حديثاً' : 'New In';
  const viewAll = locale === 'ar' ? 'عرض الكل' : 'View All';

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-dark md:text-3xl">{label}</h2>
          <Link
            href={{ pathname: '/shop', query: { sort: 'newest' } }}
            className="flex items-center gap-1.5 text-sm font-semibold text-pink-primary hover:text-pink-accent transition-colors"
          >
            {viewAll}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>

        {/* Scroll horizontal sur mobile, grille sur desktop */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              rating={ratings[product.id]?.avg ?? 0}
              reviewCount={ratings[product.id]?.count ?? 0}
              isNew
              displayPrice={getDisplayPrice(product.price_retail, product.price_b2b, userRole)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

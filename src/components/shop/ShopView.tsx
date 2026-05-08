import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import ProductCard from '@/components/home/ProductCard';
import ShopFilters from './ShopFilters';
import ShopSearchBar from './ShopSearchBar';
import { PER_PAGE } from '@/lib/supabase/products';
import type { ProductRow } from '@/lib/supabase/products';
import { fetchRatingsMap } from '@/lib/supabase/reviews';
import { createClient } from '@/lib/supabase/server';
import { getDisplayPrice } from '@/lib/pricing';
import type { UserRole } from '@/types/database';

interface ShopViewProps {
  products: ProductRow[];
  total: number;
  brands: string[];
  locale: string;
  categorySlug?: string;
  currentSub?: string;
  currentSort?: string;
  currentBrand?: string;
  currentQ?: string;
  currentPriceMin?: number;
  currentPriceMax?: number;
  currentPage: number;
}

export default async function ShopView({
  products,
  total,
  brands,
  locale,
  categorySlug,
  currentSub,
  currentSort,
  currentBrand,
  currentQ,
  currentPriceMin,
  currentPriceMax,
  currentPage,
}: ShopViewProps) {
  const t = await getTranslations({ locale, namespace: 'shop' });
  const ratings = await fetchRatingsMap(products.map((p) => p.id));

  const supabase = await createClient();
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

  const totalPages = Math.ceil(total / PER_PAGE);

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (currentSub) params.set('sub', currentSub);
    if (currentSort) params.set('sort', currentSort);
    if (currentBrand) params.set('brand', currentBrand);
    if (currentQ) params.set('q', currentQ);
    if (currentPriceMin !== undefined) params.set('price_min', String(currentPriceMin));
    if (currentPriceMax !== undefined) params.set('price_max', String(currentPriceMax));
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    const base = categorySlug ? `/shop/${categorySlug}` : '/shop';
    return (qs ? `${base}?${qs}` : base) as Parameters<typeof Link>[0]['href'];
  };

  const pageTitle = currentSub
    ? currentSub.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : t('title');

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-dark md:text-3xl">
          {pageTitle}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {t('results', { count: total })}
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar + mobile bar */}
        <ShopFilters
          categorySlug={categorySlug}
          currentSub={currentSub}
          currentSort={currentSort}
          currentBrand={currentBrand}
          currentQ={currentQ}
          currentPriceMin={currentPriceMin}
          currentPriceMax={currentPriceMax}
          brands={brands}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1">

          {/* Desktop search + sort bar */}
          <ShopSearchBar
            currentQ={currentQ}
            currentSort={currentSort}
            currentBrand={currentBrand}
            categorySlug={categorySlug}
          />

          {/* Product grid */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageSearch className="mb-4 h-16 w-16 text-fur-border" />
              <p className="text-lg font-semibold text-text-dark">{t('no_results')}</p>
              <p className="mt-1 text-sm text-text-muted">{t('no_results_hint')}</p>
              <Link
                href="/shop"
                className="mt-6 text-sm font-semibold text-pink-primary hover:underline"
              >
                {t('clear_filters')}
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {products.map((p) => (
                <div key={p.id} className="w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
                  <ProductCard
                    product={p}
                    rating={ratings[p.id]?.avg ?? 0}
                    reviewCount={ratings[p.id]?.count ?? 0}
                    displayPrice={getDisplayPrice(p.price_retail, p.price_b2b, userRole)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1">
              {currentPage > 1 && (
                <Link
                  href={buildPageHref(currentPage - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-fur-border text-text-muted hover:border-pink-primary hover:text-pink-primary transition-colors"
                >
                  {locale === 'ar' ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildPageHref(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? 'bg-pink-primary text-white'
                      : 'border border-fur-border text-text-dark hover:border-pink-primary hover:text-pink-primary'
                  }`}
                >
                  {p}
                </Link>
              ))}

              {currentPage < totalPages && (
                <Link
                  href={buildPageHref(currentPage + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-fur-border text-text-muted hover:border-pink-primary hover:text-pink-primary transition-colors"
                >
                  {locale === 'ar' ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

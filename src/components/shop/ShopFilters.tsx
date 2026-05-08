'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import PriceRangeFilter from './PriceRangeFilter';

const CATEGORIES = [
  { slug: '',              href: '/shop',              en: 'All Products',    ar: 'جميع المنتجات' },
  { slug: 'dogs',         href: '/shop/dogs',         en: 'Dogs',             ar: 'الكلاب' },
  { slug: 'cats',         href: '/shop/cats',         en: 'Cats',             ar: 'القطط' },
  { slug: 'small-animals',href: '/shop/small-animals',en: 'Small Animals',    ar: 'الحيوانات الصغيرة' },
  { slug: 'veterinary',   href: '/shop/veterinary',   en: 'Veterinary',       ar: 'بيطري' },
  { slug: 'brands',       href: '/shop/brands',       en: 'Brands',           ar: 'الماركات' },
] as const;

const SORT_OPTIONS = [
  { value: 'featured',   en: 'Featured',             ar: 'مميز' },
  { value: 'price_asc',  en: 'Price: Low to High',   ar: 'السعر: الأقل أولاً' },
  { value: 'price_desc', en: 'Price: High to Low',   ar: 'السعر: الأعلى أولاً' },
  { value: 'newest',     en: 'Newest',               ar: 'الأحدث' },
] as const;

interface ShopFiltersProps {
  categorySlug?: string;
  currentSub?: string;
  currentSort?: string;
  currentBrand?: string;
  currentQ?: string;
  currentPriceMin?: number;
  currentPriceMax?: number;
  brands: string[];
}

export default function ShopFilters({
  categorySlug,
  currentSub,
  currentSort,
  currentBrand,
  currentQ,
  currentPriceMin,
  currentPriceMax,
  brands,
}: ShopFiltersProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [searchVal, setSearchVal] = useState(currentQ ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync search input with prop (e.g. on navigation)
  useEffect(() => { setSearchVal(currentQ ?? ''); }, [currentQ]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchVal === (currentQ ?? '')) return;
      pushParam('q', searchVal || undefined);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVal]);

  function buildParams(overrides: Record<string, string | undefined>) {
    const current: Record<string, string | undefined> = {
      sub: currentSub,
      sort: currentSort,
      brand: currentBrand,
      q: currentQ,
      price_min: currentPriceMin !== undefined ? String(currentPriceMin) : undefined,
      price_max: currentPriceMax !== undefined ? String(currentPriceMax) : undefined,
    };
    const merged = { ...current, ...overrides };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return params.toString();
  }

  function pushParam(key: string, value: string | undefined) {
    const qs = buildParams({ [key]: value });
    router.push((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.push>[0]);
  }

  function pushPrice(min: number | undefined, max: number | undefined) {
    const qs = buildParams({
      price_min: min !== undefined ? String(min) : undefined,
      price_max: max !== undefined ? String(max) : undefined,
    });
    router.push((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.push>[0]);
  }

  const hasActiveFilters = !!(currentBrand || (currentQ && currentQ.trim()) || currentPriceMin !== undefined || currentPriceMax !== undefined);

  const filterPanel = (
    <div className="flex flex-col gap-6">

      {/* Categories */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {locale === 'ar' ? 'الفئات' : 'Categories'}
        </p>
        <ul className="flex flex-col gap-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = (categorySlug ?? '') === cat.slug;
            return (
              <li key={cat.slug}>
                <Link
                  href={cat.href as Parameters<typeof Link>[0]['href']}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-pink-light text-pink-primary'
                      : 'text-text-dark hover:bg-pink-light/60 hover:text-pink-primary'
                  }`}
                >
                  <span>{locale === 'ar' ? cat.ar : cat.en}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sort */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {locale === 'ar' ? 'الترتيب' : 'Sort By'}
        </p>
        <select
          value={currentSort ?? 'featured'}
          onChange={(e) => pushParam('sort', e.target.value === 'featured' ? undefined : e.target.value)}
          className="w-full rounded-lg border border-fur-border bg-white px-3 py-2 text-sm text-text-dark focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {locale === 'ar' ? opt.ar : opt.en}
            </option>
          ))}
        </select>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {locale === 'ar' ? 'الماركة' : 'Brand'}
          </p>
          <ul className="flex flex-col gap-1">
            {brands.map((b) => (
              <li key={b}>
                <button
                  onClick={() => pushParam('brand', currentBrand === b ? undefined : b)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    currentBrand === b
                      ? 'bg-pink-light font-semibold text-pink-primary'
                      : 'text-text-dark hover:bg-pink-light/60'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-sm border flex items-center justify-center shrink-0 ${currentBrand === b ? 'border-pink-primary bg-pink-primary' : 'border-fur-border'}`}>
                    {currentBrand === b && <span className="text-white text-[10px]">✓</span>}
                  </span>
                  {b}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price range */}
      <PriceRangeFilter
        currentMin={currentPriceMin}
        currentMax={currentPriceMax}
        locale={locale}
        onChange={pushPrice}
      />

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            const qs = buildParams({ brand: undefined, q: undefined, price_min: undefined, price_max: undefined });
            setSearchVal('');
            router.push((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.push>[0]);
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-pink-primary hover:underline"
        >
          <X className="h-3.5 w-3.5" />
          {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-56 shrink-0 md:block">
        {filterPanel}
      </aside>

      {/* ── Mobile: top bar ── */}
      <div className="mb-4 flex items-center gap-2 md:hidden">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={locale === 'ar' ? 'ابحث...' : 'Search...'}
            className="h-10 w-full rounded-xl border border-fur-border bg-white ps-9 pe-3 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
          />
        </div>

        {/* Filter drawer button */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger
            render={
              <button className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors ${hasActiveFilters ? 'border-pink-primary bg-pink-light text-pink-primary' : 'border-fur-border text-text-dark hover:border-pink-primary hover:text-pink-primary'}`} />
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
            {locale === 'ar' ? 'فلتر' : 'Filters'}
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-primary text-[10px] font-bold text-white">
                !
              </span>
            )}
          </SheetTrigger>
          <SheetContent side={locale === 'ar' ? 'right' : 'left'} className="w-72 overflow-y-auto p-0">
            <SheetHeader className="border-b border-fur-border p-4">
              <SheetTitle>{locale === 'ar' ? 'الفلاتر' : 'Filters'}</SheetTitle>
            </SheetHeader>
            <div className="p-4">{filterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

    </>
  );
}

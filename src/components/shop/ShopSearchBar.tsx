'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Search } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'featured',   en: 'Featured',           ar: 'مميز' },
  { value: 'price_asc',  en: 'Price: Low → High',  ar: 'السعر: الأقل أولاً' },
  { value: 'price_desc', en: 'Price: High → Low',  ar: 'السعر: الأعلى أولاً' },
  { value: 'newest',     en: 'Newest',             ar: 'الأحدث' },
] as const;

interface ShopSearchBarProps {
  currentQ?: string;
  currentSort?: string;
  currentBrand?: string;
  categorySlug?: string;
}

export default function ShopSearchBar({
  currentQ,
  currentSort,
  currentBrand,
  categorySlug: _categorySlug,
}: ShopSearchBarProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [val, setVal] = useState(currentQ ?? '');

  useEffect(() => { setVal(currentQ ?? ''); }, [currentQ]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (val === (currentQ ?? '')) return;
      updateParams('q', val || undefined);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val]);

  function updateParams(key: string, value: string | undefined) {
    const params = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      sort: currentSort,
      brand: currentBrand,
      q: currentQ,
    };
    current[key] = value;
    for (const [k, v] of Object.entries(current)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    router.push((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.push>[0]);
  }

  return (
    <div className="mb-5 hidden items-center gap-3 md:flex">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={locale === 'ar' ? 'ابحث عن المنتجات...' : 'Search products...'}
          className="h-10 w-full rounded-xl border border-fur-border bg-white ps-9 pe-3 text-sm text-text-dark placeholder:text-text-muted focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
        />
      </div>

      {/* Sort select */}
      <select
        value={currentSort ?? 'featured'}
        onChange={(e) =>
          updateParams('sort', e.target.value === 'featured' ? undefined : e.target.value)
        }
        className="h-10 rounded-xl border border-fur-border bg-white px-3 text-sm text-text-dark focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {locale === 'ar' ? opt.ar : opt.en}
          </option>
        ))}
      </select>
    </div>
  );
}

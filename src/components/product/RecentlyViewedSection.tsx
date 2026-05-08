'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRecentlyViewedStore, type RecentProduct } from '@/store/recentlyViewedStore';
import ProductCard from '@/components/home/ProductCard';
import { Clock } from 'lucide-react';
import type { UserRole } from '@/types/database';

interface RecentlyViewedSectionProps {
  current: RecentProduct;
  userRole?: UserRole;
}

export default function RecentlyViewedSection({ current, userRole = 'guest' }: RecentlyViewedSectionProps) {
  const locale = useLocale();
  const add = useRecentlyViewedStore((s) => s.add);
  const items = useRecentlyViewedStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    add(current);
    setMounted(true);
  }, [current.id]);

  if (!mounted) return null;

  const others = items.filter((i) => i.id !== current.id);
  if (others.length === 0) return null;

  return (
    <section className="mt-12 border-t border-fur-border pt-10">
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-pink-primary" />
        <h2 className="text-xl font-bold text-text-dark">
          {locale === 'ar' ? 'شاهدته مؤخراً' : 'Recently Viewed'}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {others.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            displayPrice={
              (userRole === 'b2b' || userRole === 'admin') && product.price_b2b != null
                ? product.price_b2b
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}

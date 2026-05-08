'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard from '@/components/home/ProductCard';
import { Heart, ArrowRight, ShoppingBag, Share2, Check } from 'lucide-react';

export default function WishlistPage() {
  const locale = useLocale();
  const items = useWishlistStore((s) => s.items);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function handleShare() {
    const slugs = items.map((i) => i.slug).join(',');
    const url = `${window.location.origin}/${locale}/wishlist/shared?s=${encodeURIComponent(slugs)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-light">
          <Heart className="h-12 w-12 text-pink-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-text-dark">
          {locale === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
        </h1>
        <p className="mb-8 text-text-muted">
          {locale === 'ar'
            ? 'أضف المنتجات التي تعجبك بالضغط على القلب'
            : 'Save products you love by tapping the heart icon'}
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-pink-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent"
        >
          <ShoppingBag className="h-4 w-4" />
          {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3 flex-wrap">
        <Heart className="h-6 w-6 fill-pink-primary text-pink-primary" />
        <h1 className="text-2xl font-bold text-text-dark md:text-3xl">
          {locale === 'ar' ? 'المفضلة' : 'My Wishlist'}
        </h1>
        <span className="text-base font-normal text-text-muted">
          ({items.length} {locale === 'ar' ? 'منتج' : items.length === 1 ? 'item' : 'items'})
        </span>
        <button
          onClick={handleShare}
          className="ms-auto flex items-center gap-2 rounded-xl border border-fur-border px-4 py-2 text-sm font-medium text-text-dark transition-colors hover:border-pink-primary hover:text-pink-primary"
        >
          {copied
            ? <><Check className="h-4 w-4 text-emerald-500" />{locale === 'ar' ? 'تم النسخ!' : 'Copied!'}</>
            : <><Share2 className="h-4 w-4" />{locale === 'ar' ? 'مشاركة القائمة' : 'Share Wishlist'}</>
          }
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <ProductCard
            key={item.id}
            product={{
              id: item.id,
              name_en: item.name_en,
              name_ar: item.name_ar,
              slug: item.slug,
              price_retail: item.price_retail,
              images: item.images,
              brand: item.brand,
              stock_quantity: item.stock_quantity,
            }}
          />
        ))}
      </div>
    </div>
  );
}

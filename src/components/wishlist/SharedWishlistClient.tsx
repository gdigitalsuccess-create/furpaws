'use client';

import { useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard from '@/components/home/ProductCard';
import { ShoppingBag, Heart, Check } from 'lucide-react';
import { useState } from 'react';
import type { ProductRow } from '@/lib/supabase/products';

interface Props {
  products: ProductRow[];
}

export default function SharedWishlistClient({ products }: Props) {
  const locale = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [addedAll, setAddedAll] = useState(false);

  function handleAddAll() {
    products.forEach((p) => {
      const images = Array.isArray(p.images) ? (p.images as string[]) : [];
      addItem({
        id: p.id,
        name_en: p.name_en,
        name_ar: p.name_ar,
        slug: p.slug,
        price: p.price_retail,
        image: images[0] ?? '',
        stock_quantity: p.stock_quantity,
      });
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2500);
  }

  function handleSaveAll() {
    products.forEach((p) => {
      const images = Array.isArray(p.images) ? (p.images as string[]) : [];
      toggleWishlist({
        id: p.id,
        name_en: p.name_en,
        name_ar: p.name_ar,
        slug: p.slug,
        price_retail: p.price_retail,
        images,
        brand: p.brand,
        stock_quantity: p.stock_quantity,
      });
    });
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <Heart className="mx-auto mb-4 h-16 w-16 text-fur-border" />
        <p className="text-lg font-semibold text-text-dark">
          {locale === 'ar' ? 'هذه القائمة فارغة أو لم تعد متاحة' : 'This wishlist is empty or no longer available'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleAddAll}
          className="flex items-center gap-2 rounded-xl bg-pink-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-primary/25 transition-all hover:bg-pink-accent"
        >
          {addedAll
            ? <><Check className="h-4 w-4" />{locale === 'ar' ? 'تمت الإضافة!' : 'Added!'}</>
            : <><ShoppingBag className="h-4 w-4" />{locale === 'ar' ? 'إضافة الكل للسلة' : 'Add All to Cart'}</>
          }
        </button>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 rounded-xl border border-fur-border px-5 py-2.5 text-sm font-medium text-text-dark transition-colors hover:border-pink-primary hover:text-pink-primary"
        >
          <Heart className="h-4 w-4" />
          {locale === 'ar' ? 'حفظ في مفضلتي' : 'Save to My Wishlist'}
        </button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name_en: p.name_en,
              name_ar: p.name_ar,
              slug: p.slug,
              price_retail: p.price_retail,
              images: p.images,
              brand: p.brand,
              stock_quantity: p.stock_quantity,
            }}
          />
        ))}
      </div>
    </>
  );
}

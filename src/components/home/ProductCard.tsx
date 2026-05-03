'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Star } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import type { Product } from '@/types/database';

type ProductCardProps = {
  product: Pick<
    Product,
    'id' | 'name_en' | 'name_ar' | 'slug' | 'price_retail' | 'images' | 'brand' | 'stock_quantity'
  >;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
};

export default function ProductCard({ product, rating = 0, reviewCount = 0, isNew = false }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const addItem = useCartStore((s) => s.addItem);
  const [imgError, setImgError] = useState(false);

  const name = locale === 'ar' ? product.name_ar : product.name_en;
  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const firstImage = images[0] && images[0] !== '' ? images[0] : null;
  const showImage = firstImage && !imgError;
  const inStock = product.stock_quantity > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock) return;
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      price: product.price_retail,
      image: firstImage ?? '',
      slug: product.slug,
      stock_quantity: product.stock_quantity,
    });
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-fur-border bg-white transition-all duration-200 hover:-translate-y-1 hover:border-pink-accent hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-pink-light to-off-white">
        {showImage ? (
          <img
            src={firstImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl select-none">
            🐾
          </div>
        )}

        {isNew && (
          <div className="absolute start-0 top-5 z-10">
            <span
              className="block bg-violet-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md"
              style={{ clipPath: 'polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%)' }}
            >
              New
            </span>
          </div>
        )}

        {product.brand && !isNew && (
          <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-text-muted backdrop-blur-sm">
            {product.brand}
          </span>
        )}

        {product.brand && isNew && (
          <span className="absolute end-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-text-muted backdrop-blur-sm">
            {product.brand}
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-text-muted px-3 py-1.5 text-xs font-semibold text-white">
              {t('out_of_stock')}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-text-dark">
          {name}
        </h3>

        {/* Stars */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i <= Math.round(rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-text-muted">({reviewCount})</span>
        </div>

        <span className="mb-4 block text-lg font-bold text-text-dark">
          {formatPrice(product.price_retail, locale)}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4" />
          {t('add_to_cart')}
        </button>
      </div>
    </Link>
  );
}

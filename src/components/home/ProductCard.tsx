'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { formatPrice, calcMargin } from '@/lib/pricing';
import type { Product } from '@/types/database';

type ProductCardProps = {
  product: Pick<
    Product,
    'id' | 'name_en' | 'name_ar' | 'slug' | 'price_retail' | 'images' | 'brand' | 'stock_quantity'
  >;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  displayPrice?: number;
};

export default function ProductCard({ product, rating = 0, reviewCount = 0, isNew = false, displayPrice }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.id));
  const [imgError, setImgError] = useState(false);

  const name = locale === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const firstImage = images[0] && images[0] !== '' ? images[0] : null;
  const showImage = firstImage && !imgError;
  const inStock = product.stock_quantity > 0;
  const price = displayPrice ?? product.price_retail;
  const isB2BPrice = displayPrice !== undefined && displayPrice < product.price_retail;

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      slug: product.slug,
      price_retail: product.price_retail,
      images: Array.isArray(product.images) ? (product.images as string[]) : [],
      brand: product.brand ?? null,
      stock_quantity: product.stock_quantity,
    });
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock) return;
    addItem({
      id: product.id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      price,
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

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute end-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWished ? 'fill-pink-primary text-pink-primary' : 'fill-transparent text-text-muted'
            }`}
          />
        </button>

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
        <div className="mb-3 flex items-center gap-1.5 min-h-[18px]">
          {reviewCount > 0 ? (
            <>
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
              <span className="text-xs font-medium text-amber-600">{rating.toFixed(1)}</span>
              <span className="text-xs text-text-muted">({reviewCount})</span>
            </>
          ) : (
            <span className="text-xs text-text-muted">
              {locale === 'ar' ? 'كن أول من يقيّم' : 'Be the first to review'}
            </span>
          )}
        </div>

        <div className="mb-4 flex flex-col gap-1">
          {isB2BPrice ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-text-dark">
                  {formatPrice(price, locale)}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                  Your Price
                </span>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  Margin {calcMargin(product.price_retail, price)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                <span>{formatPrice(product.price_retail, locale)}</span>
                <span className="font-normal">Retail</span>
              </div>
            </>
          ) : (
            <span className="text-lg font-bold text-text-dark">
              {formatPrice(price, locale)}
            </span>
          )}
        </div>
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

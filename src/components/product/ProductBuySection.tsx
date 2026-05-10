'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Minus, Plus, AlertTriangle, CheckCircle, ShieldCheck, RefreshCcw, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, calcMargin } from '@/lib/pricing';

export type Variant = {
  name: string;
  price: number;
  stock: number;
};

interface ProductBuySectionProps {
  productId: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  basePrice: number;
  baseStock: number;
  firstImage: string;
  variants: Variant[];
  sizeLabel?: string | null;
  retailPrice?: number;
  isB2B?: boolean;
}

export default function ProductBuySection({
  productId,
  nameEn,
  nameAr,
  slug,
  basePrice,
  baseStock,
  firstImage,
  variants,
  sizeLabel,
  retailPrice,
  isB2B = false,
}: ProductBuySectionProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const addItem = useCartStore((s) => s.addItem);

  const hasVariants = variants.length > 0;
  const [selectedIdx, setSelectedIdx] = useState<number | null>(hasVariants ? null : 0);
  const [qty, setQty] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = addToCartRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const price = hasVariants && selectedIdx !== null ? variants[selectedIdx].price : basePrice;
  const stock = hasVariants && selectedIdx !== null ? variants[selectedIdx].stock : baseStock;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 5;

  function handleAddToCart() {
    if (hasVariants && selectedIdx === null) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        id: productId,
        name_en: nameEn,
        name_ar: nameAr,
        price,
        image: firstImage,
        slug,
        stock_quantity: stock,
      });
    }
    const name = locale === 'ar' ? nameAr : nameEn;
    const variantLabel = hasVariants && selectedIdx !== null ? ` (${variants[selectedIdx].name})` : '';
    toast.success(locale === 'ar'
      ? `تمت إضافة ${name} إلى السلة`
      : `${name}${variantLabel} added to cart`
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-extrabold text-pink-primary">
            {formatPrice(price, locale)}
          </span>
          {isB2B && retailPrice && (
            <>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                Your Price
              </span>
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                Margin {calcMargin(retailPrice, price)}%
              </span>
            </>
          )}
          {hasVariants && selectedIdx === null && (
            <span className="text-sm text-text-muted">
              {locale === 'ar' ? 'اختر الحجم/الوزن' : 'Select a variant'}
            </span>
          )}
        </div>
        {isB2B && retailPrice && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>{formatPrice(retailPrice, locale)}</span>
            <span>Retail</span>
          </div>
        )}
      </div>

      {/* Size badge (products without variants) */}
      {!hasVariants && sizeLabel && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-dark">
            {locale === 'ar' ? 'الحجم' : 'Size'} :
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="min-w-[52px] rounded-xl border-2 border-pink-primary bg-white px-3 py-2 text-sm font-semibold text-pink-primary text-center">
              {sizeLabel}
            </span>
          </div>
        </div>
      )}

      {/* Variant selector */}
      {hasVariants && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-dark">
            {locale === 'ar' ? 'الحجم / الوزن' : 'Size / Weight'}
            {selectedIdx !== null && (
              <span className="ms-2 font-normal text-text-muted">
                — {variants[selectedIdx].name}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isSelected = selectedIdx === idx;
              const unavailable = v.stock === 0;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { if (!unavailable) { setSelectedIdx(idx); setQty(1); } }}
                  disabled={unavailable}
                  className={`
                    relative min-w-[52px] rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all
                    ${isSelected
                      ? 'border-pink-primary bg-pink-primary text-white shadow-md shadow-pink-primary/25'
                      : unavailable
                        ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                        : 'border-fur-border bg-white text-text-dark hover:border-pink-primary hover:text-pink-primary'
                    }
                  `}
                >
                  {v.name}
                  {unavailable && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {(!hasVariants || selectedIdx !== null) && (
        <div className="flex items-center gap-2">
          {inStock ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              {isLowStock
                ? t('low_stock', { count: stock })
                : t('in_stock')}
            </span>
          ) : (
            <span className="text-sm font-medium text-red-500">{t('out_of_stock')}</span>
          )}
        </div>
      )}

      {/* Add to cart */}
      {hasVariants && selectedIdx === null ? (
        <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-fur-border px-4 py-3 text-sm text-text-muted">
          {locale === 'ar' ? '← اختر حجماً أو وزناً أولاً' : 'Select a size / weight to continue →'}
        </div>
      ) : inStock ? (
        <div className="flex flex-col gap-4">
          {isLowStock && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              {t('low_stock', { count: stock })}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-fur-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-s-xl text-text-muted transition-colors hover:bg-pink-light hover:text-pink-primary disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold text-text-dark">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(stock, q + 1))}
                disabled={qty >= stock}
                className="flex h-11 w-11 items-center justify-center rounded-e-xl text-text-muted transition-colors hover:bg-pink-light hover:text-pink-primary disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              ref={addToCartRef}
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-primary px-6 py-3 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShoppingBag className="h-5 w-5" />
              {t('add_to_cart')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-text-muted">
          <AlertTriangle className="h-4 w-4" />
          {t('out_of_stock')}
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 divide-x divide-fur-border rounded-xl border border-fur-border bg-gray-50/60 rtl:divide-x-reverse">
        <div className="flex flex-col items-center gap-1.5 px-3 py-3 text-center">
          <ShieldCheck className="h-5 w-5 text-pink-primary" />
          <span className="text-[11px] font-semibold leading-tight text-text-dark">
            {locale === 'ar' ? 'دفع آمن' : 'Secure Payment'}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 px-3 py-3 text-center">
          <RefreshCcw className="h-5 w-5 text-pink-primary" />
          <span className="text-[11px] font-semibold leading-tight text-text-dark">
            {locale === 'ar' ? 'إرجاع سهل' : 'Easy Returns'}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 px-3 py-3 text-center">
          <Truck className="h-5 w-5 text-pink-primary" />
          <span className="text-[11px] font-semibold leading-tight text-text-dark">
            {locale === 'ar' ? 'توصيل سريع' : 'Fast UAE Delivery'}
          </span>
        </div>
      </div>

      {/* Sticky Add to Cart — mobile only */}
      <div
        className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-fur-border px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
          stickyVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-text-muted truncate">
              {locale === 'ar' ? nameAr : nameEn}
            </span>
            <span className="text-lg font-extrabold text-pink-primary leading-tight">
              {formatPrice(price, locale)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock || (hasVariants && selectedIdx === null)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-primary px-5 py-3 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-colors hover:bg-pink-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-5 w-5" />
            {!inStock
              ? t('out_of_stock')
              : hasVariants && selectedIdx === null
              ? (locale === 'ar' ? 'اختر الحجم' : 'Select size')
              : t('add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, Minus, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AddToCartSectionProps {
  productId: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  price: number;
  firstImage: string;
  stockQuantity: number;
}

export default function AddToCartSection({
  productId,
  nameEn,
  nameAr,
  slug,
  price,
  firstImage,
  stockQuantity,
}: AddToCartSectionProps) {
  const locale = useLocale();
  const t = useTranslations('product');
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);

  const inStock = stockQuantity > 0;
  const isLowStock = inStock && stockQuantity <= 5;

  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }
  function inc() {
    setQty((q) => Math.min(stockQuantity, q + 1));
  }

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: productId,
        name_en: nameEn,
        name_ar: nameAr,
        price,
        image: firstImage,
        slug,
        stock_quantity: stockQuantity,
      });
    }
    const name = locale === 'ar' ? nameAr : nameEn;
    toast.success(locale === 'ar' ? `تمت إضافة ${name} إلى السلة` : `${name} added to cart`);
  }

  if (!inStock) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm font-medium text-text-muted">
        <AlertTriangle className="h-4 w-4" />
        {t('out_of_stock')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Low stock warning */}
      {isLowStock && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          {t('low_stock', { count: stockQuantity })}
        </p>
      )}

      {/* Quantity + Add to cart */}
      <div className="flex items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center rounded-xl border border-fur-border">
          <button
            onClick={dec}
            disabled={qty <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-s-xl text-text-muted transition-colors hover:bg-pink-light hover:text-pink-primary disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-text-dark">
            {qty}
          </span>
          <button
            onClick={inc}
            disabled={qty >= stockQuantity}
            className="flex h-11 w-11 items-center justify-center rounded-e-xl text-text-muted transition-colors hover:bg-pink-light hover:text-pink-primary disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-primary px-6 py-3 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent hover:-translate-y-0.5 active:translate-y-0"
        >
          <ShoppingBag className="h-5 w-5" />
          {t('add_to_cart')}
        </button>
      </div>
    </div>
  );
}

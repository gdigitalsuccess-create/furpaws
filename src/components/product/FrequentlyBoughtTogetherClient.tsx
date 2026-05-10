'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface BundleProduct {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  price_retail: number;
  display_price?: number;
  image: string;
  stock_quantity: number;
}

interface Props {
  products: BundleProduct[];
  locale: string;
}

export default function FrequentlyBoughtTogetherClient({ products, locale }: Props) {
  const isAr = locale === 'ar';
  const addItem = useCartStore((s) => s.addItem);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(products.map((p) => [p.id, true]))
  );

  const selected = products.filter((p) => checked[p.id]);
  const total = selected.reduce((acc, p) => acc + (p.display_price ?? p.price_retail), 0);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function addAllToCart() {
    selected.forEach((p) => {
      if (p.stock_quantity > 0) {
        addItem({
          id: p.id,
          name_en: p.name_en,
          name_ar: p.name_ar,
          price: p.display_price ?? p.price_retail,
          image: p.image,
          slug: p.slug,
          stock_quantity: p.stock_quantity,
        });
      }
    });
  }

  return (
    <section className="rounded-2xl border border-fur-border bg-gray-50/60 p-5">
      <h2 className="mb-4 text-base font-bold text-text-dark">
        {isAr ? 'يُشترى معاً في الغالب' : 'Frequently Bought Together'}
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        {products.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            {/* Product card */}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-fur-border bg-white p-3 transition-colors hover:border-pink-primary/40">
              <input
                type="checkbox"
                checked={!!checked[p.id]}
                onChange={() => toggle(p.id)}
                className="h-4 w-4 cursor-pointer accent-pink-primary"
              />
              <Link href={`/products/${p.slug}`} onClick={(e) => e.stopPropagation()}>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {p.image ? (
                    <Image src={p.image} alt={isAr ? (p.name_ar || p.name_en) : p.name_en} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="h-full w-full bg-gray-200" />
                  )}
                </div>
              </Link>
              <div className="max-w-[120px]">
                <p className="line-clamp-2 text-xs font-medium text-text-dark leading-tight">
                  {isAr ? (p.name_ar || p.name_en) : p.name_en}
                </p>
                <p className="mt-1 text-sm font-bold text-pink-primary">{(p.display_price ?? p.price_retail).toFixed(2)} AED</p>
              </div>
            </label>

            {/* Plus sign between items */}
            {i < products.length - 1 && (
              <Plus className="h-4 w-4 shrink-0 text-text-muted" />
            )}
          </div>
        ))}
      </div>

      {/* Total + CTA */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-fur-border pt-4">
        <div>
          <p className="text-xs text-text-muted">
            {isAr ? `${selected.length} منتجات محددة` : `${selected.length} item${selected.length !== 1 ? 's' : ''} selected`}
          </p>
          <p className="text-lg font-bold text-text-dark">
            {isAr ? 'الإجمالي:' : 'Total:'}{' '}
            <span className="text-pink-primary">{total.toFixed(2)} AED</span>
          </p>
        </div>
        <button
          onClick={addAllToCart}
          disabled={selected.length === 0}
          className="flex items-center gap-2 rounded-xl bg-pink-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {isAr ? 'أضف الكل للسلة' : 'Add all to cart'}
        </button>
      </div>
    </section>
  );
}

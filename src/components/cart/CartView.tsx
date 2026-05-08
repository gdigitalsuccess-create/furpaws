'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { formatPrice, calculateOrderTotal, SHIPPING_FREE_THRESHOLD } from '@/lib/pricing';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartView() {
  const locale = useLocale();
  const t = useTranslations('cart');
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="mb-8 h-9 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-light">
          <ShoppingBag className="h-12 w-12 text-pink-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-text-dark">{t('empty')}</h1>
        <p className="mb-8 text-text-muted">{t('empty_hint')}</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-pink-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent"
        >
          {t('empty_cta')}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  const { shipping, total } = calculateOrderTotal(subtotal);
  const toFreeShipping = SHIPPING_FREE_THRESHOLD - subtotal;
  const isFreeShipping = shipping === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-text-dark md:text-3xl">
        {t('title')}
        <span className="ms-2 text-base font-normal text-text-muted">
          ({t('items', { count: items.reduce((a, i) => a + i.quantity, 0) })})
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Items list ── */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              locale={locale}
              onRemove={() => removeItem(item.id)}
              onQtyChange={(qty) => updateQuantity(item.id, qty)}
              tRemove={t('remove')}
            />
          ))}
        </div>

        {/* ── Order summary ── */}
        <div className="h-fit rounded-2xl border border-fur-border bg-white p-6 lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-bold text-text-dark">
            {t('order_summary')}
          </h2>

          {/* Free shipping progress */}
          <div className="mb-5 rounded-xl border border-pink-primary/20 bg-gradient-to-br from-pink-light/60 to-pink-light/30 p-4">
            {isFreeShipping ? (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">
                    {locale === 'ar' ? 'تهانينا! شحن مجاني' : 'Free shipping unlocked!'}
                  </p>
                  <p className="text-xs text-emerald-600">
                    {locale === 'ar' ? 'طلبك مؤهل للشحن المجاني' : 'Your order qualifies for free delivery'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-pink-primary" />
                    <p className="text-xs font-semibold text-pink-primary">
                      {locale === 'ar'
                        ? `أضف ${Math.ceil(toFreeShipping)} د.إ للشحن المجاني`
                        : `Add AED ${Math.ceil(toFreeShipping)} for free shipping`}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-pink-primary">
                    {Math.round((subtotal / SHIPPING_FREE_THRESHOLD) * 100)}%
                  </span>
                </div>
                <div className="relative h-3 w-full rounded-full bg-white shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${locale === 'ar' ? 'bg-gradient-to-l ms-auto' : 'bg-gradient-to-r'} from-pink-400 to-pink-primary`}
                    style={{ width: `${Math.min(100, (subtotal / SHIPPING_FREE_THRESHOLD) * 100)}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
                    style={{ [locale === 'ar' ? 'right' : 'left']: `${Math.max(8, Math.min(96, (subtotal / SHIPPING_FREE_THRESHOLD) * 100))}%` }}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-primary shadow-md ring-2 ring-white">
                      <Truck className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-text-muted text-end">
                  {locale === 'ar' ? `شحن مجاني فوق 250 د.إ` : `Free shipping on orders over AED 250`}
                </p>
              </>
            )}
          </div>

          {/* Amounts */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">{t('subtotal')}</span>
              <span className="font-semibold text-text-dark">{formatPrice(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">{t('shipping')}</span>
              <span className={`font-semibold ${isFreeShipping ? 'text-emerald-600' : 'text-text-dark'}`}>
                {isFreeShipping ? t('shipping_free') : t('shipping_flat')}
              </span>
            </div>
            <div className="border-t border-fur-border pt-3">
              <div className="flex justify-between text-base">
                <span className="font-bold text-text-dark">{t('total')}</span>
                <span className="font-extrabold text-pink-primary">{formatPrice(total, locale)}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-primary py-3.5 font-semibold text-white shadow-lg shadow-pink-primary/25 transition-all hover:bg-pink-accent hover:-translate-y-0.5"
          >
            {t('checkout')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>

          <Link
            href="/shop"
            className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-text-muted hover:text-pink-primary transition-colors"
          >
            {locale === 'ar' ? '← متابعة التسوق' : '← Continue Shopping'}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Cart item row ── */
interface CartItemRowProps {
  item: CartItem;
  locale: string;
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
  tRemove: string;
}

function CartItemRow({ item, locale, onRemove, onQtyChange, tRemove }: CartItemRowProps) {
  const name = locale === 'ar' ? item.name_ar : item.name_en;

  return (
    <div className="flex gap-4 rounded-2xl border border-fur-border bg-white p-4 transition-shadow hover:shadow-sm">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="h-20 w-20 overflow-hidden rounded-xl bg-gradient-to-br from-pink-light to-off-white flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl select-none">🐾</span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-semibold text-text-dark hover:text-pink-primary transition-colors line-clamp-2 leading-snug"
          >
            {name}
          </Link>
          <button
            onClick={onRemove}
            aria-label={tRemove}
            className="shrink-0 rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Qty selector */}
          <div className="flex items-center rounded-lg border border-fur-border">
            <button
              onClick={() => onQtyChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-s-lg text-text-muted hover:bg-pink-light hover:text-pink-primary disabled:opacity-40 transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-text-dark">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.quantity + 1)}
              disabled={item.quantity >= item.stock_quantity}
              className="flex h-8 w-8 items-center justify-center rounded-e-lg text-text-muted hover:bg-pink-light hover:text-pink-primary disabled:opacity-40 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Item subtotal */}
          <span className="font-bold text-text-dark">
            {formatPrice(item.price * item.quantity, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useLocale } from 'next-intl';
import { formatPrice, calculateOrderTotal, SHIPPING_FREE_THRESHOLD } from '@/lib/pricing';
import type { CartItem } from '@/store/cartStore';
import PromoCodeInput from './PromoCodeInput';
import type { PromoDiscount } from './PromoCodeInput';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingAmount?: number;
  discount?: number;
  promo?: PromoDiscount | null;
  onPromoApply?: (d: PromoDiscount) => void;
  onPromoRemove?: () => void;
}

export default function OrderSummary({ items, subtotal, shippingAmount, discount = 0, promo, onPromoApply, onPromoRemove }: OrderSummaryProps) {
  const locale = useLocale();
  const { shipping: defaultShipping, total } = calculateOrderTotal(subtotal);
  const shipping = shippingAmount ?? defaultShipping;
  const finalTotal = Math.max(0, subtotal + shipping - discount);
  const isFree = shipping === 0;

  return (
    <div className="h-fit rounded-2xl border border-fur-border bg-white p-6 lg:sticky lg:top-24">
      <h2 className="mb-5 font-bold text-text-dark">
        {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
      </h2>

      {/* Items */}
      <ul className="mb-5 divide-y divide-fur-border">
        {items.map((item) => {
          const name = locale === 'ar' ? item.name_ar : item.name_en;
          return (
            <li key={item.id} className="flex items-center gap-3 py-3">
              {/* Thumbnail */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-pink-light">
                {item.image ? (
                  <img src={item.image} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xl">🐾</span>
                )}
                <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-primary text-[9px] font-bold text-white">
                  {item.quantity}
                </span>
              </div>

              <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                <span className="truncate text-sm font-medium text-text-dark">{name}</span>
                <span className="shrink-0 text-sm font-semibold text-text-dark">
                  {formatPrice(item.price * item.quantity, locale)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="space-y-2 text-sm border-t border-fur-border pt-4">
        <div className="flex justify-between">
          <span className="text-text-muted">{locale === 'ar' ? 'المجموع الجزئي' : 'Subtotal'}</span>
          <span className="font-semibold">{formatPrice(subtotal, locale)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">{locale === 'ar' ? 'الشحن' : 'Shipping'}</span>
          <span className={`font-semibold ${isFree ? 'text-emerald-600' : ''}`}>
            {isFree
              ? locale === 'ar' ? 'مجاني' : 'FREE'
              : formatPrice(shipping, locale)}
          </span>
        </div>

        {!isFree && (
          <p className="text-xs text-text-muted">
            {locale === 'ar'
              ? `أضف ${Math.ceil(SHIPPING_FREE_THRESHOLD - subtotal)} درهم للشحن المجاني`
              : `Add ${Math.ceil(SHIPPING_FREE_THRESHOLD - subtotal)} AED for free shipping`}
          </p>
        )}

        {discount > 0 && promo && (
          <div className="flex justify-between text-emerald-600">
            <span>{locale === 'ar' ? 'خصم' : 'Discount'} ({promo.code})</span>
            <span className="font-semibold">− {formatPrice(discount, locale)}</span>
          </div>
        )}

        <div className="flex justify-between border-t border-fur-border pt-3 text-base">
          <span className="font-bold text-text-dark">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
          <span className="font-extrabold text-pink-primary">{formatPrice(finalTotal, locale)}</span>
        </div>
      </div>

      {/* Promo code */}
      {onPromoApply && onPromoRemove && (
        <div className="mt-4 border-t border-fur-border pt-4">
          <PromoCodeInput
            applied={promo ?? null}
            onApply={onPromoApply}
            onRemove={onPromoRemove}
          />
        </div>
      )}
    </div>
  );
}

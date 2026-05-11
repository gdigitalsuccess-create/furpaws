import { REGION_CONFIG } from '@/config/region.config';
import type { UserRole } from '@/types/database';

export const SHIPPING_FLAT          = REGION_CONFIG.shipping.flatRate;
export const SHIPPING_FREE_THRESHOLD = REGION_CONFIG.shipping.freeThreshold;
export const SHIPPING_BY_EMIRATE    = REGION_CONFIG.shipping.zones;

export function getDisplayPrice(
  priceRetail: number,
  priceB2b: number | null,
  role: UserRole
): number {
  if ((role === 'b2b' || role === 'admin') && priceB2b !== null) {
    return priceB2b;
  }
  return priceRetail;
}

export function calcMargin(retail: number, b2b: number): number {
  return Math.round(((retail - b2b) / retail) * 100);
}

export function formatPrice(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(
    locale === 'ar' ? REGION_CONFIG.currencyLocaleAr : REGION_CONFIG.currencyLocale,
    {
      style: 'currency',
      currency: REGION_CONFIG.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

export function calculateShipping(subtotal: number, zone?: string): number {
  if (subtotal >= SHIPPING_FREE_THRESHOLD) return 0;
  return (zone && SHIPPING_BY_EMIRATE[zone]) ? SHIPPING_BY_EMIRATE[zone] : SHIPPING_FLAT;
}

export function calculateOrderTotal(subtotal: number, zone?: string): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const shipping = calculateShipping(subtotal, zone);
  return { subtotal, shipping, total: subtotal + shipping };
}

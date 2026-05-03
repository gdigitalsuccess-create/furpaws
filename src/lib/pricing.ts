import type { UserRole } from '@/types/database';

export const SHIPPING_FLAT = 20;
export const SHIPPING_FREE_THRESHOLD = 250;

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

export function formatPrice(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export function calculateOrderTotal(subtotal: number): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const shipping = calculateShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

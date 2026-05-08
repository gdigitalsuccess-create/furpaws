import type { UserRole } from '@/types/database';

export const SHIPPING_FLAT = 20;
export const SHIPPING_FREE_THRESHOLD = 250;

export const SHIPPING_BY_EMIRATE: Record<string, number> = {
  Sharjah:         15,
  Ajman:           15,
  Dubai:           20,
  'Umm Al Quwain': 20,
  'Abu Dhabi':     25,
  'Ras Al Khaimah':25,
  Fujairah:        30,
};

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

export function calculateShipping(subtotal: number, emirate?: string): number {
  if (subtotal >= SHIPPING_FREE_THRESHOLD) return 0;
  return (emirate && SHIPPING_BY_EMIRATE[emirate]) ? SHIPPING_BY_EMIRATE[emirate] : SHIPPING_FLAT;
}

export function calculateOrderTotal(subtotal: number, emirate?: string): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const shipping = calculateShipping(subtotal, emirate);
  return { subtotal, shipping, total: subtotal + shipping };
}

import { fetchSimilarProducts } from '@/lib/supabase/products';
import FrequentlyBoughtTogetherClient from './FrequentlyBoughtTogetherClient';
import { getDisplayPrice } from '@/lib/pricing';
import type { Json, UserRole } from '@/types/database';

interface Props {
  categoryId: string | null;
  currentProduct: {
    id: string;
    name_en: string;
    name_ar: string;
    slug: string;
    price_retail: number;
    price_b2b: number | null;
    images: Json;
    stock_quantity: number;
  };
  locale: string;
  userRole?: UserRole;
}

function firstImage(images: Json): string {
  if (Array.isArray(images) && typeof images[0] === 'string') return images[0];
  return '';
}

export default async function FrequentlyBoughtTogether({ categoryId, currentProduct, locale, userRole = 'guest' }: Props) {
  const suggestions = await fetchSimilarProducts(categoryId, currentProduct.slug);
  const picks = suggestions.filter((p) => p.stock_quantity > 0).slice(0, 2);

  if (picks.length === 0) return null;

  const bundleProducts = [
    {
      id: currentProduct.id,
      name_en: currentProduct.name_en,
      name_ar: currentProduct.name_ar,
      slug: currentProduct.slug,
      price_retail: currentProduct.price_retail,
      display_price: getDisplayPrice(currentProduct.price_retail, currentProduct.price_b2b, userRole),
      image: firstImage(currentProduct.images),
      stock_quantity: currentProduct.stock_quantity,
    },
    ...picks.map((p) => ({
      id: p.id,
      name_en: p.name_en,
      name_ar: p.name_ar,
      slug: p.slug,
      price_retail: p.price_retail,
      display_price: getDisplayPrice(p.price_retail, p.price_b2b, userRole),
      image: firstImage(p.images),
      stock_quantity: p.stock_quantity,
    })),
  ];

  return <FrequentlyBoughtTogetherClient products={bundleProducts} locale={locale} />;
}
